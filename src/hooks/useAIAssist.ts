import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIAssistSettings {
  useSnippets: boolean;
  replyOutsideKnowledge: boolean;
  tone: 'casual' | 'neutral' | 'formal';
  language: string;
}

export function useAIAssist() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<AIAssistSettings>({
    useSnippets: true,
    replyOutsideKnowledge: false,
    tone: 'neutral',
    language: 'pt-BR'
  });

  const generateDraft = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          conversationId,
          action: 'generate_draft',
          tenantId: user?.id
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      toast.error('Erro ao gerar rascunho');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const translate = async (content: string, targetLanguage: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'translate',
          content,
          targetLanguage
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      toast.error('Erro ao traduzir');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTone = async (content: string, tone: AIAssistSettings['tone']) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'adjust_tone',
          content,
          tone
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      toast.error('Erro ao ajustar tom');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fixGrammar = async (content: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'fix_grammar',
          content
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      toast.error('Erro ao corrigir gramática');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const simplify = async (content: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'simplify',
          content
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error: any) {
      toast.error('Erro ao simplificar');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchSnippets = async (query: string) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-assist', {
        body: {
          action: 'search_snippets',
          content: query,
          tenantId: user?.id
        }
      });

      if (error) throw error;
      
      return data.snippets || [];
    } catch (error: any) {
      toast.error('Erro ao buscar snippets');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    settings,
    setSettings,
    generateDraft,
    translate,
    adjustTone,
    fixGrammar,
    simplify,
    searchSnippets
  };
}