import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { FlowExecutor } from '../executors/flow.executor.js';

export interface FlowJob {
  flowId: string;
  contactId: string;
  startNodeId?: string;
  variables?: Record<string, any>;
}

export const flowQueue = new Queue<FlowJob>('flow:run', {
  connection: redis
});

export const flowWorker = new Worker<FlowJob>(
  'flow:run',
  async (job) => {
    logger.info('Processing flow job', { jobId: job.id, data: job.data });

    const executor = new FlowExecutor(
      job.data.flowId,
      job.data.contactId,
      job.data.variables
    );

    try {
      await executor.execute(job.data.startNodeId);
      
      return {
        success: true,
        variables: executor.getVariables()
      };
    } catch (error) {
      logger.error('Flow execution failed', { error, jobId: job.id });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 10
  }
);

flowWorker.on('completed', (job) => {
  logger.info('Flow job completed', { jobId: job.id });
});

flowWorker.on('failed', (job, error) => {
  logger.error('Flow job failed', { jobId: job?.id, error: error.message });
});
