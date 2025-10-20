import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { processWebhookDelivery } from '../processors/webhooks.processor.js';

const QUEUE_NAME = 'webhooks';

export const webhooksQueue = new Queue(QUEUE_NAME, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1, // We handle retries in the processor
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 1000, // Keep last 1000 failed jobs
  }
});

export const webhooksWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    return await processWebhookDelivery(job);
  },
  {
    connection: redis,
    concurrency: 10, // Process up to 10 webhooks concurrently
  }
);

webhooksWorker.on('completed', (job) => {
  logger.info('Webhook job completed', { jobId: job.id });
});

webhooksWorker.on('failed', (job, err) => {
  logger.error('Webhook job failed', { 
    jobId: job?.id, 
    error: err.message 
  });
});

// Subscribe to Redis pub/sub for webhook delivery
redis.subscribe('webhook:deliver', (err) => {
  if (err) {
    logger.error('Failed to subscribe to webhook:deliver', { err });
  } else {
    logger.info('Subscribed to webhook:deliver channel');
  }
});

redis.on('message', async (channel, message) => {
  if (channel === 'webhook:deliver') {
    try {
      const data = JSON.parse(message);
      await webhooksQueue.add('deliver', data);
      logger.info('Webhook delivery job added to queue', data);
    } catch (error) {
      logger.error('Error processing webhook:deliver message', { error });
    }
  }
});

logger.info('✅ Webhooks queue initialized');