import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { instagramProvider } from '../providers/instagram/instagram.provider.js';
import { prisma } from '../lib/prisma.js';

interface InstagramMassJob {
  broadcastId: string;
  connectionId: string;
  recipients: string[];
  message: string;
  delay: number;
  jitter: number;
}

export const instagramMassWorker = new Worker<InstagramMassJob>(
  'instagram-mass',
  async (job: Job<InstagramMassJob>) => {
    const { broadcastId, connectionId, recipients, message, delay, jitter } = job.data;
    
    logger.info('Processing Instagram mass broadcast', {
      broadcastId,
      recipientCount: recipients.length
    });

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        const broadcast = await prisma.broadcast.findUnique({
          where: { id: broadcastId }
        });

        if (broadcast?.status === 'PAUSED') {
          logger.info('Broadcast paused, stopping', { broadcastId });
          break;
        }

        // Send DM
        await instagramProvider.sendDirectMessage(connectionId, recipient, message);
        sent++;

        job.updateProgress((sent / recipients.length) * 100);

        // Log message
        await prisma.messageLog.create({
          data: {
            tenantId: broadcast!.tenantId,
            channel: 'INSTAGRAM',
            direction: 'OUT',
            contact: recipient,
            payload: { message, broadcastId }
          }
        });

        // Anti-ban delay with jitter
        if (sent < recipients.length) {
          const jitterAmount = delay * jitter;
          const actualDelay = delay + (Math.random() * jitterAmount * 2 - jitterAmount);
          await new Promise(resolve => setTimeout(resolve, actualDelay));
        }

      } catch (error: any) {
        failed++;
        logger.error('Failed to send Instagram DM', {
          error: error.message,
          recipient
        });
      }
    }

    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'DONE',
        stats: { sent, failed, total: recipients.length }
      }
    });

    logger.info('Instagram mass broadcast completed', {
      broadcastId,
      sent,
      failed
    });

    return { sent, failed };
  },
  {
    connection: redis,
    concurrency: 1
  }
);

instagramMassWorker.on('completed', (job) => {
  logger.info('Instagram mass job completed', { jobId: job.id });
});

instagramMassWorker.on('failed', (job, err) => {
  logger.error('Instagram mass job failed', { 
    jobId: job?.id, 
    error: err.message 
  });
});
