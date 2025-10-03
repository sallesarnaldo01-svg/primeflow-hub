import { Job } from 'bullmq';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

interface FollowUpCadenceJob {
  tenantId: string;
  cadenceId: string;
  leadIds: string[];
  stepIndex: number;
}

export async function processFollowUpCadence(job: Job<FollowUpCadenceJob>) {
  const { tenantId, cadenceId, leadIds, stepIndex } = job.data;

  try {
    logger.info('Processing follow-up cadence', { cadenceId, leadIds, stepIndex });

    const cadence = await prisma.followUpCadence.findFirst({
      where: { id: cadenceId, tenantId }
    });

    if (!cadence) {
      throw new Error('Cadence not found');
    }

    const steps = cadence.steps as any[];
    const currentStep = steps[stepIndex];

    if (!currentStep) {
      logger.info('No more steps in cadence', { cadenceId, stepIndex });
      return { success: true, completed: true };
    }

    // Processar cada lead
    for (const leadId of leadIds) {
      try {
        // Registrar evento
        await prisma.conversationEvent.create({
          data: {
            tenantId,
            conversationId: leadId, // Usar leadId como conversationId por enquanto
            type: 'ai_action',
            actor: 'system',
            actorName: 'Follow-up Cadence',
            content: currentStep.message,
            metadata: {
              cadenceId,
              cadenceName: cadence.name,
              stepIndex,
              delay: currentStep.delay
            }
          }
        });

        // TODO: Enviar mensagem real via WhatsApp/Facebook/Instagram
        logger.info('Follow-up message queued', { leadId, stepIndex });
      } catch (error) {
        logger.error('Failed to process lead in cadence', { error, leadId });
      }
    }

    // Agendar próxima etapa se existir
    const nextStepIndex = stepIndex + 1;
    if (nextStepIndex < steps.length) {
      const nextStep = steps[nextStepIndex];
      logger.info('Scheduling next cadence step', {
        cadenceId,
        nextStepIndex,
        delay: nextStep.delay
      });
      // TODO: Agendar próximo job com delay
    }

    return {
      success: true,
      processedLeads: leadIds.length,
      nextStepIndex: nextStepIndex < steps.length ? nextStepIndex : null
    };
  } catch (error) {
    logger.error('Failed to process follow-up cadence', { error, cadenceId });
    throw error;
  }
}
