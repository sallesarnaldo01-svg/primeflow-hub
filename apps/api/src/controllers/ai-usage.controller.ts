import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const aiUsageController = {
  // GET /ai/usage - Listar uso de IA
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { leadId, agentId, startDate, endDate, limit = 100 } = req.query;

      const usage = await prisma.aIUsage.findMany({
        where: {
          tenantId,
          ...(leadId && { leadId: leadId as string }),
          ...(agentId && { agentId: agentId as string }),
          ...(startDate && endDate && {
            createdAt: {
              gte: new Date(startDate as string),
              lte: new Date(endDate as string)
            }
          })
        },
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      });

      res.json(usage);
    } catch (error) {
      logger.error('Erro ao listar uso de IA', { error });
      throw Boom.internal('Erro ao listar uso');
    }
  },

  // GET /ai/usage/stats - Estatísticas de uso
  async stats(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { startDate, endDate } = req.query;

      const whereClause: any = { tenantId };
      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const [totalUsage, totalCost, usageByModel] = await Promise.all([
        // Total de tokens
        prisma.aIUsage.aggregate({
          where: whereClause,
          _sum: {
            totalTokens: true,
            promptTokens: true,
            completionTokens: true
          },
          _count: true
        }),
        // Custo total
        prisma.aIUsage.aggregate({
          where: whereClause,
          _sum: { cost: true }
        }),
        // Por modelo
        prisma.aIUsage.groupBy({
          by: ['model'],
          where: whereClause,
          _sum: {
            totalTokens: true,
            cost: true
          },
          _count: true
        })
      ]);

      res.json({
        totalInteractions: totalUsage._count,
        totalTokens: totalUsage._sum.totalTokens || 0,
        totalPromptTokens: totalUsage._sum.promptTokens || 0,
        totalCompletionTokens: totalUsage._sum.completionTokens || 0,
        totalCost: totalCost._sum.cost || 0,
        byModel: usageByModel.map(m => ({
          model: m.model,
          interactions: m._count,
          totalTokens: m._sum.totalTokens || 0,
          totalCost: m._sum.cost || 0
        }))
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas', { error });
      throw error;
    }
  },

  // GET /ai/usage/lead/:leadId - Uso por lead
  async byLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const tenantId = req.user?.tenantId;

      const [usage, stats] = await Promise.all([
        prisma.aIUsage.findMany({
          where: { tenantId, leadId },
          orderBy: { createdAt: 'desc' },
          take: 50
        }),
        prisma.aIUsage.aggregate({
          where: { tenantId, leadId },
          _sum: {
            totalTokens: true,
            cost: true
          },
          _count: true
        })
      ]);

      res.json({
        interactions: usage,
        summary: {
          totalInteractions: stats._count,
          totalTokens: stats._sum.totalTokens || 0,
          totalCost: stats._sum.cost || 0
        }
      });
    } catch (error) {
      logger.error('Erro ao obter uso por lead', { error });
      throw error;
    }
  },

  // POST /ai/usage - Registrar uso (interno, chamado pelo worker)
  async create(req: Request, res: Response) {
    try {
      const {
        tenantId,
        agentId,
        providerId,
        leadId,
        conversationId,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        cost,
        request,
        response
      } = req.body;

      const usage = await prisma.aIUsage.create({
        data: {
          tenantId,
          agentId,
          providerId,
          leadId,
          conversationId,
          model,
          promptTokens,
          completionTokens,
          totalTokens,
          cost,
          request,
          response
        }
      });

      logger.info('Uso de IA registrado', { usageId: usage.id, model, cost });
      res.status(201).json(usage);
    } catch (error) {
      logger.error('Erro ao registrar uso', { error });
      throw error;
    }
  }
};
