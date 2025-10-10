import rateLimit from 'express-rate-limit';
import { supabase } from '../config/database.js';
import { logger } from '../utils/logger.js';

const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: { success: false, message: options.message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    handler: async (req, res) => {
      const identifier = req.ip || 'unknown';
      const endpoint = req.path;

      try {
        await supabase.from('rate_limit_logs').insert({
          identifier,
          endpoint,
          attempts: options.max
        });
      } catch (error) {
        logger.error('Failed to log rate limit violation:', error);
      }

      res.status(429).json({
        success: false,
        message: options.message
      });
    }
  });
};

export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true
});

export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Upload limit reached, please try again later'
});

export const downloadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Download limit reached, please try again later'
});

export const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Search limit reached, please slow down'
});

export const paymentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Payment limit reached, please try again later'
});
