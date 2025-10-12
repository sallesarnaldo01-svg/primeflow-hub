import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

export interface AIMessageJob {
  conversationId: string;
  messageId: string;
  tenantId: string;
}

export const aiMessageQueue = new Queue<AIMessageJob>('ai:message:process', {
  connection: redis
});

export const aiMessageWorker = new Worker<AIMessageJob>(
  'ai:message:process',
  async (job) => {
    logger.info('Processing AI message job', { jobId: job.id, data: job.data });

    const { conversationId, messageId, tenantId } = job.data;

    try {
      // Get conversation with contact
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          contact: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get AI settings for tenant
      const aiSettings = await prisma.aiSettings.findFirst({
        where: { tenantId },
      });

      if (!aiSettings || !aiSettings.enabled) {
        logger.info('AI not enabled for tenant', { tenantId });
        return { success: true, reason: 'ai_disabled' };
      }

      // Get the incoming message
      const incomingMessage = conversation.messages.find(m => m.id === messageId);
      if (!incomingMessage) {
        throw new Error('Message not found');
      }

      // Build conversation history
      const conversationHistory = conversation.messages
        .reverse()
        .map(msg => ({
          role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
          content: msg.content,
        }));

      // Get available tools
      const tools = await prisma.aiTool.findMany({
        where: { tenantId, enabled: true },
      });

      // TODO: Call Lovable AI Gateway with tools
      // This will be implemented next with the edge function

      logger.info('AI message processing placeholder', {
        conversationId,
        messageCount: conversationHistory.length,
        toolsCount: tools.length,
      });

      return { success: true, processed: true };
    } catch (error) {
      logger.error('Failed to process AI message', { error, jobId: job.id });
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

aiMessageWorker.on('completed', (job) => {
  logger.info('AI message job completed', { jobId: job.id });
});

aiMessageWorker.on('failed', (job, error) => {
  logger.error('AI message job failed', { jobId: job?.id, error: error.message });
});
