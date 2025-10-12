import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { emitToTenant } from '../lib/socket.js';
import { logger } from '../lib/logger.js';

async function getOrCreateContact(tenantId: string, phone: string, name?: string) {
  let contact = await prisma.contact.findFirst({
    where: { tenantId, phone }
  });

  if (!contact) {
    contact = await prisma.contact.create({
      data: {
        tenantId,
        phone,
        name: name || phone,
        source: 'whatsapp'
      }
    });
  }

  return contact;
}

async function getOrCreateConversation(contactId: string, channel: string, tenantId: string) {
  let conversation = await prisma.conversation.findFirst({
    where: { 
      contactId,
      channel: channel.toUpperCase()
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        contactId,
        channel: channel.toUpperCase() as any,
        status: 'OPEN',
        unreadCount: 0
      }
    });
  }

  return conversation;
}

export const webhooksController = {
  async whatsappWebhook(req: Request, res: Response) {
    try {
      const { type, data } = req.body;
      
      if (type === 'message') {
        const tenantId = req.user!.tenantId;
        const contact = await getOrCreateContact(tenantId, data.from, data.name);
        const conversation = await getOrCreateConversation(contact.id, 'whatsapp', tenantId);
        
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            content: data.text || '',
            direction: 'INBOUND',
            status: 'DELIVERED',
            type: data.type || 'TEXT',
            metadata: data.metadata || {}
          }
        });

        // Update conversation
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 }
          }
        });
        
        emitToTenant(tenantId, 'message:new', { 
          conversationId: conversation.id,
          message,
          contactName: contact.name
        });

        logger.info('WhatsApp webhook processed', { messageId: message.id });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('WhatsApp webhook error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async facebookWebhook(req: Request, res: Response) {
    try {
      const { entry } = req.body;
      
      if (!entry || !entry[0]?.messaging) {
        return res.status(200).json({ success: true });
      }

      const tenantId = req.user!.tenantId;

      for (const messagingEvent of entry[0].messaging) {
        if (messagingEvent.message) {
          const senderId = messagingEvent.sender.id;
          const messageText = messagingEvent.message.text;

          const contact = await getOrCreateContact(tenantId, senderId, `Facebook User ${senderId}`);
          const conversation = await getOrCreateConversation(contact.id, 'facebook', tenantId);
          
          const message = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: messageText || '',
              direction: 'INBOUND',
              status: 'DELIVERED',
              type: 'TEXT',
              metadata: { messageId: messagingEvent.message.mid }
            }
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              lastMessageAt: new Date(),
              unreadCount: { increment: 1 }
            }
          });
          
          emitToTenant(tenantId, 'message:new', { 
            conversationId: conversation.id,
            message,
            contactName: contact.name
          });
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Facebook webhook error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  
  async instagramWebhook(req: Request, res: Response) {
    try {
      const { entry } = req.body;
      
      if (!entry || !entry[0]?.messaging) {
        return res.status(200).json({ success: true });
      }

      const tenantId = req.user!.tenantId;

      for (const messagingEvent of entry[0].messaging) {
        if (messagingEvent.message) {
          const senderId = messagingEvent.sender.id;
          const messageText = messagingEvent.message.text;

          const contact = await getOrCreateContact(tenantId, senderId, `Instagram User ${senderId}`);
          const conversation = await getOrCreateConversation(contact.id, 'instagram', tenantId);
          
          const message = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: messageText || '',
              direction: 'INBOUND',
              status: 'DELIVERED',
              type: 'TEXT',
              metadata: { messageId: messagingEvent.message.mid }
            }
          });

          await prisma.conversation.update({
            where: { id: conversation.id },
            data: {
              lastMessageAt: new Date(),
              unreadCount: { increment: 1 }
            }
          });
          
          emitToTenant(tenantId, 'message:new', { 
            conversationId: conversation.id,
            message,
            contactName: contact.name
          });
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Instagram webhook error', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
