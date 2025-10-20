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
    const { 
      conversationId, 
      action, // 'generate_draft', 'translate', 'adjust_tone', 'fix_grammar', 'simplify', 'search_snippets'
      content,
      targetLanguage,
      tone,
      tenantId
    } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'generate_draft':
        // Get conversation context
        const { data: messages } = await supabaseClient
          .from('messages')
          .select('content, direction')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(5);

        const context = messages?.reverse().map(m => 
          `${m.direction === 'INBOUND' ? 'Cliente' : 'Você'}: ${m.content}`
        ).join('\n') || '';

        // Get knowledge base
        let knowledgeContext = '';
        if (tenantId) {
          try {
            const lastMessage = messages?.[messages.length - 1]?.content || '';
            const ragResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/rag-search`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
              },
              body: JSON.stringify({
                query: lastMessage,
                tenantId,
                limit: 2
              })
            });

            if (ragResponse.ok) {
              const ragData = await ragResponse.json();
              knowledgeContext = ragData.results?.map((r: any) => r.content).join('\n\n') || '';
            }
          } catch (error) {
            console.log('RAG search failed:', error);
          }
        }

        systemPrompt = `Você é um assistente que gera rascunhos de respostas para atendimento ao cliente.

# CONTEXTO DA CONVERSA
${context}

${knowledgeContext ? `\n# BASE DE CONHECIMENTO\n${knowledgeContext}\n` : ''}

Gere uma resposta profissional, útil e personalizada para o cliente.`;
        userPrompt = 'Gere um rascunho de resposta apropriado.';
        break;

      case 'translate':
        systemPrompt = `Você é um tradutor profissional. Traduza o texto mantendo o tom e o contexto.`;
        userPrompt = `Traduza o seguinte texto para ${targetLanguage}:\n\n${content}`;
        break;

      case 'adjust_tone':
        const toneInstructions = {
          casual: 'Reescreva em um tom casual e amigável',
          neutral: 'Reescreva em um tom neutro e profissional',
          formal: 'Reescreva em um tom formal e respeitoso'
        };
        systemPrompt = 'Você é um assistente de escrita que ajusta o tom das mensagens.';
        userPrompt = `${toneInstructions[tone as keyof typeof toneInstructions]}:\n\n${content}`;
        break;

      case 'fix_grammar':
        systemPrompt = 'Você é um revisor que corrige gramática e ortografia mantendo o sentido original.';
        userPrompt = `Corrija erros gramaticais e de ortografia:\n\n${content}`;
        break;

      case 'simplify':
        systemPrompt = 'Você simplifica textos mantendo as informações importantes.';
        userPrompt = `Simplifique o seguinte texto:\n\n${content}`;
        break;

      case 'search_snippets':
        // Search for saved snippets/templates
        const { data: snippets } = await supabaseClient
          .from('knowledge_items')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('type', 'snippet')
          .ilike('title', `%${content}%`)
          .limit(5);

        return new Response(
          JSON.stringify({ snippets: snippets || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        throw new Error('Unknown action type');
    }

    // Call Lovable AI
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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
    });

    if (!aiResponse.ok) {
      const error = await aiResponse.text();
      console.error('Lovable AI error:', error);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ 
        result,
        action,
        tokensUsed: aiData.usage?.total_tokens || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-assist:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});