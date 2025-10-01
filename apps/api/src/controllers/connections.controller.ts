import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';
import { emitToTenant } from '../lib/socket.js';

export const connectionsController = {
  async list(req: Request, res: Response) {
    const connections = await prisma.connection.findMany({
      where: { tenantId: req.user!.tenantId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: connections
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    res.json({
      success: true,
      data: connection
    });
  },

  async create(req: Request, res: Response) {
    const { type, meta } = req.body;

    const connection = await prisma.connection.create({
      data: {
        type,
        tenantId: req.user!.tenantId,
        status: 'DISCONNECTED',
        meta: meta || {}
      }
    });

    logger.info('Connection created', { connectionId: connection.id, type });
    emitToTenant(req.user!.tenantId, 'connection:created', connection);

    res.status(201).json({
      success: true,
      data: connection
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { status, meta } = req.body;

    const connection = await prisma.connection.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        ...(status && { status }),
        ...(meta && { meta })
      }
    });

    emitToTenant(req.user!.tenantId, 'connection:updated', connection);

    res.json({
      success: true,
      data: connection
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.connection.delete({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    logger.info('Connection deleted', { connectionId: id });
    emitToTenant(req.user!.tenantId, 'connection:deleted', { id });

    res.json({
      success: true,
      message: 'Conexão excluída'
    });
  },

  async connect(req: Request, res: Response) {
    const { id } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    // Aqui iniciaria o processo de conexão com o provider
    logger.info('Initiating connection', { connectionId: id, type: connection.type });

    await prisma.connection.update({
      where: { id },
      data: { status: 'CONNECTED' }
    });

    emitToTenant(req.user!.tenantId, 'connection:status', {
      id,
      status: 'CONNECTED'
    });

    res.json({
      success: true,
      message: 'Conexão iniciada'
    });
  },

  async disconnect(req: Request, res: Response) {
    const { id } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    logger.info('Disconnecting', { connectionId: id });

    await prisma.connection.update({
      where: { id },
      data: { status: 'DISCONNECTED' }
    });

    emitToTenant(req.user!.tenantId, 'connection:status', {
      id,
      status: 'DISCONNECTED'
    });

    res.json({
      success: true,
      message: 'Conexão encerrada'
    });
  },

  async status(req: Request, res: Response) {
    const connections = await prisma.connection.findMany({
      where: { tenantId: req.user!.tenantId },
      select: {
        id: true,
        type: true,
        status: true
      }
    });

    const summary = connections.reduce((acc, conn) => {
      const key = conn.type.toLowerCase();
      if (!acc[key]) {
        acc[key] = { connected: 0, total: 0 };
      }
      acc[key].total++;
      if (conn.status === 'CONNECTED') {
        acc[key].connected++;
      }
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      data: {
        connections,
        summary
      }
    });
  }
};
