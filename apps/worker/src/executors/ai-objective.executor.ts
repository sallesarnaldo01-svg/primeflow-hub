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
    const { objective, variables, tenantId } = context;
    const { question, requireKnowledge = true, confidenceThreshold = 0.7 } = objective.config;

    logger.info('Answering question with AI', { question });

    try {
      // 1. Search knowledge base using RAG
      const ragUrl = `${process.env.SUPABASE_URL}/functions/v1/rag-search`;
      const ragResponse = await fetch(ragUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          query: question,
          tenantId,
          limit: 3
        })
      });

      let knowledgeContext = '';
      let hasKnowledge = false;

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        if (ragData.results && ragData.results.length > 0) {
          hasKnowledge = true;
          knowledgeContext = ragData.results.map((r: any) => r.content).join('\n\n');
        }
      }

      if (!hasKnowledge && requireKnowledge) {
        return {
          status: 'SPEAK_TO_HUMAN',
          message: 'No knowledge found to answer question',
          confidence: 0
        };
      }

      // 2. Call Lovable AI with context
      const systemPrompt = `Você é um assistente que responde perguntas baseado em uma base de conhecimento.

${hasKnowledge ? `# BASE DE CONHECIMENTO\n${knowledgeContext}\n` : ''}

Responda a pergunta de forma clara e concisa. Se você não tiver certeza da resposta ou se a informação não estiver na base de conhecimento, diga "UNCERTAIN".`;

      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI API call failed');
      }

      const aiData = await aiResponse.json();
      const answer = aiData.choices[0].message.content;

      // 3. Determine confidence
      const isUncertain = answer.includes('UNCERTAIN') || 
                         answer.includes('não tenho certeza') ||
                         answer.includes('não sei');

      if (isUncertain) {
        return {
          status: 'SPEAK_TO_HUMAN',
          message: 'AI is uncertain about the answer',
          confidence: 0.5
        };
      }

      return {
        status: 'SUCCESS',
        data: {
          answer,
          sources: hasKnowledge ? ['knowledge_base'] : ['general_knowledge'],
          usedKnowledge: hasKnowledge
        },
        confidence: hasKnowledge ? 0.9 : 0.6
      };

    } catch (error) {
      logger.error('Error in answerQuestion', { error });
      return {
        status: 'UNABLE_TO_ANSWER',
        message: 'Failed to generate answer',
        confidence: 0
      };
    }
  }

  private async collectInfo(context: AIObjectiveContext): Promise<AIObjectiveResult> {
    const { objective, variables, conversationId, tenantId } = context;
    const { fields, maxAttempts = 3 } = objective.config;

    logger.info('Collecting information with AI', { fields, conversationId });

    try {
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
          message: `Failed to collect: ${missing.join(', ')} after ${maxAttempts} attempts`,
          data: { collected, missing }
        };
      }

      // Use AI to generate natural prompt for missing info
      const systemPrompt = `Você é um assistente que coleta informações de clientes.

Campos já coletados: ${Object.keys(collected).join(', ') || 'nenhum'}
Campos faltantes: ${missing.join(', ')}

Gere uma mensagem natural e conversacional pedindo as informações faltantes. Seja breve e direto.`;

      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Gere uma mensagem pedindo: ${missing.join(', ')}` }
          ],
          temperature: 0.7,
          max_tokens: 200
        }),
      });

      if (!aiResponse.ok) {
        throw new Error('AI API call failed');
      }

      const aiData = await aiResponse.json();
      const prompt = aiData.choices[0].message.content;

      return {
        status: 'SUCCESS',
        data: {
          collected,
          missing,
          nextPrompt: prompt,
          attempts: attempts + 1
        }
      };

    } catch (error) {
      logger.error('Error in collectInfo', { error });
      return {
        status: 'UNABLE_TO_ANSWER',
        message: 'Failed to generate collection prompt',
        data: { collected: {}, missing: fields }
      };
    }
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
