import { Job } from 'bullmq';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

interface BulkAIJob {
  tenantId: string;
  leadIds: string[];
  prompt: string;
  agentId: string;
}

export async function processBulkAI(job: Job<BulkAIJob>) {
  const { tenantId, leadIds, prompt, agentId } = job.data;

  try {
    logger.info('Processing bulk AI action', { leadIds: leadIds.length, agentId });

    // Buscar o agente
    const agent = await prisma.aIAgent.findFirst({
      where: {
        id: agentId,
        tenantId,
        active: true
      },
      include: {
        provider: true
      }
    });

    if (!agent) {
      throw new Error('Agent not found or inactive');
    }

    const results = [];

    // Processar cada lead
    for (const leadId of leadIds) {
      try {
        // TODO: Buscar contexto do lead (histórico, dados)
        const leadContext = {
          leadId,
          // Adicionar dados do lead aqui
        };

        // TODO: Chamar o LLM com prompt + contexto
        const llmResponse = {
          success: true,
          action: 'send_message',
          message: `Processado com IA: ${prompt}`
        };

        // Executar a ação retornada
        logger.info('AI action executed for lead', { leadId, action: llmResponse.action });

        // Registrar evento
        await prisma.conversationEvent.create({
          data: {
            tenantId,
            conversationId: leadId,
            type: 'ai_action',
            actor: 'ai_agent',
            actorId: agentId,
            actorName: agent.name,
            content: llmResponse.message,
            metadata: {
              bulkAction: true,
              originalPrompt: prompt
            }
          }
        });

        results.push({
          leadId,
          success: true
        });
      } catch (error) {
        logger.error('Failed to process lead in bulk action', { error, leadId });
        results.push({
          leadId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    logger.info('Bulk AI action completed', { totalProcessed: results.length });

    return {
      success: true,
      results,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length
    };
  } catch (error) {
    logger.error('Failed to process bulk AI action', { error });
    throw error;
  }
}
