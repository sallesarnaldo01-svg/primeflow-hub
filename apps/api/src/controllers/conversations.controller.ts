import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { emitToTenant } from '../lib/socket.js';
import { venomProvider } from '../../worker/src/providers/whatsapp/venom.provider.js';
import { facebookProvider } from '../../worker/src/providers/facebook/facebook.provider.js';
import { instagramProvider } from '../../worker/src/providers/instagram/instagram.provider.js';

export const conversationsController = {
  async list(req: Request, res: Response) {
    try {
      const { status, channel, search, page = 1, limit = 50 } = req.query;
      const tenantId = req.user!.tenantId;

      const where: any = { 
        contact: { tenantId }
      };

      if (status && status !== 'all') {
        where.status = (status as string).toUpperCase();
      }

      if (channel && channel !== 'all') {
        where.channel = (channel as string).toUpperCase();
      }

      if (search) {
        where.contact = {
          ...where.contact,
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { phone: { contains: search as string } }
          ]
        };
      }

      const conversations = await prisma.conversation.findMany({
        where,
        include: {
          contact: true,
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { lastMessageAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.conversation.count({ where });

      res.json({ 
        data: conversations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error listing conversations', { error });
      res.status(500).json({ error: 'Failed to list conversations' });
    }
  },

  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.message.count({ where: { conversationId } });

      res.json({ 
        data: messages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Error getting messages', { error });
      res.status(500).json({ error: 'Failed to get messages' });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { content, type = 'TEXT', attachments = [] } = req.body;

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { 
          contact: true,
          connection: true
        }
      });

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      // Send via appropriate provider
      let messageId: string | undefined;

      if (conversation.channel === 'WHATSAPP' && conversation.connection) {
        const result = await venomProvider.sendMessage({
          connectionId: conversation.connection.id,
          to: conversation.contact.phone,
          content: { text: content },
          metadata: {}
        });
        messageId = result.messageId;
      } else if (conversation.channel === 'FACEBOOK' && conversation.connection) {
        // Facebook send logic
        logger.warn('Facebook send not fully implemented');
      } else if (conversation.channel === 'INSTAGRAM' && conversation.connection) {
        // Instagram send logic
        logger.warn('Instagram send not fully implemented');
      }

      // Save to database
      const message = await prisma.message.create({
        data: {
          conversationId,
          content,
          direction: 'OUTBOUND',
          status: 'SENT',
          type: type as any,
          metadata: { 
            externalId: messageId,
            attachments 
          }
        }
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });

      // Emit to frontend
      const tenantId = req.user!.tenantId;
      emitToTenant(tenantId, 'message:sent', { 
        conversationId,
        message
      });

      res.json({ data: message });
    } catch (error) {
      logger.error('Error sending message', { error });
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { status } = req.body;

      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: status as any },
        include: { contact: true }
      });

      res.json({ data: conversation });
    } catch (error) {
      logger.error('Error updating conversation status', { error });
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  async assign(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { userId } = req.body;

      const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: { assignedToId: userId },
        include: { 
          contact: true,
          assignedTo: true
        }
      });

      res.json({ data: conversation });
    } catch (error) {
      logger.error('Error assigning conversation', { error });
      res.status(500).json({ error: 'Failed to assign conversation' });
    }
  },

  async markAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { unreadCount: 0 }
      });

      res.json({ success: true });
    } catch (error) {
      logger.error('Error marking as read', { error });
      res.status(500).json({ error: 'Failed to mark as read' });
    }
  }
};
