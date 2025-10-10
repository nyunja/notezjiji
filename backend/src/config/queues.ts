import { Queue, QueueOptions } from 'bullmq';
import { redis } from './redis.js';
import { logger } from '../utils/logger.js';

const connection = redis;

const defaultQueueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 1000
    },
    removeOnFail: {
      age: 7 * 24 * 3600
    }
  }
};

export const fileProcessingQueue = new Queue('file-processing', defaultQueueOptions);
export const emailQueue = new Queue('email', defaultQueueOptions);
export const paymentQueue = new Queue('payment', defaultQueueOptions);
export const payoutQueue = new Queue('payout', defaultQueueOptions);
export const analyticsQueue = new Queue('analytics', defaultQueueOptions);

export const queues = {
  fileProcessing: fileProcessingQueue,
  email: emailQueue,
  payment: paymentQueue,
  payout: payoutQueue,
  analytics: analyticsQueue
};

fileProcessingQueue.on('error', (error) => {
  logger.error('File processing queue error:', error);
});

emailQueue.on('error', (error) => {
  logger.error('Email queue error:', error);
});

paymentQueue.on('error', (error) => {
  logger.error('Payment queue error:', error);
});

logger.info('BullMQ queues initialized');
