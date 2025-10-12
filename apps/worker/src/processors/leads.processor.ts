import { Job } from 'bullmq';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

interface LeadScoringJob {
  leadId: string;
  tenantId: string;
}

interface LeadDistributionJob {
  tenantId: string;
  method: 'round_robin' | 'territory';
}

export async function processLeadScoring(job: Job<LeadScoringJob>) {
  const { leadId, tenantId } = job.data;

  try {
    logger.info('Processing lead scoring', { leadId });

    // Get lead data
    const lead = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.leads WHERE id = $1
    `, leadId);

    if (!lead || lead.length === 0) {
      throw new Error('Lead not found');
    }

    // Get scoring rules
    const rules = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.lead_scoring_rules 
      WHERE tenant_id = $1 AND active = TRUE 
      ORDER BY priority DESC
    `, tenantId);

    let totalScore = 0;

    // Calculate score based on rules
    for (const rule of rules as any[]) {
      const condition = rule.condition;
      
      // Simple condition evaluation (can be enhanced)
      if (condition.field && condition.operator && condition.value) {
        const leadValue = lead[0][condition.field];
        
        switch (condition.operator) {
          case 'equals':
            if (leadValue === condition.value) totalScore += rule.points;
            break;
          case 'contains':
            if (leadValue && leadValue.includes(condition.value)) totalScore += rule.points;
            break;
          case 'greater_than':
            if (leadValue > condition.value) totalScore += rule.points;
            break;
        }
      } else {
        // Default: add points
        totalScore += rule.points;
      }
    }

    // Update lead score
    await prisma.$queryRawUnsafe(`
      UPDATE public.leads 
      SET score = $1, updated_at = NOW() 
      WHERE id = $2
    `, totalScore, leadId);

    logger.info('Lead scoring completed', { leadId, score: totalScore });

    return { leadId, score: totalScore };
  } catch (error) {
    logger.error('Error processing lead scoring', { leadId, error });
    throw error;
  }
}

export async function processLeadDistribution(job: Job<LeadDistributionJob>) {
  const { tenantId, method } = job.data;

  try {
    logger.info('Processing lead distribution', { tenantId, method });

    // Get unassigned leads
    const unassignedLeads = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.leads 
      WHERE tenant_id = $1 AND owner_id IS NULL 
      ORDER BY created_at ASC
    `, tenantId);

    if (unassignedLeads.length === 0) {
      logger.info('No unassigned leads to distribute');
      return { distributed: 0 };
    }

    // Get available agents
    const agents = await prisma.$queryRawUnsafe(`
      SELECT ur.user_id 
      FROM public.user_roles ur
      WHERE ur.role IN ('admin', 'manager', 'seller')
    `);

    if (!agents || agents.length === 0) {
      logger.warn('No agents available for lead distribution');
      return { distributed: 0 };
    }

    let distributed = 0;
    let agentIndex = 0;

    for (const lead of unassignedLeads as any[]) {
      const agent = agents[agentIndex % agents.length];
      
      await prisma.$queryRawUnsafe(`
        UPDATE public.leads 
        SET owner_id = $1, updated_at = NOW() 
        WHERE id = $2
      `, agent.user_id, lead.id);

      // Create status history
      await prisma.$queryRawUnsafe(`
        INSERT INTO public.lead_status_history 
          (lead_id, to_status, changed_by, reason)
        VALUES ($1, $2, $3, 'Auto-distributed')
      `, lead.id, lead.status, agent.user_id);

      distributed++;
      agentIndex++;

      logger.info('Lead assigned', { leadId: lead.id, agentId: agent.user_id });
    }

    logger.info('Lead distribution completed', { distributed });

    return { distributed };
  } catch (error) {
    logger.error('Error processing lead distribution', { tenantId, error });
    throw error;
  }
}
