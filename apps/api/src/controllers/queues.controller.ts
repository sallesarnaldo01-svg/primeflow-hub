import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const queuesController = {
  async list(req: Request, res: Response) {
    const queues = await prisma.queue.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: queues
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const queue = await prisma.queue.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!queue) {
      throw new AppError('Fila não encontrada', 404);
    }

    res.json({
      success: true,
      data: queue
    });
  },

  async create(req: Request, res: Response) {
    const { name, description } = req.body;

    const queue = await prisma.queue.create({
      data: {
        name,
        description,
        tenantId: req.user!.tenantId
      }
    });

    res.status(201).json({
      success: true,
      data: queue
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description } = req.body;

    const queue = await prisma.queue.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      data: queue
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.queue.delete({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    res.json({
      success: true,
      message: 'Fila excluída'
    });
  }
};
