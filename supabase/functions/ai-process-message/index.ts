import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIProcessRequest {
  conversationId: string;
  messageContent: string;
  conversationHistory: Array<{ role: string; content: string }>;
  tools: Array<any>;
  contactInfo: {
    name: string;
    phone: string;
    email?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversationId, messageContent, conversationHistory, tools, contactInfo }: AIProcessRequest =
      await req.json();

    // Build system prompt
    const systemPrompt = `Você é um assistente de IA para atendimento ao cliente. 

Informações do contato:
- Nome: ${contactInfo.name}
- Telefone: ${contactInfo.phone}
${contactInfo.email ? `- Email: ${contactInfo.email}` : ''}

Você tem acesso às seguintes ferramentas:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

Seja prestativo, educado e profissional. Use as ferramentas quando apropriado.`;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: messageContent },
    ];

    // Convert tools to OpenAI format
    const formattedTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema,
      },
    }));

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        tools: formattedTools.length > 0 ? formattedTools : undefined,
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('AI Gateway error');
    }

    const aiData = await aiResponse.json();
    const aiMessage = aiData.choices?.[0]?.message;

    if (!aiMessage) {
      throw new Error('No AI response');
    }

    // Check if AI wants to call tools
    const toolCalls = aiMessage.tool_calls || [];
    const toolResults = [];

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      console.log('AI called tool:', toolName, toolArgs);

      // Execute tool (simplified - in production, route to proper handlers)
      toolResults.push({
        tool_call_id: toolCall.id,
        role: 'tool',
        name: toolName,
        content: JSON.stringify({ success: true, result: 'Tool executed' }),
      });
    }

    // If tools were called, make another AI call with results
    let finalResponse = aiMessage.content;

    if (toolResults.length > 0) {
      const followUpResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            ...messages,
            aiMessage,
            ...toolResults,
          ],
        }),
      });

      if (followUpResponse.ok) {
        const followUpData = await followUpResponse.json();
        finalResponse = followUpData.choices?.[0]?.message?.content || finalResponse;
      }
    }

    // Save AI response as message
    if (finalResponse) {
      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        content: finalResponse,
        direction: 'OUTBOUND',
        status: 'SENT',
        type: 'TEXT',
        metadata: {
          aiGenerated: true,
          model: 'google/gemini-2.5-flash',
          toolsCalled: toolCalls.map((tc: any) => tc.function.name),
        },
      });

      if (insertError) {
        console.error('Error saving AI message:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: finalResponse,
        toolsCalled: toolCalls.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error processing AI message:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
