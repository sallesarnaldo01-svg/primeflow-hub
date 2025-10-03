import { Worker, Job } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { facebookProvider } from '../providers/facebook/facebook.provider.js';
import { prisma } from '../lib/prisma.js';

interface FacebookMassJob {
  broadcastId: string;
  connectionId: string;
  recipients: string[];
  message: string;
  delay: number;
  jitter: number;
}

export const facebookMassWorker = new Worker<FacebookMassJob>(
  'facebook-mass',
  async (job: Job<FacebookMassJob>) => {
    const { broadcastId, connectionId, recipients, message, delay, jitter } = job.data;
    
    logger.info('Processing Facebook mass broadcast', {
      broadcastId,
      recipientCount: recipients.length
    });

    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        // Check if broadcast is paused
        const broadcast = await prisma.broadcast.findUnique({
          where: { id: broadcastId }
        });

        if (broadcast?.status === 'PAUSED') {
          logger.info('Broadcast paused, stopping', { broadcastId });
          break;
        }

        // Send message
        await facebookProvider.sendMessage(connectionId, recipient, message);
        sent++;

        // Update progress
        job.updateProgress((sent / recipients.length) * 100);

        // Log message
        await prisma.messageLog.create({
          data: {
            tenantId: broadcast!.tenantId,
            channel: 'FACEBOOK',
            direction: 'OUT',
            contact: recipient,
            payload: { message, broadcastId }
          }
        });

        // Apply delay with jitter for anti-ban
        if (sent < recipients.length) {
          const jitterAmount = delay * jitter;
          const actualDelay = delay + (Math.random() * jitterAmount * 2 - jitterAmount);
          await new Promise(resolve => setTimeout(resolve, actualDelay));
        }

      } catch (error: any) {
        failed++;
        logger.error('Failed to send Facebook message', {
          error: error.message,
          recipient
        });
      }
    }

    // Update broadcast status
    await prisma.broadcast.update({
      where: { id: broadcastId },
      data: {
        status: 'DONE',
        stats: { sent, failed, total: recipients.length }
      }
    });

    logger.info('Facebook mass broadcast completed', {
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

facebookMassWorker.on('completed', (job) => {
  logger.info('Facebook mass job completed', { jobId: job.id });
});

facebookMassWorker.on('failed', (job, err) => {
  logger.error('Facebook mass job failed', { 
    jobId: job?.id, 
    error: err.message 
  });
});
