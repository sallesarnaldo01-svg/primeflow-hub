import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const aiProvidersController = {
  // GET /ai/providers - Listar provedores
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;

      const providers = await prisma.aIProvider.findMany({
        where: { tenantId },
        include: {
          agents: {
            where: { active: true },
            select: {
              id: true,
              name: true,
              model: true,
              active: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(providers);
    } catch (error) {
      logger.error('Erro ao listar provedores de IA', { error });
      throw Boom.internal('Erro ao listar provedores');
    }
  },

  // POST /ai/providers - Criar provedor
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { type, name, apiKey, config } = req.body;

      // Verificar se já existe um provedor do mesmo tipo
      const existing = await prisma.aIProvider.findUnique({
        where: { 
          tenantId_type: { tenantId, type }
        }
      });

      if (existing) {
        throw Boom.conflict(`Provedor ${type} já existe`);
      }

      const provider = await prisma.aIProvider.create({
        data: {
          tenantId,
          type,
          name,
          apiKey,
          config,
          active: true
        }
      });

      logger.info('Provedor de IA criado', { providerId: provider.id, type });
      res.status(201).json(provider);
    } catch (error) {
      logger.error('Erro ao criar provedor de IA', { error });
      throw error;
    }
  },

  // PUT /ai/providers/:id - Atualizar provedor
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { name, apiKey, config, active } = req.body;

      const provider = await prisma.aIProvider.findFirst({
        where: { id, tenantId }
      });

      if (!provider) {
        throw Boom.notFound('Provedor não encontrado');
      }

      const updated = await prisma.aIProvider.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(apiKey && { apiKey }),
          ...(config && { config }),
          ...(active !== undefined && { active })
        }
      });

      logger.info('Provedor de IA atualizado', { providerId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar provedor de IA', { error });
      throw error;
    }
  },

  // DELETE /ai/providers/:id - Deletar provedor
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const provider = await prisma.aIProvider.findFirst({
        where: { id, tenantId }
      });

      if (!provider) {
        throw Boom.notFound('Provedor não encontrado');
      }

      await prisma.aIProvider.delete({
        where: { id }
      });

      logger.info('Provedor de IA deletado', { providerId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar provedor de IA', { error });
      throw error;
    }
  },

  // GET /ai/agents - Listar agentes
  async listAgents(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;

      const agents = await prisma.aIAgent.findMany({
        where: { tenantId },
        include: {
          provider: {
            select: {
              id: true,
              type: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(agents);
    } catch (error) {
      logger.error('Erro ao listar agentes de IA', { error });
      throw Boom.internal('Erro ao listar agentes');
    }
  },

  // POST /ai/agents - Criar agente
  async createAgent(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { providerId, name, model, systemPrompt, temperature, maxTokens, config } = req.body;

      // Verificar se o provedor existe e pertence ao tenant
      const provider = await prisma.aIProvider.findFirst({
        where: { id: providerId, tenantId }
      });

      if (!provider) {
        throw Boom.notFound('Provedor não encontrado');
      }

      const agent = await prisma.aIAgent.create({
        data: {
          tenantId,
          providerId,
          name,
          model,
          systemPrompt,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 2000,
          config,
          active: true
        }
      });

      logger.info('Agente de IA criado', { agentId: agent.id, model });
      res.status(201).json(agent);
    } catch (error) {
      logger.error('Erro ao criar agente de IA', { error });
      throw error;
    }
  },

  // PUT /ai/agents/:id - Atualizar agente
  async updateAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { name, model, systemPrompt, temperature, maxTokens, config, active } = req.body;

      const agent = await prisma.aIAgent.findFirst({
        where: { id, tenantId }
      });

      if (!agent) {
        throw Boom.notFound('Agente não encontrado');
      }

      const updated = await prisma.aIAgent.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(model && { model }),
          ...(systemPrompt && { systemPrompt }),
          ...(temperature !== undefined && { temperature }),
          ...(maxTokens !== undefined && { maxTokens }),
          ...(config && { config }),
          ...(active !== undefined && { active })
        }
      });

      logger.info('Agente de IA atualizado', { agentId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar agente de IA', { error });
      throw error;
    }
  },

  // DELETE /ai/agents/:id - Deletar agente
  async deleteAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const agent = await prisma.aIAgent.findFirst({
        where: { id, tenantId }
      });

      if (!agent) {
        throw Boom.notFound('Agente não encontrado');
      }

      await prisma.aIAgent.delete({
        where: { id }
      });

      logger.info('Agente de IA deletado', { agentId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar agente de IA', { error });
      throw error;
    }
  },

  // POST /ai/test - Testar chamada de IA
  async test(req: Request, res: Response) {
    try {
      const { agentId, message } = req.body;
      const tenantId = req.user?.tenantId;

      const agent = await prisma.aIAgent.findFirst({
        where: { id: agentId, tenantId },
        include: { provider: true }
      });

      if (!agent) {
        throw Boom.notFound('Agente não encontrado');
      }

      // Aqui será implementada a lógica de chamada aos provedores
      // Por enquanto, retornar mock
      const response = {
        success: true,
        provider: agent.provider.type,
        model: agent.model,
        message: 'Teste realizado com sucesso (mock)',
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      logger.error('Erro ao testar IA', { error });
      throw error;
    }
  }
};
