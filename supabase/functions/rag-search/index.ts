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
    const { query, agentId, limit = 5 } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    console.log("RAG search for query:", query);

    // Buscar documentos relevantes (por enquanto busca simples por texto)
    let dbQuery = supabaseClient
      .from("knowledge_documents")
      .select("*")
      .or(`name.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(limit);

    if (agentId) {
      dbQuery = dbQuery.eq("agent_id", agentId);
    }

    const { data: documents, error } = await dbQuery;

    if (error) {
      throw error;
    }

    console.log("Found", documents?.length || 0, "relevant documents");

    // TODO: Implementar busca semântica com embeddings
    // Por enquanto retorna busca por texto simples

    return new Response(
      JSON.stringify({
        results: documents || [],
        query,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error in rag-search:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro na busca RAG" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
