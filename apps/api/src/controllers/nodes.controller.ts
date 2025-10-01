import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';
import { emitToTenant } from '../lib/socket.js';

export const nodesController = {
  async create(req: Request, res: Response) {
    const { flowId } = req.params;
    const { type, label, x, y, config } = req.body;

    // Verificar se o fluxo pertence ao tenant
    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    const node = await prisma.flowNode.create({
      data: {
        flowId,
        type,
        label,
        x,
        y,
        config
      }
    });

    emitToTenant(req.user!.tenantId, 'node:created', { flowId, node });

    res.status(201).json({
      success: true,
      data: node
    });
  },

  async update(req: Request, res: Response) {
    const { flowId, id } = req.params;
    const { type, label, x, y, config } = req.body;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    const node = await prisma.flowNode.update({
      where: {
        id,
        flowId
      },
      data: {
        ...(type && { type }),
        ...(label !== undefined && { label }),
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
        ...(config !== undefined && { config })
      }
    });

    emitToTenant(req.user!.tenantId, 'node:updated', { flowId, node });

    res.json({
      success: true,
      data: node
    });
  },

  async delete(req: Request, res: Response) {
    const { flowId, id } = req.params;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    // Deletar edges relacionadas
    await prisma.flowEdge.deleteMany({
      where: {
        flowId,
        OR: [
          { sourceId: id },
          { targetId: id }
        ]
      }
    });

    await prisma.flowNode.delete({
      where: {
        id,
        flowId
      }
    });

    emitToTenant(req.user!.tenantId, 'node:deleted', { flowId, nodeId: id });

    res.json({
      success: true,
      message: 'Nó excluído'
    });
  }
};

export const edgesController = {
  async create(req: Request, res: Response) {
    const { flowId } = req.params;
    const { sourceId, targetId, condition, label } = req.body;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    const edge = await prisma.flowEdge.create({
      data: {
        flowId,
        sourceId,
        targetId,
        condition,
        label
      }
    });

    emitToTenant(req.user!.tenantId, 'edge:created', { flowId, edge });

    res.status(201).json({
      success: true,
      data: edge
    });
  },

  async update(req: Request, res: Response) {
    const { flowId, id } = req.params;
    const { condition, label } = req.body;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    const edge = await prisma.flowEdge.update({
      where: {
        id,
        flowId
      },
      data: {
        ...(condition !== undefined && { condition }),
        ...(label !== undefined && { label })
      }
    });

    emitToTenant(req.user!.tenantId, 'edge:updated', { flowId, edge });

    res.json({
      success: true,
      data: edge
    });
  },

  async delete(req: Request, res: Response) {
    const { flowId, id } = req.params;

    const flow = await prisma.flow.findFirst({
      where: {
        id: flowId,
        tenantId: req.user!.tenantId
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    await prisma.flowEdge.delete({
      where: {
        id,
        flowId
      }
    });

    emitToTenant(req.user!.tenantId, 'edge:deleted', { flowId, edgeId: id });

    res.json({
      success: true,
      message: 'Conexão excluída'
    });
  }
};
