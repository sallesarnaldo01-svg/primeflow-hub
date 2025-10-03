import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId, parameters } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Buscar configuração da tool
    const { data: tool, error: toolError } = await supabaseClient
      .from("ai_tools")
      .select("*")
      .eq("id", toolId)
      .single();

    if (toolError || !tool) {
      throw new Error("Tool não encontrada");
    }

    console.log("Executing tool:", tool.name, "with parameters:", parameters);

    // Executar chamada HTTP para o endpoint da tool
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(tool.headers || {}),
    };

    const fetchOptions: RequestInit = {
      method: tool.method,
      headers,
    };

    if (tool.method !== "GET") {
      fetchOptions.body = JSON.stringify(parameters);
    }

    const response = await fetch(tool.endpoint, fetchOptions);
    const result = await response.json();

    console.log("Tool execution result:", result);

    // Registrar execução
    await supabaseClient.from("ai_tool_executions").insert({
      tool_id: toolId,
      parameters,
      result,
      success: response.ok,
      executed_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error in ai-function-call:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro ao executar function call" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
