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
    const { messages, leadData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é uma IA especializada em qualificação de leads para imobiliárias.
Analise as mensagens do cliente e extraia informações importantes:
- Tipo de imóvel procurado (casa, apartamento, comercial, terreno)
- Tipo de transação (compra ou aluguel)
- Faixa de preço
- Localização desejada (bairro, cidade)
- Quantidade de quartos e outras características
- Urgência da compra/aluguel
- Score de qualificação (0-100)

Retorne uma análise estruturada e profissional em português do Brasil.`;

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
          ...messages,
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "qualify_lead",
              description: "Qualifica um lead imobiliário com base nas conversas",
              parameters: {
                type: "object",
                properties: {
                  propertyType: {
                    type: "string",
                    enum: ["house", "apartment", "commercial", "land", "farm", "unknown"],
                    description: "Tipo de imóvel procurado"
                  },
                  transactionType: {
                    type: "string",
                    enum: ["sale", "rent", "both", "unknown"],
                    description: "Tipo de transação"
                  },
                  priceRange: {
                    type: "object",
                    properties: {
                      min: { type: "number" },
                      max: { type: "number" }
                    }
                  },
                  location: {
                    type: "object",
                    properties: {
                      neighborhood: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" }
                    }
                  },
                  bedrooms: { type: "number" },
                  bathrooms: { type: "number" },
                  parkingSpaces: { type: "number" },
                  features: {
                    type: "array",
                    items: { type: "string" }
                  },
                  urgency: {
                    type: "string",
                    enum: ["high", "medium", "low", "unknown"]
                  },
                  score: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Score de qualificação do lead"
                  },
                  insights: {
                    type: "string",
                    description: "Insights e observações sobre o lead"
                  },
                  nextActions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Próximas ações sugeridas"
                  }
                },
                required: ["propertyType", "transactionType", "score", "insights"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "qualify_lead" } }
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
    console.log("AI Response:", JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall && toolCall.function?.arguments) {
      const qualification = JSON.parse(toolCall.function.arguments);
      
      return new Response(JSON.stringify({ qualification }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Resposta da IA inválida");

  } catch (error) {
    console.error("Error in ai-lead-qualifier:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
