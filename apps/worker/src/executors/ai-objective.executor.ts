import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

export interface AIObjectiveContext {
  tenantId: string;
  conversationId?: string;
  contactId?: string;
  leadId?: string;
  variables: Record<string, any>;
  objective: {
    type: 'ANSWER_QUESTION' | 'COLLECT_INFO' | 'QUALIFY_LEAD';
    config: any;
  };
}

export interface AIObjectiveResult {
  status: 'SUCCESS' | 'SPEAK_TO_HUMAN' | 'UNABLE_TO_ANSWER';
  data?: any;
  message?: string;
  confidence?: number;
}

export class AIObjectiveExecutor {
  async execute(context: AIObjectiveContext): Promise<AIObjectiveResult> {
    const { objective, variables, tenantId } = context;

    try {
      logger.info('Executing AI Objective', {
        type: objective.type,
        conversationId: context.conversationId
      });

      switch (objective.type) {
        case 'ANSWER_QUESTION':
          return await this.answerQuestion(context);

        case 'COLLECT_INFO':
          return await this.collectInfo(context);

        case 'QUALIFY_LEAD':
          return await this.qualifyLead(context);

        default:
          throw new Error(`Unknown objective type: ${objective.type}`);
      }
    } catch (error) {
      logger.error('Error executing AI objective', { error, objective: objective.type });
      return {
        status: 'UNABLE_TO_ANSWER',
        message: 'Failed to execute objective'
      };
    }
  }

  private async answerQuestion(context: AIObjectiveContext): Promise<AIObjectiveResult> {
    const { objective, variables } = context;
    const { question, requireKnowledge = true } = objective.config;

    // In production, this would:
    // 1. Search knowledge base using RAG
    // 2. Call AI with context
    // 3. Determine if answer is confident enough

    logger.info('Answering question', { question });

    // Simulate knowledge lookup
    const hasKnowledge = Math.random() > 0.3;
    const confidence = Math.random();

    if (!hasKnowledge && requireKnowledge) {
      return {
        status: 'SPEAK_TO_HUMAN',
        message: 'No knowledge found to answer question',
        confidence: 0
      };
    }

    if (confidence < 0.7) {
      return {
        status: 'SPEAK_TO_HUMAN',
        message: 'Low confidence in answer',
        confidence
      };
    }

    return {
      status: 'SUCCESS',
      data: {
        answer: `Simulated answer to: ${question}`,
        sources: ['knowledge_base']
      },
      confidence
    };
  }

  private async collectInfo(context: AIObjectiveContext): Promise<AIObjectiveResult> {
    const { objective, variables, conversationId } = context;
    const { fields, maxAttempts = 3 } = objective.config;

    logger.info('Collecting information', { fields, conversationId });

    // Check which fields are already collected
    const collected: Record<string, any> = {};
    const missing: string[] = [];

    for (const field of fields) {
      if (variables[field]) {
        collected[field] = variables[field];
      } else {
        missing.push(field);
      }
    }

    if (missing.length === 0) {
      return {
        status: 'SUCCESS',
        data: collected
      };
    }

    // Check attempts
    const attempts = variables._collectAttempts || 0;
    if (attempts >= maxAttempts) {
      return {
        status: 'SPEAK_TO_HUMAN',
        message: `Failed to collect: ${missing.join(', ')} after ${maxAttempts} attempts`
      };
    }

    // In production, this would generate a message asking for missing fields
    return {
      status: 'SUCCESS',
      data: {
        collected,
        missing,
        nextPrompt: `Por favor, me informe: ${missing.join(', ')}`
      }
    };
  }

  private async qualifyLead(context: AIObjectiveContext): Promise<AIObjectiveResult> {
    const { objective, variables, leadId, tenantId } = context;
    const { criteria } = objective.config;

    logger.info('Qualifying lead', { leadId, criteria });

    if (!leadId) {
      return {
        status: 'UNABLE_TO_ANSWER',
        message: 'No lead ID provided'
      };
    }

    // Get lead data
    const lead = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.contacts WHERE id = $1 AND tenant_id = $2
    `, leadId, tenantId);

    if (!lead || lead.length === 0) {
      return {
        status: 'UNABLE_TO_ANSWER',
        message: 'Lead not found'
      };
    }

    const leadData = lead[0];

    // Evaluate criteria
    let score = 0;
    const results: Record<string, boolean> = {};

    for (const criterion of criteria) {
      const { field, operator, value } = criterion;
      const leadValue = leadData[field] || variables[field];

      let passes = false;
      switch (operator) {
        case 'equals':
          passes = leadValue === value;
          break;
        case 'contains':
          passes = leadValue && leadValue.includes(value);
          break;
        case 'greater_than':
          passes = leadValue > value;
          break;
        default:
          passes = false;
      }

      results[field] = passes;
      if (passes) score++;
    }

    const qualified = score >= (criteria.length * 0.7); // 70% threshold

    return {
      status: 'SUCCESS',
      data: {
        qualified,
        score,
        maxScore: criteria.length,
        results,
        recommendation: qualified ? 'HOT_LEAD' : 'COLD_LEAD'
      }
    };
  }
}
