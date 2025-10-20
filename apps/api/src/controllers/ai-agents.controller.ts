import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const aiAgentsController = {
  async getAgentConfig(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { id } = req.params;

      const config = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.ai_agent_configs
        WHERE agent_id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!config || config.length === 0) {
        // Return default config if none exists
        return res.json({
          agentId: id,
          capabilities: {
            canAssign: false,
            canClose: false,
            canUpdateFields: false,
            canUpdateLifecycle: false,
            canInterpretImages: false,
            canRecommendProducts: false
          },
          actions: [],
          templates: [],
          objectives: [],
          tools: []
        });
      }

      res.json(config[0]);
    } catch (error) {
      logger.error('Error getting agent config', { error });
      res.status(500).json({ error: 'Failed to get agent config' });
    }
  },

  async updateAgentConfig(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { id } = req.params;
      const { capabilities, actions, templates, objectives, tools } = req.body;

      // Upsert config
      const config = await prisma.$queryRawUnsafe(`
        INSERT INTO public.ai_agent_configs 
          (agent_id, tenant_id, capabilities, actions, templates, objectives, tools)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (agent_id, tenant_id) 
        DO UPDATE SET
          capabilities = EXCLUDED.capabilities,
          actions = EXCLUDED.actions,
          templates = EXCLUDED.templates,
          objectives = EXCLUDED.objectives,
          tools = EXCLUDED.tools,
          updated_at = NOW()
        RETURNING *
      `,
        id,
        tenantId,
        JSON.stringify(capabilities || {}),
        JSON.stringify(actions || []),
        JSON.stringify(templates || []),
        JSON.stringify(objectives || []),
        tools || []
      );

      logger.info('Agent config updated', { agentId: id });
      res.json(config[0]);
    } catch (error) {
      logger.error('Error updating agent config', { error });
      res.status(500).json({ error: 'Failed to update agent config' });
    }
  },

  async testAgent(req: Request, res: Response) {
    try {
      const { tenantId } = req.user as any;
      const { id } = req.params;
      const { messages } = req.body;

      // Get agent details
      const agent = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.ai_agents
        WHERE id = $1
      `, id);

      if (!agent || agent.length === 0) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      const agentData = agent[0];

      // Get agent config
      const config = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.ai_agent_configs
        WHERE agent_id = $1 AND tenant_id = $2
      `, id, tenantId);

      const agentConfig = config && config.length > 0 ? config[0] : null;

      // Simulate AI response (in production, call actual AI)
      logger.info('Testing agent', { agentId: id, model: agentData.model });

      const testResponse = {
        role: 'assistant',
        content: `[Test Mode] This is a simulated response from ${agentData.name}. In production, this would call ${agentData.model} with your configured settings.`,
        model: agentData.model,
        capabilities: agentConfig?.capabilities || {},
        actions: agentConfig?.actions || []
      };

      res.json({
        response: testResponse,
        agent: {
          id: agentData.id,
          name: agentData.name,
          model: agentData.model,
          temperature: agentData.temperature,
          maxTokens: agentData.max_tokens
        }
      });
    } catch (error) {
      logger.error('Error testing agent', { error });
      res.status(500).json({ error: 'Failed to test agent' });
    }
  }
};
