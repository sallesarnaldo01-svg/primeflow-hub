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
    const { documentUrl, documentType, expectedData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Download do documento
    const docResponse = await fetch(documentUrl);
    const docBlob = await docResponse.blob();
    const base64Doc = btoa(String.fromCharCode(...new Uint8Array(await docBlob.arrayBuffer())));

    // Análise via IA
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
            content: `Você é um assistente especializado em análise de documentos imobiliários e financeiros. 
            Extraia informações estruturadas dos documentos e compare com os dados esperados.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este documento do tipo "${documentType}". 
                Dados esperados: ${JSON.stringify(expectedData)}
                
                Retorne um JSON com:
                - extractedData: dados extraídos do documento
                - discrepancies: lista de divergências encontradas
                - confidence: nível de confiança (0-100)
                - recommendations: recomendações de correção`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Doc}`
                }
              }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_document",
            description: "Retorna análise estruturada do documento",
            parameters: {
              type: "object",
              properties: {
                extractedData: { type: "object" },
                discrepancies: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      expected: { type: "string" },
                      found: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] }
                    }
                  }
                },
                confidence: { type: "number" },
                recommendations: { type: "array", items: { type: "string" } }
              },
              required: ["extractedData", "discrepancies", "confidence"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_document" } }
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
    const analysisResult = JSON.parse(data.choices[0].message.tool_calls[0].function.arguments);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao analisar documento:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
