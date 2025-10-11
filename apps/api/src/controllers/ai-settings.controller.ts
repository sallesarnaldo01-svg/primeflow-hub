import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

/**
 * GET /api/ai-agents/:id
 * Get a specific AI agent
 */
export async function getAgent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const agent = await prisma.aIAgent.findFirst({
      where: {
        id,
        tenantId
      },
      include: {
        provider: {
          select: {
            id: true,
            type: true,
            name: true
          }
        }
      }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    res.json(agent);
  } catch (error) {
    logger.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Erro ao buscar agente' });
  }
}

/**
 * GET /api/ai-agents
 * List all AI agents for the tenant
 */
export async function listAgents(req: Request, res: Response) {
  try {
    const tenantId = req.user!.tenantId;

    const agents = await prisma.aIAgent.findMany({
      where: {
        tenantId
      },
      include: {
        provider: {
          select: {
            id: true,
            type: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(agents);
  } catch (error) {
    logger.error('Error listing agents:', error);
    res.status(500).json({ error: 'Erro ao listar agentes' });
  }
}

/**
 * PUT /api/ai-agents/:id/system-prompt
 * Update the system prompt of an AI agent
 */
export async function updateSystemPrompt(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { system_prompt } = req.body;
    const tenantId = req.user!.tenantId;

    // Validação
    if (!system_prompt || typeof system_prompt !== 'string') {
      return res.status(400).json({
        error: 'O prompt do sistema é obrigatório'
      });
    }

    if (system_prompt.trim().length < 50) {
      return res.status(400).json({
        error: 'O prompt do sistema deve ter pelo menos 50 caracteres'
      });
    }

    // Verificar se o agente existe e pertence ao tenant
    const existingAgent = await prisma.aIAgent.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingAgent) {
      return res.status(404).json({
        error: 'Agente não encontrado'
      });
    }

    // Atualizar no banco
    const agent = await prisma.aIAgent.update({
      where: { id },
      data: {
        systemPrompt: system_prompt,
        updatedAt: new Date()
      },
      include: {
        provider: {
          select: {
            id: true,
            type: true,
            name: true
          }
        }
      }
    });

    logger.info('System prompt updated', {
      agentId: id,
      tenantId,
      userId: req.user!.id
    });

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    logger.error('Error updating system prompt:', error);
    res.status(500).json({ error: 'Erro ao atualizar prompt do sistema' });
  }
}

/**
 * PUT /api/ai-agents/:id
 * Update an AI agent
 */
export async function updateAgent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const { name, model, systemPrompt, temperature, maxTokens, active, config } = req.body;

    // Verificar se o agente existe e pertence ao tenant
    const existingAgent = await prisma.aIAgent.findFirst({
      where: {
        id,
        tenantId
      }
    });

    if (!existingAgent) {
      return res.status(404).json({
        error: 'Agente não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (model !== undefined) updateData.model = model;
    if (systemPrompt !== undefined) updateData.systemPrompt = systemPrompt;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (maxTokens !== undefined) updateData.maxTokens = maxTokens;
    if (active !== undefined) updateData.active = active;
    if (config !== undefined) updateData.config = config;

    // Atualizar no banco
    const agent = await prisma.aIAgent.update({
      where: { id },
      data: updateData,
      include: {
        provider: {
          select: {
            id: true,
            type: true,
            name: true
          }
        }
      }
    });

    logger.info('Agent updated', {
      agentId: id,
      tenantId,
      userId: req.user!.id,
      changes: Object.keys(updateData)
    });

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    logger.error('Error updating agent:', error);
    res.status(500).json({ error: 'Erro ao atualizar agente' });
  }
}
