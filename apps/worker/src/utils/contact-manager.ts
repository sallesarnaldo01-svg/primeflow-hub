import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export async function getOrCreateContact(tenantId: string, phone: string, name?: string, channel: string = 'whatsapp') {
  try {
    let contact = await prisma.contact.findFirst({
      where: { 
        tenantId, 
        phone 
      }
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          tenantId,
          phone,
          name: name || phone,
          source: channel
        }
      });
      
      logger.info('Contact created', { contactId: contact.id, phone });
    }

    return contact;
  } catch (error) {
    logger.error('Error getting or creating contact', { error, phone });
    throw error;
  }
}

export async function getOrCreateConversation(contactId: string, channel: string, connectionId?: string) {
  try {
    let conversation = await prisma.conversation.findFirst({
      where: { 
        contactId,
        channel: channel.toUpperCase() as any
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          contactId,
          channel: channel.toUpperCase() as any,
          status: 'OPEN',
          unreadCount: 0,
          connectionId
        }
      });
      
      logger.info('Conversation created', { conversationId: conversation.id, contactId });
    }

    return conversation;
  } catch (error) {
    logger.error('Error getting or creating conversation', { error, contactId });
    throw error;
  }
}

export async function saveIncomingMessage(
  conversationId: string,
  content: string,
  type: string = 'TEXT',
  metadata: any = {}
) {
  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        content,
        direction: 'INBOUND',
        status: 'DELIVERED',
        type: type as any,
        metadata
      }
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 }
      }
    });

    logger.info('Incoming message saved', { messageId: message.id, conversationId });
    
    return message;
  } catch (error) {
    logger.error('Error saving incoming message', { error, conversationId });
    throw error;
  }
}
