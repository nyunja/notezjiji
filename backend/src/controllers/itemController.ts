import { Request, Response, NextFunction } from 'express';
import { ItemService } from '../services/itemService.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadLimiter, searchLimiter } from '../middleware/rateLimiter.js';

const itemService = new ItemService();

export const getMarketplace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, course, year, search, sort = 'created_at' } = req.query;

    const items = await itemService.getMarketplaceItems({
      page: Number(page),
      limit: Number(limit),
      course: course as string,
      year: year as string,
      search: search as string,
      sort: sort as string
    });

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = await itemService.getItemById(id);

    if (!item) {
      throw new AppError(404, 'Item not found');
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    if (!req.file) {
      throw new AppError(400, 'File is required');
    }

    const { title, description, course, year, tags, price } = req.body;

    const item = await itemService.createItem(userId, {
      title,
      description,
      course,
      year,
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]'),
      price: Number(price),
      file_path: req.file.path,
      file_size: req.file.size
    });

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully and pending approval'
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const item = await itemService.updateItem(id, userId, req.body);

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    await itemService.deleteItem(id, userId);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getUserItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const items = await itemService.getUserItems(userId);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

export const getItemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const stats = await itemService.getUploaderStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
