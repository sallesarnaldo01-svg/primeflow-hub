import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const followUpCadenceController = {
  // GET /ai/cadences - Listar cadências
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;

      const cadences = await prisma.followUpCadence.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
      });

      res.json(cadences);
    } catch (error) {
      logger.error('Erro ao listar cadências', { error });
      throw Boom.internal('Erro ao listar cadências');
    }
  },

  // GET /ai/cadences/:id - Obter cadência
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const cadence = await prisma.followUpCadence.findFirst({
        where: { id, tenantId }
      });

      if (!cadence) {
        throw Boom.notFound('Cadência não encontrada');
      }

      res.json(cadence);
    } catch (error) {
      logger.error('Erro ao obter cadência', { error });
      throw error;
    }
  },

  // POST /ai/cadences - Criar cadência
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { name, trigger, steps, agentId } = req.body;

      const cadence = await prisma.followUpCadence.create({
        data: {
          tenantId,
          name,
          trigger,
          steps,
          agentId,
          active: true
        }
      });

      logger.info('Cadência criada', { cadenceId: cadence.id });
      res.status(201).json(cadence);
    } catch (error) {
      logger.error('Erro ao criar cadência', { error });
      throw error;
    }
  },

  // PUT /ai/cadences/:id - Atualizar cadência
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { name, trigger, steps, agentId, active } = req.body;

      const cadence = await prisma.followUpCadence.findFirst({
        where: { id, tenantId }
      });

      if (!cadence) {
        throw Boom.notFound('Cadência não encontrada');
      }

      const updated = await prisma.followUpCadence.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(trigger && { trigger }),
          ...(steps && { steps }),
          ...(agentId !== undefined && { agentId }),
          ...(active !== undefined && { active })
        }
      });

      logger.info('Cadência atualizada', { cadenceId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar cadência', { error });
      throw error;
    }
  },

  // DELETE /ai/cadences/:id - Deletar cadência
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const cadence = await prisma.followUpCadence.findFirst({
        where: { id, tenantId }
      });

      if (!cadence) {
        throw Boom.notFound('Cadência não encontrada');
      }

      await prisma.followUpCadence.delete({
        where: { id }
      });

      logger.info('Cadência deletada', { cadenceId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar cadência', { error });
      throw error;
    }
  },

  // POST /ai/cadences/:id/trigger - Disparar cadência manualmente
  async trigger(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { leadIds } = req.body;

      const cadence = await prisma.followUpCadence.findFirst({
        where: { id, tenantId }
      });

      if (!cadence) {
        throw Boom.notFound('Cadência não encontrada');
      }

      // TODO: Implementar enfileiramento no Redis
      logger.info('Cadência disparada', { cadenceId: id, leadIds });

      res.json({
        success: true,
        message: 'Cadência enfileirada',
        leadCount: leadIds.length
      });
    } catch (error) {
      logger.error('Erro ao disparar cadência', { error });
      throw error;
    }
  }
};
