import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const notificationsController = {
  async list(req: Request, res: Response) {
    const { unread } = req.query;
    
    const where: any = {
      userId: req.user!.userId
    };

    if (unread === 'true') {
      where.read = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({
      success: true,
      data: notifications
    });
  },

  async getUnreadCount(req: Request, res: Response) {
    const count = await prisma.notification.count({
      where: {
        userId: req.user!.userId,
        read: false
      }
    });

    res.json({
      success: true,
      data: { count }
    });
  },

  async markAsRead(req: Request, res: Response) {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== req.user!.userId) {
      throw new AppError('Notificação não encontrada', 404);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      data: updated
    });
  },

  async markAllAsRead(req: Request, res: Response) {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.userId,
        read: false
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification || notification.userId !== req.user!.userId) {
      throw new AppError('Notificação não encontrada', 404);
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Notificação deletada'
    });
  }
};
