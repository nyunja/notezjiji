import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService.js';
import { AppError } from '../middleware/errorHandler.js';

const paymentService = new PaymentService();

export const initializePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) {
      throw new AppError(401, 'Unauthorized');
    }

    const { itemIds } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      throw new AppError(400, 'Item IDs are required');
    }

    const payment = await paymentService.initializePayment(userId, userEmail, itemIds);

    res.json({
      success: true,
      data: payment,
      message: 'Payment initialized successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { reference } = req.params;

    const purchase = await paymentService.verifyPayment(reference);

    res.json({
      success: true,
      data: purchase,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    if (!signature) {
      throw new AppError(400, 'Missing signature');
    }

    await paymentService.handleWebhook(req.body, signature);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const getUserPurchases = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const purchases = await paymentService.getUserPurchases(userId);

    res.json({
      success: true,
      data: purchases
    });
  } catch (error) {
    next(error);
  }
};

export const getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { itemId } = req.params;

    const downloadUrl = await paymentService.getDownloadUrl(userId, itemId);

    res.json({
      success: true,
      data: { url: downloadUrl },
      message: 'Download URL generated'
    });
  } catch (error) {
    next(error);
  }
};

export const getUploaderEarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const earnings = await paymentService.getUploaderEarnings(userId);

    res.json({
      success: true,
      data: earnings
    });
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { amount, bank_code, account_number, account_name } = req.body;

    if (!amount || !bank_code || !account_number || !account_name) {
      throw new AppError(400, 'All fields are required');
    }

    const payout = await paymentService.requestPayout(userId, {
      amount: Number(amount),
      bank_code,
      account_number,
      account_name
    });

    res.json({
      success: true,
      data: payout,
      message: 'Payout request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getPayoutHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const payouts = await paymentService.getPayoutHistory(userId);

    res.json({
      success: true,
      data: payouts
    });
  } catch (error) {
    next(error);
  }
};
