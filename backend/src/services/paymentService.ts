import crypto from 'crypto';
import { supabase } from '../config/database.js';
import { PaymentStatus } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { paymentQueue, emailQueue } from '../config/queues.js';
import { nanoid } from 'nanoid';
import { logger } from '../utils/logger.js';

interface PaystackResponse {
  status: boolean;
  message?: string;
  data: {
    access_code: string;
    authorization_url: string;
    reference: string;
    [key: string]: unknown;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message?: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    [key: string]: unknown;
  };
}

interface PaystackWebhookPayload {
  event: string;
  data: {
    reference: string;
    status: string;
    [key: string]: unknown;
  };
}

export class PaymentService {
  private paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  private paystackBaseUrl = 'https://api.paystack.co';

  async initializePayment(userId: string, userEmail: string, itemIds: string[]) {
    if (!itemIds || itemIds.length === 0) {
      throw new AppError(400, 'No items provided');
    }

    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id, title, price, uploader_id')
      .in('id', itemIds)
      .eq('approval_status', 'approved');

    if (itemsError || !items || items.length === 0) {
      throw new AppError(404, 'Items not found');
    }

    const { data: existingPurchases } = await supabase
      .from('purchases')
      .select('item_id')
      .eq('buyer_id', userId)
      .eq('payment_status', PaymentStatus.SUCCESS)
      .in('item_id', itemIds);

    if (existingPurchases && existingPurchases.length > 0) {
      throw new AppError(400, 'You already own some of these items');
    }

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.price.toString()), 0);
    const reference = `REF-${nanoid(16)}`;

    const response = await fetch(`${this.paystackBaseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userEmail,
        amount: Math.round(totalAmount * 100),
        reference,
        metadata: {
          userId,
          itemIds
        }
      })
    });

    const result = await response.json() as PaystackResponse;

    if (!result.status) {
      logger.error('Paystack initialization failed:', result);
      throw new AppError(500, 'Failed to initialize payment');
    }

    for (const item of items) {
      await supabase.from('purchases').insert({
        buyer_id: userId,
        item_id: item.id,
        amount: item.price,
        payment_status: PaymentStatus.PENDING,
        paystack_reference: reference,
        paystack_access_code: result.data.access_code,
        metadata: { itemIds }
      });
    }

    return {
      reference,
      access_code: result.data.access_code,
      authorization_url: result.data.authorization_url,
      amount: totalAmount
    };
  }

  async verifyPayment(reference: string) {
    const response = await fetch(`${this.paystackBaseUrl}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${this.paystackSecretKey}`
      }
    });

    const result = await response.json() as PaystackVerifyResponse;

    if (!result.status || result.data.status !== 'success') {
      throw new AppError(400, 'Payment verification failed');
    }

    await paymentQueue.add('process-payment', {
      reference,
      paystackData: result.data
    });

    return result.data;
  }

  async handleWebhook(payload: PaystackWebhookPayload, signature: string) {
    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey!)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) {
      throw new AppError(401, 'Invalid signature');
    }

    await paymentQueue.add('webhook-payment', {
      event: payload.event,
      data: payload.data
    });

    return { received: true };
  }

  async processSuccessfulPayment(reference: string, paystackData: Record<string, unknown>) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('*, item:items(*)')
      .eq('paystack_reference', reference);

    if (!purchases || purchases.length === 0) {
      logger.error(`No purchases found for reference: ${reference}`);
      return;
    }

    for (const purchase of purchases) {
      if (purchase.payment_status === PaymentStatus.SUCCESS) {
        continue;
      }

      await supabase
        .from('purchases')
        .update({
          payment_status: PaymentStatus.SUCCESS,
          transaction_date: new Date().toISOString(),
          metadata: { ...purchase.metadata, paystackData }
        })
        .eq('id', purchase.id);

      await supabase.rpc('increment_purchase_count', { item_id: purchase.item_id });

      await emailQueue.add('purchase-confirmation', {
        buyerId: purchase.buyer_id,
        itemId: purchase.item_id,
        purchaseId: purchase.id
      });
    }

    logger.info(`Processed successful payment: ${reference}`);
  }

  async getUserPurchases(userId: string) {
    const { data: purchases, error } = await supabase
      .from('purchases')
      .select('*, item:items(id, title, thumbnail_path, course, year, file_size, page_count)')
      .eq('buyer_id', userId)
      .eq('payment_status', PaymentStatus.SUCCESS)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(500, 'Failed to fetch purchases');
    }

    return purchases || [];
  }

  async getDownloadUrl(userId: string, itemId: string) {
    // Verify purchase exists and is valid
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('*, item:items(file_path, title)')
      .eq('buyer_id', userId)
      .eq('item_id', itemId)
      .eq('payment_status', PaymentStatus.SUCCESS)
      .maybeSingle();

    if (purchaseError) {
      logger.error('Error fetching purchase:', purchaseError);
      throw new AppError(500, 'Failed to verify purchase');
    }

    if (!purchase) {
      throw new AppError(404, 'Purchase not found. You must buy this item first.');
    }

    // Check download limit
    if (purchase.download_count >= purchase.max_downloads) {
      throw new AppError(400, `Download limit reached. Maximum ${purchase.max_downloads} downloads allowed.`);
    }

    const item = purchase.item as { file_path?: string; title: string } | null;
    const filePath = item?.file_path;
    if (!filePath) {
      logger.error(`File path not found for item ${itemId}`);
      throw new AppError(500, 'File not available for download');
    }

    // Generate signed URL with 15 minutes expiration
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('originals')
      .createSignedUrl(filePath, 900); // 900 seconds = 15 minutes

    if (urlError || !signedUrl) {
      logger.error('Error generating signed URL:', urlError);
      throw new AppError(500, 'Failed to generate download URL. Please try again.');
    }

    // Update download count
    const { error: updateError } = await supabase
      .from('purchases')
      .update({
        download_count: purchase.download_count + 1,
        last_download_at: new Date().toISOString()
      })
      .eq('id', purchase.id);

    if (updateError) {
      logger.error('Error updating download count:', updateError);
      // Don't throw error here - download should still work
    }

    // Log download for analytics
    logger.info(`Download generated: User ${userId}, Item ${itemId}, Count: ${purchase.download_count + 1}`);

    return signedUrl.signedUrl;
  }

  async getUploaderEarnings(uploaderId: string) {
    const { data: purchases } = await supabase
      .from('purchases')
      .select('amount, item:items!inner(uploader_id)')
      .eq('item.uploader_id', uploaderId)
      .eq('payment_status', PaymentStatus.SUCCESS);

    const totalEarnings = purchases?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

    return {
      totalEarnings,
      totalTransactions: purchases?.length || 0
    };
  }

  async requestPayout(uploaderId: string, data: {
    amount: number;
    bank_code: string;
    account_number: string;
    account_name: string;
  }) {
    const { data: payout, error } = await supabase
      .from('payouts')
      .insert({
        uploader_id: uploaderId,
        ...data,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create payout request');
    }

    return payout;
  }

  async getPayoutHistory(uploaderId: string) {
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('uploader_id', uploaderId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError(500, 'Failed to fetch payout history');
    }

    return payouts || [];
  }
}

export const paymentService = new PaymentService();
