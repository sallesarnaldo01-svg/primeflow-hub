import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processLeadScoring, processLeadDistribution } from '../processors/leads.processor.js';

export const leadsQueue = new Queue('leads', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

const leadsWorker = new Worker(
  'leads',
  async (job) => {
    const { type } = job.data;

    switch (type) {
      case 'SCORING':
        return await processLeadScoring(job);
      case 'DISTRIBUTION':
        return await processLeadDistribution(job);
      default:
        throw new Error(`Unknown job type: ${type}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
);

leadsWorker.on('completed', (job) => {
  logger.info('Leads job completed', { jobId: job.id, type: job.data.type });
});

leadsWorker.on('failed', (job, err) => {
  logger.error('Leads job failed', { jobId: job?.id, error: err.message });
});

logger.info('Leads worker started');
