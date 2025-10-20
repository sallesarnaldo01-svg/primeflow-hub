import { Queue } from 'bullmq';
import { redis } from '../lib/redis.js';

export const workflowsQueue = new Queue('workflows', {
  connection: redis,
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
