import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';
import { supabase } from '../config/database.js';

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError(401, 'User not found');
    }

    if (user.role !== 'admin') {
      throw new AppError(403, 'Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const requireUploader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError(401, 'User not found');
    }

    if (user.role !== 'uploader' && user.role !== 'admin') {
      throw new AppError(403, 'Uploader access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
