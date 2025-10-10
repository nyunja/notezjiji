import { supabase } from '../config/database.js';
import { Item, ItemStatus, UserRole } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { cacheService } from '../config/redis.js';
import { fileProcessingQueue } from '../config/queues.js';
import { nanoid } from 'nanoid';

export class ItemService {
  async createItem(
    uploaderId: string,
    data: {
      title: string;
      description: string;
      course: string;
      year: string;
      tags: string[];
      price: number;
      file_path: string;
      file_size: number;
    }
  ): Promise<Item> {
    const uploadCount = await this.getUserPendingUploads(uploaderId);
    const maxUploads = parseInt(process.env.MAX_UPLOADS_PER_USER || '10');

    if (uploadCount >= maxUploads) {
      throw new AppError(400, `Maximum of ${maxUploads} pending uploads reached`);
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        uploader_id: uploaderId,
        ...data,
        status: ItemStatus.PENDING,
        approval_status: ItemStatus.PENDING
      })
      .select()
      .single();

    if (error || !item) {
      throw new AppError(500, 'Failed to create item');
    }

    await fileProcessingQueue.add('process-file', {
      itemId: item.id,
      filePath: item.file_path
    });

    await cacheService.deletePattern('items:*');

    return item;
  }

  async getUserPendingUploads(uploaderId: string): Promise<number> {
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('uploader_id', uploaderId)
      .in('status', [ItemStatus.PENDING, ItemStatus.DRAFT]);

    return count || 0;
  }

  async getMarketplaceItems(filters: {
    page?: number;
    limit?: number;
    course?: string;
    year?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    search?: string;
    sort?: string;
  } = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const cacheKey = `items:marketplace:${page}:${limit}:${JSON.stringify(filters || {})}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      return cached;
    }

    let query = supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(id, full_name)', { count: 'exact' })
      .eq('approval_status', ItemStatus.APPROVED)
      .is('deleted_at', null);

    if (filters?.course) {
      query = query.eq('course', filters.course);
    }

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: items, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new AppError(500, 'Failed to fetch items');
    }

    const result = {
      items: items || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  async getItemById(itemId: string, userId?: string) {
    const cacheKey = `items:${itemId}`;
    const cached = await cacheService.get(cacheKey);

    if (cached) {
      await this.incrementViewCount(itemId);
      return cached;
    }

    const { data: item, error } = await supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(id, full_name, email)')
      .eq('id', itemId)
      .maybeSingle();

    if (error || !item) {
      throw new AppError(404, 'Item not found');
    }

    if (item.approval_status !== ItemStatus.APPROVED && item.uploader_id !== userId) {
      throw new AppError(403, 'Item not available');
    }

    await cacheService.set(cacheKey, item, 900);
    await this.incrementViewCount(itemId);

    return item;
  }

  async incrementViewCount(itemId: string) {
    await supabase.rpc('increment_view_count', { item_id: itemId });
  }

  async getUploaderStats(uploaderId: string) {
    const { data: items } = await supabase
      .from('items')
      .select('id, view_count, purchase_count')
      .eq('uploader_id', uploaderId);

    const totalViews = items?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
    const totalPurchases = items?.reduce((sum, item) => sum + (item.purchase_count || 0), 0) || 0;

    return {
      totalItems: items?.length || 0,
      totalViews,
      totalPurchases
    };
  }

  async getUserItems(uploaderId: string, status?: ItemStatus) {
    let query = supabase
      .from('items')
      .select('*')
      .eq('uploader_id', uploaderId)
      .is('deleted_at', null);

    if (status) {
      query = query.eq('approval_status', status);
    }

    const { data: items, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new AppError(500, 'Failed to fetch items');
    }

    return items || [];
  }

  async updateItem(
    itemId: string,
    uploaderId: string,
    data: Partial<Pick<Item, 'title' | 'description' | 'course' | 'year' | 'tags' | 'price'>>
  ) {
    const { data: item } = await supabase
      .from('items')
      .select('uploader_id, approval_status')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    if (item.uploader_id !== uploaderId) {
      throw new AppError(403, 'Not authorized');
    }

    if (![ItemStatus.PENDING, ItemStatus.REJECTED].includes(item.approval_status as ItemStatus)) {
      throw new AppError(400, 'Only pending or rejected items can be updated');
    }

    const { data: updatedItem, error } = await supabase
      .from('items')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to update item');
    }

    await cacheService.delete(`items:${itemId}`);
    await cacheService.deletePattern('items:marketplace:*');

    return updatedItem;
  }

  async deleteItem(itemId: string, uploaderId: string) {
    const { data: item } = await supabase
      .from('items')
      .select('uploader_id')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    if (item.uploader_id !== uploaderId) {
      throw new AppError(403, 'Not authorized');
    }

    await supabase
      .from('items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);

    await cacheService.delete(`items:${itemId}`);
    await cacheService.deletePattern('items:marketplace:*');
  }

  async getPendingItems() {
    const { data: items, error } = await supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(id, full_name, email)')
      .eq('approval_status', ItemStatus.PENDING)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError(500, 'Failed to fetch pending items');
    }

    return items || [];
  }

  async approveItem(itemId: string, adminId: string) {
    const { error } = await supabase
      .from('items')
      .update({
        approval_status: ItemStatus.APPROVED,
        status: ItemStatus.APPROVED,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) {
      throw new AppError(500, 'Failed to approve item');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'approve_item',
      entity_type: 'item',
      entity_id: itemId
    });

    await cacheService.delete(`items:${itemId}`);
    await cacheService.deletePattern('items:marketplace:*');
  }

  async rejectItem(itemId: string, adminId: string, reason: string) {
    const { error } = await supabase
      .from('items')
      .update({
        approval_status: ItemStatus.REJECTED,
        status: ItemStatus.REJECTED,
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) {
      throw new AppError(500, 'Failed to reject item');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'reject_item',
      entity_type: 'item',
      entity_id: itemId,
      changes: { reason }
    });

    await cacheService.delete(`items:${itemId}`);
  }
}

export const itemService = new ItemService();
