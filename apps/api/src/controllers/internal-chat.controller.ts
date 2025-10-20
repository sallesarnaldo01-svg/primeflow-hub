import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const internalChatController = {
  // Chats
  async listChats(req: Request, res: Response) {
    const chats = await prisma.internalChat.findMany({
      where: {
        participants: {
          has: req.user!.userId
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: chats
    });
  },

  async getChat(req: Request, res: Response) {
    const { id } = req.params;

    const chat = await prisma.internalChat.findFirst({
      where: {
        id,
        participants: {
          has: req.user!.userId
        }
      }
    });

    if (!chat) {
      throw new AppError('Chat não encontrado', 404);
    }

    res.json({
      success: true,
      data: chat
    });
  },

  async createChat(req: Request, res: Response) {
    const { type, participants, name } = req.body;

    // Garantir que o criador está nos participantes
    const allParticipants = Array.from(new Set([
      req.user!.userId,
      ...participants
    ]));

    const chat = await prisma.internalChat.create({
      data: {
        tenantId: req.user!.tenantId,
        type,
        participants: allParticipants,
        name,
        createdById: req.user!.userId
      }
    });

    res.status(201).json({
      success: true,
      data: chat
    });
  },

  async updateChat(req: Request, res: Response) {
    const { id } = req.params;

    const chat = await prisma.internalChat.findFirst({
      where: {
        id,
        participants: {
          has: req.user!.userId
        }
      }
    });

    if (!chat) {
      throw new AppError('Chat não encontrado', 404);
    }

    const updated = await prisma.internalChat.update({
      where: { id },
      data: req.body
    });

    res.json({
      success: true,
      data: updated
    });
  },

  async deleteChat(req: Request, res: Response) {
    const { id } = req.params;

    const chat = await prisma.internalChat.findFirst({
      where: {
        id,
        createdById: req.user!.userId
      }
    });

    if (!chat) {
      throw new AppError('Chat não encontrado ou sem permissão', 404);
    }

    await prisma.internalChat.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Chat deletado com sucesso'
    });
  },

  // Messages
  async listMessages(req: Request, res: Response) {
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    // Verificar se usuário tem acesso ao chat
    const chat = await prisma.internalChat.findFirst({
      where: {
        id: chatId,
        participants: {
          has: req.user!.userId
        }
      }
    });

    if (!chat) {
      throw new AppError('Chat não encontrado', 404);
    }

    const messages = await prisma.internalMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: messages.reverse() // Ordem cronológica
    });
  },

  async sendMessage(req: Request, res: Response) {
    const { chatId } = req.params;
    const { message, mentions, attachments } = req.body;

    // Verificar se usuário tem acesso ao chat
    const chat = await prisma.internalChat.findFirst({
      where: {
        id: chatId,
        participants: {
          has: req.user!.userId
        }
      }
    });

    if (!chat) {
      throw new AppError('Chat não encontrado', 404);
    }

    const newMessage = await prisma.internalMessage.create({
      data: {
        chatId,
        userId: req.user!.userId,
        message,
        mentions,
        attachments,
        readBy: [req.user!.userId]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Atualizar timestamp do chat
    await prisma.internalChat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  },

  async markAsRead(req: Request, res: Response) {
    const { chatId, messageId } = req.params;

    const message = await prisma.internalMessage.findFirst({
      where: { id: messageId, chatId }
    });

    if (!message) {
      throw new AppError('Mensagem não encontrada', 404);
    }

    const readBy = Array.from(new Set([
      ...message.readBy,
      req.user!.userId
    ]));

    const updated = await prisma.internalMessage.update({
      where: { id: messageId },
      data: { readBy }
    });

    res.json({
      success: true,
      data: updated
    });
  },

  async deleteMessage(req: Request, res: Response) {
    const { chatId, messageId } = req.params;

    const message = await prisma.internalMessage.findFirst({
      where: {
        id: messageId,
        chatId,
        userId: req.user!.userId
      }
    });

    if (!message) {
      throw new AppError('Mensagem não encontrada ou sem permissão', 404);
    }

    await prisma.internalMessage.delete({
      where: { id: messageId }
    });

    res.json({
      success: true,
      message: 'Mensagem deletada'
    });
  }
};
