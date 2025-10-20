import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, message, agentConfig } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Get conversation context
    const { data: conversation } = await supabaseClient
      .from('conversations')
      .select('*, contact(*), messages(content, direction, created_at)')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // 2. Get relevant knowledge from RAG
    let knowledgeContext = '';
    try {
      const ragResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rag-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          query: message,
          tenantId: conversation.tenant_id,
          limit: 3
        })
      });

      if (ragResponse.ok) {
        const ragData = await ragResponse.json();
        knowledgeContext = ragData.results?.map((r: any) => r.content).join('\n\n') || '';
      }
    } catch (error) {
      console.log('RAG search failed, continuing without knowledge context', error);
    }

    // 3. Build conversation history
    const conversationHistory = conversation.messages
      ?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(-10) // Last 10 messages
      .map((msg: any) => ({
        role: msg.direction === 'INBOUND' ? 'user' : 'assistant',
        content: msg.content
      })) || [];

    // 4. Build system prompt with agent config and knowledge
    const systemPrompt = `${agentConfig?.systemPrompt || 'Você é um assistente útil.'}

${knowledgeContext ? `\n# BASE DE CONHECIMENTO\n${knowledgeContext}\n` : ''}

# AÇÕES DISPONÍVEIS
Você pode executar as seguintes ações:
- assign_agent: Atribuir conversa a um agente específico
- close_conversation: Fechar a conversa
- update_field: Atualizar campo personalizado do contato
- update_lifecycle: Atualizar estágio do lifecycle (lead, opportunity, customer, etc)
- recommend_products: Recomendar produtos/imóveis baseado nas preferências

Para executar uma ação, responda no formato:
ACTION: nome_da_acao
PARAMS: {"param1": "value1"}
RESPONSE: sua mensagem para o usuário

# INSTRUÇÕES
- Use a base de conhecimento quando disponível
- Execute ações quando apropriado
- Seja natural e conversacional
- Mantenha contexto da conversa`;

    // 5. Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

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
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('Lovable AI error:', error);
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // 6. Parse actions from AI response
    const actionMatch = aiMessage.match(/ACTION:\s*(\w+)/);
    const paramsMatch = aiMessage.match(/PARAMS:\s*({[^}]+})/);
    const responseMatch = aiMessage.match(/RESPONSE:\s*(.+?)(?=ACTION:|$)/s);

    let actionExecuted = null;
    if (actionMatch && paramsMatch) {
      const actionType = actionMatch[1];
      const params = JSON.parse(paramsMatch[1]);

      // 7. Execute action
      actionExecuted = await executeAction(
        supabaseClient,
        conversationId,
        conversation.contact_id,
        actionType,
        params
      );
    }

    const responseText = responseMatch ? responseMatch[1].trim() : aiMessage;

    // 8. Save AI message to conversation
    await supabaseClient
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content: responseText,
        direction: 'OUTBOUND',
        status: 'SENT',
        type: 'TEXT',
        metadata: {
          ai_generated: true,
          agent_id: agentConfig?.id,
          action_executed: actionExecuted,
          knowledge_used: !!knowledgeContext
        }
      });

    return new Response(
      JSON.stringify({
        response: responseText,
        actionExecuted,
        knowledgeUsed: !!knowledgeContext
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-agent-execute:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeAction(
  supabase: any,
  conversationId: string,
  contactId: string,
  actionType: string,
  params: any
) {
  console.log('Executing action:', actionType, params);

  try {
    switch (actionType) {
      case 'assign_agent':
        await supabase
          .from('conversations')
          .update({ assigned_to_id: params.userId })
          .eq('id', conversationId);
        return { type: 'assign_agent', success: true, data: params };

      case 'close_conversation':
        await supabase
          .from('conversations')
          .update({ status: 'CLOSED' })
          .eq('id', conversationId);
        return { type: 'close_conversation', success: true };

      case 'update_field':
        const { data: contact } = await supabase
          .from('contacts')
          .select('custom_fields')
          .eq('id', contactId)
          .single();

        await supabase
          .from('contacts')
          .update({
            custom_fields: {
              ...(contact?.custom_fields || {}),
              [params.field]: params.value
            }
          })
          .eq('id', contactId);
        return { type: 'update_field', success: true, data: params };

      case 'update_lifecycle':
        await supabase
          .from('contacts')
          .update({ lifecycle_stage: params.stage })
          .eq('id', contactId);
        return { type: 'update_lifecycle', success: true, data: params };

      case 'recommend_products':
        // Get products/properties based on preferences
        const { data: products } = await supabase
          .from('properties')
          .select('*')
          .limit(5);
        return { type: 'recommend_products', success: true, data: products };

      default:
        return { type: actionType, success: false, error: 'Unknown action type' };
    }
  } catch (error) {
    console.error('Action execution error:', error);
    return { type: actionType, success: false, error: error.message };
  }
}