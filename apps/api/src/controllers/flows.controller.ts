import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';
import { emitToTenant } from '../lib/socket.js';

export const flowsController = {
  async list(req: Request, res: Response) {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [flows, total] = await Promise.all([
      prisma.flow.findMany({
        where: { tenantId: req.user!.tenantId },
        include: {
          queue: true,
          _count: {
            select: { nodes: true, edges: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.flow.count({
        where: { tenantId: req.user!.tenantId }
      })
    ]);

    res.json({
      success: true,
      data: flows,
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

    const flow = await prisma.flow.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      include: {
        nodes: {
          orderBy: { createdAt: 'asc' }
        },
        edges: {
          orderBy: { id: 'asc' }
        },
        queue: true
      }
    });

    if (!flow) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    res.json({
      success: true,
      data: flow
    });
  },

  async create(req: Request, res: Response) {
    const { name, queueId, variables } = req.body;

    const flow = await prisma.flow.create({
      data: {
        name,
        tenantId: req.user!.tenantId,
        queueId,
        variables: variables || {},
        nodes: {
          create: {
            type: 'START',
            label: 'Início',
            x: 250,
            y: 50,
            config: {}
          }
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    logger.info('Flow created', { flowId: flow.id, userId: req.user!.userId });
    emitToTenant(req.user!.tenantId, 'flow:created', flow);

    res.status(201).json({
      success: true,
      data: flow
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, status, active, queueId, variables } = req.body;

    const flow = await prisma.flow.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(active !== undefined && { active }),
        ...(queueId !== undefined && { queueId }),
        ...(variables && { variables })
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    emitToTenant(req.user!.tenantId, 'flow:updated', flow);

    res.json({
      success: true,
      data: flow
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.flow.delete({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    logger.info('Flow deleted', { flowId: id, userId: req.user!.userId });
    emitToTenant(req.user!.tenantId, 'flow:deleted', { id });

    res.json({
      success: true,
      message: 'Fluxo excluído'
    });
  },

  async publish(req: Request, res: Response) {
    const { id } = req.params;

    const flow = await prisma.flow.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        status: 'PUBLISHED',
        version: { increment: 1 }
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    logger.info('Flow published', { flowId: id, version: flow.version });
    emitToTenant(req.user!.tenantId, 'flow:published', flow);

    res.json({
      success: true,
      data: flow
    });
  },

  async duplicate(req: Request, res: Response) {
    const { id } = req.params;

    const original = await prisma.flow.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    if (!original) {
      throw new AppError('Fluxo não encontrado', 404);
    }

    const duplicate = await prisma.flow.create({
      data: {
        name: `${original.name} (Cópia)`,
        tenantId: req.user!.tenantId,
        queueId: original.queueId,
        variables: original.variables,
        status: 'DRAFT',
        nodes: {
          create: original.nodes.map(node => ({
            type: node.type,
            label: node.label,
            x: node.x + 50,
            y: node.y + 50,
            config: node.config
          }))
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    res.status(201).json({
      success: true,
      data: duplicate
    });
  },

  async validate(req: Request, res: Response) {
    const flow = req.body;
    const errors: any[] = [];

    // Validação básica
    if (!flow.nodes?.length) {
      errors.push({ field: 'nodes', message: 'Fluxo deve ter pelo menos um nó' });
    }

    const startNodes = flow.nodes?.filter((n: any) => n.type === 'START') || [];
    if (startNodes.length === 0) {
      errors.push({ field: 'nodes', message: 'Fluxo deve ter um nó de início' });
    }
    if (startNodes.length > 1) {
      errors.push({ field: 'nodes', message: 'Fluxo deve ter apenas um nó de início' });
    }

    // Verificar nós sem saída (exceto nós finais)
    const nodeIds = new Set(flow.nodes?.map((n: any) => n.id) || []);
    const nodesWithEdges = new Set(flow.edges?.map((e: any) => e.sourceId) || []);
    
    flow.nodes?.forEach((node: any) => {
      if (!['TICKET', 'TYPEBOT'].includes(node.type) && !nodesWithEdges.has(node.id) && node.type !== 'START') {
        errors.push({
          field: `node:${node.id}`,
          message: `Nó "${node.label || node.type}" não tem conexões de saída`
        });
      }
    });

    res.json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors
      }
    });
  }
};
