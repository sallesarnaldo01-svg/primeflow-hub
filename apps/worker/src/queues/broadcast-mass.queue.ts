import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { venomProvider } from '../providers/whatsapp/venom.provider.js';

interface BroadcastMassJob {
  broadcastId: string;
  connectionId: string;
  contacts: string[];
  message: {
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'document';
  };
  delayMs: number;
}

export const broadcastMassQueue = new Queue<BroadcastMassJob>('broadcast-mass', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});

export const broadcastMassWorker = new Worker<BroadcastMassJob>(
  'broadcast-mass',
  async (job: Job<BroadcastMassJob>) => {
    const { broadcastId, connectionId, contacts, message, delayMs } = job.data;
    
    logger.info('Processing mass broadcast', { 
      broadcastId, 
      connectionId,
      totalContacts: contacts.length,
      delayMs 
    });

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        // Check if connection is still active
        const isConnected = await venomProvider.isConnected(connectionId);
        if (!isConnected) {
          throw new Error('WhatsApp connection lost');
        }

        // Send message
        const content: any = {};
        
        if (message.text) {
          content.text = message.text;
        }
        
        if (message.mediaUrl) {
          switch (message.mediaType) {
            case 'image':
              content.image = { url: message.mediaUrl };
              break;
            case 'audio':
              content.audio = { url: message.mediaUrl, ptt: true };
              break;
            case 'video':
              content.video = { url: message.mediaUrl };
              break;
            case 'document':
              content.document = { url: message.mediaUrl };
              break;
          }
        }

        await venomProvider.sendMessage({
          connectionId,
          to: contact,
          content
        });

        sent++;
        logger.info('Message sent in broadcast', { broadcastId, contact, sent, total: contacts.length });

        // Update progress
        await job.updateProgress({
          total: contacts.length,
          sent,
          failed,
          current: i + 1,
          percentage: Math.round(((i + 1) / contacts.length) * 100)
        });

        // Apply delay (except for last message)
        if (i < contacts.length - 1) {
          const jitter = Math.random() * (delayMs * 0.2); // 20% jitter
          const actualDelay = delayMs + jitter;
          
          logger.debug('Applying delay', { delay: actualDelay });
          await new Promise(resolve => setTimeout(resolve, actualDelay));
        }

      } catch (error) {
        failed++;
        logger.error('Failed to send message in broadcast', { 
          broadcastId, 
          contact, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update broadcast stats
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'DONE',
        stats: {
          sent,
          failed,
          total: contacts.length,
          progress: 100
        }
      }
    });

    logger.info('Mass broadcast completed', { broadcastId, sent, failed, total: contacts.length });

    return { sent, failed, total: contacts.length };
  },
  {
    connection: redis,
    concurrency: 1, // Process one broadcast at a time per worker
    limiter: {
      max: 1,
      duration: 1000
    }
  }
);

broadcastMassWorker.on('completed', (job) => {
  logger.info('Broadcast mass job completed', { jobId: job.id, result: job.returnvalue });
});

broadcastMassWorker.on('failed', (job, err) => {
  logger.error('Broadcast mass job failed', { jobId: job?.id, error: err.message });
});
