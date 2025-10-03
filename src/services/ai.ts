import { supabase } from '@/integrations/supabase/client';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const aiService = {
  async streamChat(
    messages: AIMessage[],
    onDelta: (chunk: string) => void,
    onDone: () => void,
    metadata?: { conversationId?: string; agentId?: string }
  ): Promise<void> {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
    const startTime = Date.now();
    let promptTokens = 0;
    let completionTokens = 0;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (!resp.ok || !resp.body) {
      if (resp.status === 429) {
        throw new Error("Taxa de requisições excedida. Tente novamente em alguns instantes.");
      }
      if (resp.status === 402) {
        throw new Error("Créditos de IA esgotados. Adicione créditos na sua workspace.");
      }
      throw new Error("Falha ao iniciar streaming");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
          
          // Capturar informações de uso
          if (parsed.usage) {
            promptTokens = parsed.usage.prompt_tokens || 0;
            completionTokens = parsed.usage.completion_tokens || 0;
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    // Log de uso de IA
    const latencyMs = Date.now() - startTime;
    const totalTokens = promptTokens + completionTokens;
    const estimatedCost = (totalTokens / 1000) * 0.002; // Exemplo: $0.002 por 1K tokens

    try {
      // @ts-ignore - Table will be created in migration
      await supabase.from('ai_usage').insert({
        conversation_id: metadata?.conversationId,
        agent_id: metadata?.agentId,
        model: 'google/gemini-2.5-flash',
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        cost: estimatedCost,
        latency_ms: latencyMs
      });
    } catch (error) {
      console.error('Erro ao registrar uso de IA:', error);
    }

    onDone();
  },

  async executeFunction(toolId: string, parameters: any): Promise<any> {
    const { data, error } = await supabase.functions.invoke('ai-function-call', {
      body: { toolId, parameters }
    });
    
    if (error) throw error;
    return data;
  },

  async searchKnowledge(query: string, agentId?: string, limit?: number): Promise<any> {
    const { data, error } = await supabase.functions.invoke('rag-search', {
      body: { query, agentId, limit }
    });
    
    if (error) throw error;
    return data;
  },
};
