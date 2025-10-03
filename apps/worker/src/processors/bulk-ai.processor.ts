import { Job } from 'bullmq';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

interface BulkAIJob {
  tenantId: string;
  leadIds: string[];
  prompt: string;
  agentId?: string;
}

export async function processBulkAI(job: Job<BulkAIJob>) {
  const { tenantId, leadIds, prompt, agentId } = job.data;

  try {
    logger.info('Processing bulk AI action', { tenantId, leadCount: leadIds.length });

    // Buscar agente de IA se especificado
    const agent = agentId ? await prisma.aIProvider.findFirst({
      where: { id: agentId, tenantId }
    }) : null;

    const results = [];

    for (const leadId of leadIds) {
      try {
        // TODO: Buscar contexto do lead (histórico, dados)
        const leadContext = {
          id: leadId,
          // Buscar dados do lead do banco
        };

        // TODO: Chamar LLM com prompt + contexto
        // Por enquanto, mock
        const mockResponse = {
          action: 'send_message',
          message: `Resposta automática para lead ${leadId}`,
          updateStatus: 'qualified'
        };

        // Registrar evento
        await prisma.conversationEvent.create({
          data: {
            tenantId,
            conversationId: leadId,
            type: 'ai_action',
            actor: 'ai_agent',
            actorName: agent?.name || 'Bulk AI',
            content: mockResponse.message,
            metadata: {
              bulkAction: true,
              prompt,
              response: mockResponse
            }
          }
        });

        results.push({
          leadId,
          success: true,
          action: mockResponse.action
        });

        logger.info('Bulk AI processed lead', { leadId });
      } catch (error) {
        logger.error('Failed to process lead in bulk AI', { error, leadId });
        results.push({
          leadId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: true,
      totalLeads: leadIds.length,
      successCount: results.filter(r => r.success).length,
      failureCount: results.filter(r => !r.success).length,
      results
    };
  } catch (error) {
    logger.error('Failed to process bulk AI action', { error });
    throw error;
  }
}
