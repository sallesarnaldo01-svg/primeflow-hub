import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const aiToolsController = {
  // GET /ai/tools - Listar ferramentas
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;

      const tools = await prisma.aITool.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' }
      });

      res.json(tools);
    } catch (error) {
      logger.error('Erro ao listar ferramentas de IA', { error });
      throw Boom.internal('Erro ao listar ferramentas');
    }
  },

  // POST /ai/tools - Criar ferramenta
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { name, description, endpoint, method, parameters, headers } = req.body;

      const tool = await prisma.aITool.create({
        data: {
          tenantId,
          name,
          description,
          endpoint,
          method: method || 'POST',
          parameters,
          headers,
          active: true
        }
      });

      logger.info('Ferramenta de IA criada', { toolId: tool.id, name });
      res.status(201).json(tool);
    } catch (error) {
      logger.error('Erro ao criar ferramenta de IA', { error });
      throw error;
    }
  },

  // PUT /ai/tools/:id - Atualizar ferramenta
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { name, description, endpoint, method, parameters, headers, active } = req.body;

      const tool = await prisma.aITool.findFirst({
        where: { id, tenantId }
      });

      if (!tool) {
        throw Boom.notFound('Ferramenta não encontrada');
      }

      const updated = await prisma.aITool.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(endpoint && { endpoint }),
          ...(method && { method }),
          ...(parameters && { parameters }),
          ...(headers && { headers }),
          ...(active !== undefined && { active })
        }
      });

      logger.info('Ferramenta de IA atualizada', { toolId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar ferramenta de IA', { error });
      throw error;
    }
  },

  // DELETE /ai/tools/:id - Deletar ferramenta
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const tool = await prisma.aITool.findFirst({
        where: { id, tenantId }
      });

      if (!tool) {
        throw Boom.notFound('Ferramenta não encontrada');
      }

      await prisma.aITool.delete({
        where: { id }
      });

      logger.info('Ferramenta de IA deletada', { toolId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar ferramenta de IA', { error });
      throw error;
    }
  },

  // POST /ai/tools/:id/test - Testar ferramenta
  async test(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { parameters: testParams } = req.body;

      const tool = await prisma.aITool.findFirst({
        where: { id, tenantId }
      });

      if (!tool) {
        throw Boom.notFound('Ferramenta não encontrada');
      }

      // Executar chamada HTTP
      const response = await fetch(tool.endpoint, {
        method: tool.method,
        headers: {
          'Content-Type': 'application/json',
          ...(tool.headers as any || {})
        },
        body: tool.method !== 'GET' ? JSON.stringify(testParams) : undefined
      });

      const result = await response.json();

      res.json({
        success: response.ok,
        status: response.status,
        data: result
      });
    } catch (error) {
      logger.error('Erro ao testar ferramenta de IA', { error });
      throw error;
    }
  }
};
