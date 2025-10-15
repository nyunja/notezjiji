import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService.js';
import { AppError } from '../middleware/errorHandler.js';

const adminService = new AdminService();

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getPendingItems(page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const approveItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { itemId } = req.params;
    const result = await adminService.approveItem(itemId, adminId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const rejectItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { itemId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, 'Rejection reason is required');
    }

    const result = await adminService.rejectItem(itemId, adminId, reason);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
      role: req.query.role as string,
      search: req.query.search as string
    };

    const result = await adminService.getAllUsers(page, limit, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role) {
      throw new AppError(400, 'Role is required');
    }

    const result = await adminService.updateUserRole(userId, role, adminId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const unlockUserAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { userId } = req.params;
    const result = await adminService.unlockUserAccount(userId, adminId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getPendingPayouts(page, limit);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const approvePayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { payoutId } = req.params;
    const result = await adminService.approvePayout(payoutId, adminId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const rejectPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user?.userId;
    if (!adminId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { payoutId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new AppError(400, 'Rejection reason is required');
    }

    const result = await adminService.rejectPayout(payoutId, adminId, reason);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const filters = {
      userId: req.query.userId as string,
      action: req.query.action as string
    };

    const result = await adminService.getAuditLogs(page, limit, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
