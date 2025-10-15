import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyData, tone = 'professional' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const toneInstructions = {
      professional: "Use tom profissional e objetivo, destacando características técnicas e vantagens do imóvel.",
      luxury: "Use tom sofisticado e elegante, enfatizando exclusividade e alto padrão.",
      casual: "Use tom amigável e acessível, focando no conforto e qualidade de vida.",
      persuasive: "Use tom persuasivo e convincente, destacando urgência e oportunidade única."
    };

    const systemPrompt = `Você é um redator especialista em anúncios imobiliários.
${toneInstructions[tone as keyof typeof toneInstructions] || toneInstructions.professional}
Crie uma descrição atrativa, destacando:
- Características principais (localização, tamanho, quartos)
- Diferenciais e vantagens
- Benefícios para o comprador/locatário
- Call-to-action convidativo

IMPORTANTE: 
- Máximo de 300 palavras
- Use parágrafos curtos
- Inclua emojis moderadamente se apropriado
- Evite clichês
- Seja específico e honesto`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Crie uma descrição atrativa para este imóvel:\n\n${JSON.stringify(propertyData, null, 2)}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_description",
              description: "Gera descrição otimizada para anúncio de imóvel",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "Título chamativo para o anúncio (máximo 80 caracteres)"
                  },
                  description: {
                    type: "string",
                    description: "Descrição completa e atrativa do imóvel"
                  },
                  highlights: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-5 destaques principais do imóvel"
                  },
                  keywords: {
                    type: "array",
                    items: { type: "string" },
                    description: "Palavras-chave para SEO e busca"
                  },
                  shortDescription: {
                    type: "string",
                    description: "Descrição resumida (máximo 160 caracteres para preview)"
                  }
                },
                required: ["title", "description", "highlights", "keywords", "shortDescription"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_description" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente mais tarde." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao processar com IA");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall && toolCall.function?.arguments) {
      const generatedContent = JSON.parse(toolCall.function.arguments);
      
      return new Response(JSON.stringify({ content: generatedContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Resposta da IA inválida");

  } catch (error) {
    console.error("Error in ai-property-description:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
