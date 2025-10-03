import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processBulkAI } from '../processors/bulk-ai.processor.js';

export const bulkAIQueue = new Queue('bulk-ai', {
  connection: redis
});

export const bulkAIWorker = new Worker(
  'bulk-ai',
  async (job) => {
    return await processBulkAI(job);
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: {
      max: 10,
      duration: 60000 // 10 jobs por minuto
    }
  }
);

bulkAIWorker.on('completed', (job) => {
  logger.info('Bulk AI job completed', { jobId: job.id });
});

bulkAIWorker.on('failed', (job, error) => {
  logger.error('Bulk AI job failed', { jobId: job?.id, error });
});

logger.info('Bulk AI queue initialized');
