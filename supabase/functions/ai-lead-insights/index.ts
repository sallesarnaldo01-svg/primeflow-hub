import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadData, interactions, dealHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em análise de leads imobiliários e previsão de conversão.
            Analise o comportamento do lead e forneça insights acionáveis.`
          },
          {
            role: "user",
            content: `Analise este lead:
            
Dados: ${JSON.stringify(leadData)}
Interações: ${JSON.stringify(interactions)}
Histórico de Deals: ${JSON.stringify(dealHistory)}

Forneça análise completa incluindo:
- Probabilidade de conversão
- Principais sinais de interesse
- Riscos identificados
- Próximas ações recomendadas
- Melhor momento para abordagem
- Canal preferencial de contato`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_lead_insights",
            description: "Retorna insights sobre o lead",
            parameters: {
              type: "object",
              properties: {
                conversionProbability: { type: "number", description: "0-100" },
                interestSignals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      signal: { type: "string" },
                      strength: { type: "string", enum: ["low", "medium", "high"] },
                      description: { type: "string" }
                    }
                  }
                },
                risks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      risk: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      mitigation: { type: "string" }
                    }
                  }
                },
                recommendedActions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      timing: { type: "string" },
                      rationale: { type: "string" }
                    }
                  }
                },
                bestContactTime: { type: "string" },
                preferredChannel: { type: "string" },
                buyingUrgency: { type: "string", enum: ["low", "medium", "high", "very_high"] }
              },
              required: ["conversionProbability", "recommendedActions"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_lead_insights" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const insights = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
