import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processWorkflowExecution } from '../processors/workflows.processor.js';

export const workflowsQueue = new Queue('workflows', {
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

const workflowsWorker = new Worker(
  'workflows',
  async (job) => {
    return await processWorkflowExecution(job);
  },
  {
    connection: redisConnection,
    concurrency: 3
  }
);

workflowsWorker.on('completed', (job) => {
  logger.info('Workflow job completed', { jobId: job.id, workflowId: job.data.workflowId });
});

workflowsWorker.on('failed', (job, err) => {
  logger.error('Workflow job failed', { jobId: job?.id, error: err.message });
});

logger.info('Workflows worker started');
