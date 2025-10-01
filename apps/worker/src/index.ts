import { logger } from './lib/logger.js';
import { connectDatabase } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { flowWorker } from './queues/flow.queue.js';
import { broadcastWorker } from './queues/broadcast.queue.js';

async function start() {
  try {
    await connectDatabase();
    await redis.ping();

    logger.info('🚀 Worker started');
    logger.info('📝 Workers registered: flow:run, broadcast:run');
  } catch (error) {
    logger.error('Failed to start worker', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await flowWorker.close();
  await broadcastWorker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await flowWorker.close();
  await broadcastWorker.close();
  await redis.quit();
  process.exit(0);
});

start();
