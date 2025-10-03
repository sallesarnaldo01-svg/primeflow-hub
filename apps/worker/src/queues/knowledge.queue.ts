import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processKnowledgeDocument } from '../processors/knowledge.processor.js';

export const knowledgeQueue = new Queue('knowledge-processing', {
  connection: redis
});

export const knowledgeWorker = new Worker(
  'knowledge-processing',
  async (job) => {
    return await processKnowledgeDocument(job);
  },
  {
    connection: redis,
    concurrency: 3
  }
);

knowledgeWorker.on('completed', (job) => {
  logger.info('Knowledge processing job completed', { jobId: job.id });
});

knowledgeWorker.on('failed', (job, error) => {
  logger.error('Knowledge processing job failed', { jobId: job?.id, error });
});

logger.info('Knowledge processing queue initialized');
