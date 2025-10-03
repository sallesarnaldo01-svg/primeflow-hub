import { logger } from './lib/logger.js';
import { connectDatabase } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { flowWorker } from './queues/flow.queue.js';
import { broadcastWorker } from './queues/broadcast.queue.js';
import { broadcastMassWorker } from './queues/broadcast-mass.queue.js';
import { venomProvider } from './providers/whatsapp/venom.provider.js';

async function start() {
  try {
    await connectDatabase();
    await redis.ping();

    logger.info('🚀 Worker started');
    logger.info('📝 Workers registered: flow:run, broadcast:run, broadcast-mass');
    
    // Redis subscribers for WhatsApp commands
    redis.subscribe('whatsapp:connect', 'whatsapp:disconnect', 'broadcast:mass');
    
    redis.on('message', async (channel, message) => {
      if (channel === 'whatsapp:connect') {
        const { connectionId } = JSON.parse(message);
        await venomProvider.connect(connectionId, {});
      } else if (channel === 'whatsapp:disconnect') {
        const { connectionId } = JSON.parse(message);
        await venomProvider.disconnect(connectionId);
      }
    });
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
