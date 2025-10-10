import Redis from 'ioredis';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

if (!process.env.UPSTASH_REDIS_URL) {
  throw new Error('Missing UPSTASH_REDIS_URL');
}

export const redis = new Redis(process.env.UPSTASH_REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

export class CacheService {
  private readonly defaultTTL = 300;

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await redis.incr(key);
      if (ttl) {
        await redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();
