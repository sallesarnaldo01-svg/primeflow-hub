import { logger } from './lib/logger.js';
import { connectDatabase } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { flowWorker } from './queues/flow.queue.js';
import { broadcastWorker } from './queues/broadcast.queue.js';
import { broadcastMassWorker } from './queues/broadcast-mass.queue.js';
import { facebookMassWorker } from './queues/facebook-mass.queue.js';
import { instagramMassWorker } from './queues/instagram-mass.queue.js';
import { BaileysProvider } from './providers/whatsapp/baileys.provider.js';
import { facebookProvider } from './providers/facebook/facebook.provider.js';
import { instagramProvider } from './providers/instagram/instagram.provider.js';
import './queues/knowledge.queue.js';
import './queues/followup-cadence.queue.js';
import './queues/bulk-ai.queue.js';
import './queues/leads.queue.js';
import './queues/workflows.queue.js';
import './queues/webhooks.queue.js';

// Inicializar Baileys provider
const baileysProvider = new BaileysProvider();

async function start() {
  try {
    await connectDatabase();
    await redis.ping();

    logger.info('🚀 Worker started');
    logger.info('📝 Workers registered: flow, broadcast, broadcast-mass, facebook-mass, instagram-mass, knowledge, followup-cadence, bulk-ai, leads, workflows, webhooks, ai-message');
    
    // Redis subscribers for social media commands
    redis.subscribe(
      'whatsapp:connect', 
      'whatsapp:disconnect', 
      'facebook:connect',
      'facebook:disconnect',
      'instagram:connect',
      'instagram:disconnect',
      'broadcast:mass'
    );
    
    redis.on('message', async (channel, message) => {
      const data = JSON.parse(message);
      
      if (channel === 'whatsapp:connect') {
        logger.info('📱 [Worker] Iniciando conexão WhatsApp com Baileys', { connectionId: data.connectionId });
        await baileysProvider.connect(data.connectionId, {});
      } else if (channel === 'whatsapp:disconnect') {
        logger.info('📱 [Worker] Desconectando WhatsApp', { connectionId: data.connectionId });
        await baileysProvider.disconnect(data.connectionId);
      } else if (channel === 'facebook:connect') {
        logger.info('📘 [Worker] Conectando Facebook', { connectionId: data.connectionId });
        await facebookProvider.connect(data.connectionId, {
          email: data.email,
          password: data.password
        });
      } else if (channel === 'facebook:disconnect') {
        logger.info('📘 [Worker] Desconectando Facebook', { connectionId: data.connectionId });
        await facebookProvider.disconnect(data.connectionId);
      } else if (channel === 'instagram:connect') {
        logger.info('📷 [Worker] Conectando Instagram', { connectionId: data.connectionId });
        await instagramProvider.connect(data.connectionId, {
          username: data.username,
          password: data.password
        });
      } else if (channel === 'instagram:disconnect') {
        logger.info('📷 [Worker] Desconectando Instagram', { connectionId: data.connectionId });
        await instagramProvider.disconnect(data.connectionId);
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
  await broadcastMassWorker.close();
  await facebookMassWorker.close();
  await instagramMassWorker.close();
  await redis.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await flowWorker.close();
  await broadcastWorker.close();
  await broadcastMassWorker.close();
  await facebookMassWorker.close();
  await instagramMassWorker.close();
  await redis.quit();
  process.exit(0);
});

start();
