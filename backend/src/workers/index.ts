import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { logger } from '../utils/logger.js';
import { paymentService } from '../services/paymentService.js';

const connection = redis;

const fileProcessingWorker = new Worker(
  'file-processing',
  async (job: Job) => {
    logger.info(`Processing file job: ${job.id}`, job.data);

    return { processed: true };
  },
  {
    connection,
    concurrency: 2
  }
);

const emailWorker = new Worker(
  'email',
  async (job: Job) => {
    logger.info(`Processing email job: ${job.id}`, job.data);

    return { sent: true };
  },
  {
    connection,
    concurrency: 3
  }
);

const paymentWorker = new Worker(
  'payment',
  async (job: Job) => {
    logger.info(`Processing payment job: ${job.id}`, job.data);

    if (job.name === 'process-payment') {
      await paymentService.processSuccessfulPayment(
        job.data.reference,
        job.data.paystackData
      );
    }

    if (job.name === 'webhook-payment') {
      if (job.data.event === 'charge.success') {
        await paymentService.processSuccessfulPayment(
          job.data.data.reference,
          job.data.data
        );
      }
    }

    return { processed: true };
  },
  {
    connection,
    concurrency: 2
  }
);

const payoutWorker = new Worker(
  'payout',
  async (job: Job) => {
    logger.info(`Processing payout job: ${job.id}`, job.data);

    return { processed: true };
  },
  {
    connection,
    concurrency: 1
  }
);

const analyticsWorker = new Worker(
  'analytics',
  async (job: Job) => {
    logger.info(`Processing analytics job: ${job.id}`, job.data);

    return { processed: true };
  },
  {
    connection,
    concurrency: 1
  }
);

fileProcessingWorker.on('completed', (job) => {
  logger.info(`File processing job ${job.id} completed`);
});

fileProcessingWorker.on('failed', (job, error) => {
  logger.error(`File processing job ${job?.id} failed:`, error);
});

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, error) => {
  logger.error(`Email job ${job?.id} failed:`, error);
});

paymentWorker.on('completed', (job) => {
  logger.info(`Payment job ${job.id} completed`);
});

paymentWorker.on('failed', (job, error) => {
  logger.error(`Payment job ${job?.id} failed:`, error);
});

logger.info('All workers started successfully');

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing workers...');
  await Promise.all([
    fileProcessingWorker.close(),
    emailWorker.close(),
    paymentWorker.close(),
    payoutWorker.close(),
    analyticsWorker.close()
  ]);
  process.exit(0);
});
