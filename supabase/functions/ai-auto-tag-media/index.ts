import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoTagRequest {
  imageUrl: string;
  productName?: string;
  productDescription?: string;
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

    const { imageUrl, productName, productDescription }: AutoTagRequest = await req.json();

    // Call Lovable AI with image analysis
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de produto e sugira tags descritivas úteis para catalogação em e-commerce.
${productName ? `Nome do produto: ${productName}` : ''}
${productDescription ? `Descrição: ${productDescription}` : ''}

Retorne as seguintes categorias de tags:
1. Ângulo da foto (ex: foto_frente, foto_traseira, foto_lateral_esquerda, foto_lateral_direita, foto_superior, foto_inferior, foto_detalhe, foto_embalagem)
2. Características visuais (ex: cor_predominante, iluminacao_natural, fundo_branco, fundo_colorido)
3. Contexto (ex: produto_isolado, produto_em_uso, produto_ambiente, close_up)
4. Qualidade (ex: alta_resolucao, fundo_profissional, imagem_editada)

Retorne APENAS um array JSON com as tags, sem explicações. Exemplo: ["foto_frente", "fundo_branco", "produto_isolado", "alta_resolucao"]`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        }),
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
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error('AI Gateway error');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No AI response');
    }

    // Parse JSON from response
    let tags: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        tags = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by comma and clean
        tags = content
          .split(',')
          .map((tag: string) => tag.trim().replace(/["\[\]]/g, ''))
          .filter((tag: string) => tag.length > 0);
      }
    } catch (parseError) {
      console.error('Error parsing tags:', parseError);
      // Return some default tags if parsing fails
      tags = ['foto_produto', 'analise_pendente'];
    }

    return new Response(
      JSON.stringify({
        success: true,
        tags,
        confidence: 0.85, // Mock confidence score
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in auto-tag-media:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
