import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';
import { broadcastQueue } from '../../worker/src/queues/broadcast.queue.js';

export const broadcastsController = {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [broadcasts, total] = await Promise.all([
      prisma.broadcast.findMany({
        where: { tenantId: req.user!.tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.broadcast.count({
        where: { tenantId: req.user!.tenantId }
      })
    ]);

    res.json({
      success: true,
      data: broadcasts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const broadcast = await prisma.broadcast.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!broadcast) {
      throw new AppError('Broadcast não encontrado', 404);
    }

    res.json({
      success: true,
      data: broadcast
    });
  },

  async create(req: Request, res: Response) {
    const { name, filters, script, config } = req.body;

    const broadcast = await prisma.broadcast.create({
      data: {
        name,
        tenantId: req.user!.tenantId,
        filters: filters || {},
        script: script || [],
        config: config || {},
        status: 'DRAFT',
        stats: { queued: 0, sent: 0, failed: 0 }
      }
    });

    logger.info('Broadcast created', { broadcastId: broadcast.id });

    res.status(201).json({
      success: true,
      data: broadcast
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, filters, script, config } = req.body;

    const broadcast = await prisma.broadcast.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        ...(name && { name }),
        ...(filters && { filters }),
        ...(script && { script }),
        ...(config && { config })
      }
    });

    res.json({
      success: true,
      data: broadcast
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.broadcast.delete({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    res.json({
      success: true,
      message: 'Broadcast excluído'
    });
  },

  async start(req: Request, res: Response) {
    const { id } = req.params;

    const broadcast = await prisma.broadcast.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!broadcast) {
      throw new AppError('Broadcast não encontrado', 404);
    }

    if (broadcast.status !== 'DRAFT' && broadcast.status !== 'PAUSED') {
      throw new AppError('Broadcast não pode ser iniciado', 400);
    }

    // Add to queue
    await broadcastQueue.add('execute', {
      broadcastId: id,
      tenantId: req.user!.tenantId
    });

    await prisma.broadcast.update({
      where: { id },
      data: { status: 'RUNNING' }
    });

    logger.info('Broadcast started', { broadcastId: id });

    res.json({
      success: true,
      message: 'Broadcast iniciado'
    });
  },

  async pause(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.broadcast.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: { status: 'PAUSED' }
    });

    logger.info('Broadcast paused', { broadcastId: id });

    res.json({
      success: true,
      message: 'Broadcast pausado'
    });
  },

  async progress(req: Request, res: Response) {
    const { id } = req.params;

    const broadcast = await prisma.broadcast.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      select: {
        id: true,
        name: true,
        status: true,
        stats: true
      }
    });

    if (!broadcast) {
      throw new AppError('Broadcast não encontrado', 404);
    }

    res.json({
      success: true,
      data: broadcast
    });
  }
};
