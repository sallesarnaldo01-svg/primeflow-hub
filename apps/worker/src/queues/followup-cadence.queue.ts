import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processFollowUpCadence } from '../processors/followup-cadence.processor.js';

export const followUpCadenceQueue = new Queue('followup-cadence', {
  connection: redis
});

export const followUpCadenceWorker = new Worker(
  'followup-cadence',
  async (job) => {
    return await processFollowUpCadence(job);
  },
  {
    connection: redis,
    concurrency: 5
  }
);

followUpCadenceWorker.on('completed', (job) => {
  logger.info('Follow-up cadence job completed', { jobId: job.id });
});

followUpCadenceWorker.on('failed', (job, error) => {
  logger.error('Follow-up cadence job failed', { jobId: job?.id, error });
});

logger.info('Follow-up cadence queue initialized');
