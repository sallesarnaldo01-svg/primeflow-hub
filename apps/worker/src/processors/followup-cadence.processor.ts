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

    // Buscar a cadência
    const cadence = await prisma.followUpCadence.findFirst({
      where: {
        id: cadenceId,
        tenantId,
        active: true
      }
    });

    if (!cadence) {
      throw new Error('Cadence not found or inactive');
    }

    const steps = cadence.steps as any[];
    const currentStep = steps[stepIndex];

    if (!currentStep) {
      logger.info('No more steps in cadence', { cadenceId, stepIndex });
      return { success: true, message: 'Cadence completed' };
    }

    // Para cada lead, processar o step atual
    for (const leadId of leadIds) {
      try {
        // TODO: Enviar mensagem via canal apropriado
        // Por enquanto, apenas log
        logger.info('Processing cadence step for lead', {
          leadId,
          step: currentStep.message,
          delay: currentStep.delay
        });

        // Registrar evento na conversa
        await prisma.conversationEvent.create({
          data: {
            tenantId,
            conversationId: leadId, // Usando leadId como conversationId por simplicidade
            type: 'ai_action',
            actor: 'system',
            actorName: 'Follow-up Cadence',
            content: currentStep.message,
            metadata: {
              cadenceId,
              cadenceName: cadence.name,
              stepIndex
            }
          }
        });
      } catch (error) {
        logger.error('Failed to process step for lead', { error, leadId });
      }
    }

    // Se houver próximo step, agendar
    if (stepIndex + 1 < steps.length) {
      const nextStep = steps[stepIndex + 1];
      const delayMs = nextStep.delay * 60 * 1000; // Converter minutos para ms

      // TODO: Agendar próximo job com delay
      logger.info('Next step scheduled', {
        cadenceId,
        nextStepIndex: stepIndex + 1,
        delayMs
      });
    }

    logger.info('Follow-up cadence processed successfully', { cadenceId });

    return {
      success: true,
      processedLeads: leadIds.length,
      nextStepIndex: stepIndex + 1 < steps.length ? stepIndex + 1 : null
    };
  } catch (error) {
    logger.error('Failed to process follow-up cadence', { error, cadenceId });
    throw error;
  }
}
