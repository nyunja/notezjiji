import { supabase } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';
import { emailQueue } from '../config/queues.js';

export class AdminService {
  async getDashboardStats() {
    const [usersResult, itemsResult, purchasesResult, payoutsResult] = await Promise.all([
      supabase.from('users').select('id, role', { count: 'exact' }),
      supabase.from('items').select('approval_status', { count: 'exact' }),
      supabase.from('purchases').select('amount, payment_status'),
      supabase.from('payouts').select('amount, status')
    ]);

    const stats = {
      users: {
        total: usersResult.count || 0,
        buyers: usersResult.data?.filter(u => u.role === 'buyer').length || 0,
        uploaders: usersResult.data?.filter(u => u.role === 'uploader').length || 0,
        admins: usersResult.data?.filter(u => u.role === 'admin').length || 0
      },
      items: {
        total: itemsResult.count || 0,
        pending: itemsResult.data?.filter(i => i.approval_status === 'pending').length || 0,
        approved: itemsResult.data?.filter(i => i.approval_status === 'approved').length || 0,
        rejected: itemsResult.data?.filter(i => i.approval_status === 'rejected').length || 0
      },
      revenue: {
        total: purchasesResult.data
          ?.filter(p => p.payment_status === 'success')
          .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0,
        transactions: purchasesResult.data?.filter(p => p.payment_status === 'success').length || 0
      },
      payouts: {
        pending: payoutsResult.data?.filter(p => p.status === 'pending').length || 0,
        completed: payoutsResult.data?.filter(p => p.status === 'completed').length || 0,
        totalPaid: payoutsResult.data
          ?.filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0
      }
    };

    return stats;
  }

  async getPendingItems(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data: items, error, count } = await supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(id, full_name, email)', { count: 'exact' })
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch pending items');
    }

    return {
      items: items || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async approveItem(itemId: string, adminId: string) {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(email, full_name)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      throw new AppError(404, 'Item not found');
    }

    if (item.approval_status === 'approved') {
      throw new AppError(400, 'Item already approved');
    }

    const { error: updateError } = await supabase
      .from('items')
      .update({
        approval_status: 'approved',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) {
      throw new AppError(500, 'Failed to approve item');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'ITEM_APPROVED',
      resource_type: 'item',
      resource_id: itemId,
      metadata: { itemTitle: item.title }
    });

    await emailQueue.add('item-approved', {
      uploaderId: item.uploader_id,
      itemId: item.id,
      itemTitle: item.title
    });

    logger.info(`Item ${itemId} approved by admin ${adminId}`);

    return { message: 'Item approved successfully' };
  }

  async rejectItem(itemId: string, adminId: string, reason: string) {
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select('*, uploader:users!items_uploader_id_fkey(email, full_name)')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      throw new AppError(404, 'Item not found');
    }

    if (item.approval_status === 'rejected') {
      throw new AppError(400, 'Item already rejected');
    }

    const { error: updateError } = await supabase
      .from('items')
      .update({
        approval_status: 'rejected',
        rejection_reason: reason,
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) {
      throw new AppError(500, 'Failed to reject item');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'ITEM_REJECTED',
      resource_type: 'item',
      resource_id: itemId,
      metadata: { itemTitle: item.title, reason }
    });

    await emailQueue.add('item-rejected', {
      uploaderId: item.uploader_id,
      itemId: item.id,
      itemTitle: item.title,
      reason
    });

    logger.info(`Item ${itemId} rejected by admin ${adminId}`);

    return { message: 'Item rejected successfully' };
  }

  async getAllUsers(page = 1, limit = 20, filters?: { role?: string; search?: string }) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from('users')
      .select('id, email, full_name, role, failed_login_attempts, account_locked_until, created_at', { count: 'exact' });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch users');
    }

    return {
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async updateUserRole(userId: string, newRole: string, adminId: string) {
    if (!['buyer', 'uploader', 'admin'].includes(newRole)) {
      throw new AppError(400, 'Invalid role');
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new AppError(404, 'User not found');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (updateError) {
      throw new AppError(500, 'Failed to update user role');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'USER_ROLE_UPDATED',
      resource_type: 'user',
      resource_id: userId,
      metadata: { oldRole: user.role, newRole, userEmail: user.email }
    });

    logger.info(`User ${userId} role updated from ${user.role} to ${newRole} by admin ${adminId}`);

    return { message: 'User role updated successfully' };
  }

  async unlockUserAccount(userId: string, adminId: string) {
    const { error } = await supabase
      .from('users')
      .update({
        failed_login_attempts: 0,
        account_locked_until: null
      })
      .eq('id', userId);

    if (error) {
      throw new AppError(500, 'Failed to unlock account');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'ACCOUNT_UNLOCKED',
      resource_type: 'user',
      resource_id: userId
    });

    logger.info(`Account ${userId} unlocked by admin ${adminId}`);

    return { message: 'Account unlocked successfully' };
  }

  async getPendingPayouts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data: payouts, error, count } = await supabase
      .from('payouts')
      .select('*, uploader:users!payouts_uploader_id_fkey(id, full_name, email)', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch pending payouts');
    }

    return {
      payouts: payouts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async approvePayout(payoutId: string, adminId: string) {
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*, uploader:users!payouts_uploader_id_fkey(email, full_name)')
      .eq('id', payoutId)
      .single();

    if (payoutError || !payout) {
      throw new AppError(404, 'Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new AppError(400, 'Payout is not pending');
    }

    const { error: updateError } = await supabase
      .from('payouts')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString()
      })
      .eq('id', payoutId);

    if (updateError) {
      throw new AppError(500, 'Failed to approve payout');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'PAYOUT_APPROVED',
      resource_type: 'payout',
      resource_id: payoutId,
      metadata: { amount: payout.amount, uploaderId: payout.uploader_id }
    });

    logger.info(`Payout ${payoutId} approved by admin ${adminId}`);

    return { message: 'Payout approved and processing' };
  }

  async rejectPayout(payoutId: string, adminId: string, reason: string) {
    const { data: payout, error: payoutError } = await supabase
      .from('payouts')
      .select('*, uploader:users!payouts_uploader_id_fkey(email, full_name)')
      .eq('id', payoutId)
      .single();

    if (payoutError || !payout) {
      throw new AppError(404, 'Payout not found');
    }

    if (payout.status !== 'pending') {
      throw new AppError(400, 'Payout is not pending');
    }

    const { error: updateError } = await supabase
      .from('payouts')
      .update({
        status: 'rejected',
        failure_reason: reason,
        processed_at: new Date().toISOString()
      })
      .eq('id', payoutId);

    if (updateError) {
      throw new AppError(500, 'Failed to reject payout');
    }

    await supabase.from('audit_logs').insert({
      user_id: adminId,
      action: 'PAYOUT_REJECTED',
      resource_type: 'payout',
      resource_id: payoutId,
      metadata: { amount: payout.amount, uploaderId: payout.uploader_id, reason }
    });

    await emailQueue.add('payout-rejected', {
      uploaderId: payout.uploader_id,
      payoutId: payout.id,
      amount: payout.amount,
      reason
    });

    logger.info(`Payout ${payoutId} rejected by admin ${adminId}`);

    return { message: 'Payout rejected' };
  }

  async getAuditLogs(page = 1, limit = 50, filters?: { userId?: string; action?: string }) {
    const offset = (page - 1) * limit;
    let query = supabase
      .from('audit_logs')
      .select('*, user:users(email, full_name)', { count: 'exact' });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(500, 'Failed to fetch audit logs');
    }

    return {
      logs: logs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }
}

export const adminService = new AdminService();
