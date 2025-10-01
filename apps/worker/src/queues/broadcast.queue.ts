import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

export interface BroadcastJob {
  broadcastId: string;
  tenantId: string;
}

export const broadcastQueue = new Queue<BroadcastJob>('broadcast:run', {
  connection: redis
});

export const broadcastWorker = new Worker<BroadcastJob>(
  'broadcast:run',
  async (job) => {
    logger.info('Processing broadcast job', { jobId: job.id, data: job.data });

    const broadcast = await prisma.broadcast.findUnique({
      where: { id: job.data.broadcastId }
    });

    if (!broadcast) {
      throw new Error('Broadcast not found');
    }

    // Update status to RUNNING
    await prisma.broadcast.update({
      where: { id: broadcast.id },
      data: { status: 'RUNNING' }
    });

    try {
      // Get recipients based on filters
      const contacts = await getRecipients(broadcast);
      
      const config = broadcast.config as any;
      const stats = { queued: contacts.length, sent: 0, failed: 0 };

      for (const contact of contacts) {
        try {
          // Execute script actions for this contact
          await executeScript(broadcast.script, contact, config);
          
          stats.sent++;
          
          // Apply delay with jitter
          const jitter = Math.random() * (env.BROADCAST_JITTER_PCT / 100);
          const delay = config.intervalSec * 1000 * (1 + jitter);
          await sleep(delay);
          
          // Check for pause
          if (config.pauseEveryN && stats.sent % config.pauseEveryN === 0) {
            logger.info('Broadcast paused', { broadcastId: broadcast.id });
            await sleep(config.pauseForSec * 1000);
          }
        } catch (error) {
          logger.error('Failed to send to contact', { error, contactId: contact.id });
          stats.failed++;
        }

        // Update progress
        await prisma.broadcast.update({
          where: { id: broadcast.id },
          data: { stats: stats as any }
        });
      }

      // Mark as DONE
      await prisma.broadcast.update({
        where: { id: broadcast.id },
        data: { status: 'DONE', stats: stats as any }
      });

      return { success: true, stats };
    } catch (error) {
      await prisma.broadcast.update({
        where: { id: broadcast.id },
        data: { status: 'FAILED' }
      });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: env.BROADCAST_MAX_CONCURRENCY
  }
);

async function getRecipients(broadcast: any) {
  const filters = broadcast.filters as any;
  
  return prisma.contact.findMany({
    where: {
      tenantId: broadcast.tenantId,
      ...(filters.sources?.length && {
        source: { in: filters.sources }
      }),
      ...(filters.tags?.length && {
        tags: {
          some: {
            tagId: { in: filters.tags }
          }
        }
      })
    }
  });
}

async function executeScript(script: any[], contact: any, config: any) {
  for (const action of script) {
    logger.info('Execute broadcast action', { type: action.type, contactId: contact.id });
    
    // Implementar execução de cada tipo de ação
    // sendMessage, crmTab, labels, delay, transfer, etc.
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

broadcastWorker.on('completed', (job) => {
  logger.info('Broadcast job completed', { jobId: job.id });
});

broadcastWorker.on('failed', (job, error) => {
  logger.error('Broadcast job failed', { jobId: job?.id, error: error.message });
});
