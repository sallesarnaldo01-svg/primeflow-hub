import { apiClient } from '@/lib/api-client';

export interface AIAssistRequest {
  conversationId: string;
  context: string;
  settings?: {
    useSnippets?: boolean;
    replyOutsideKnowledge?: boolean;
    tone?: 'casual' | 'neutral' | 'formal';
    language?: string;
  };
}

export interface AIPromptRequest {
  text: string;
  promptType: 'translate' | 'tone' | 'fix' | 'simplify' | 'custom';
  options?: any;
}

export const aiAssistService = {
  async generateDraft(request: AIAssistRequest) {
    const { data } = await apiClient.post('/ai/assist/draft', request);
    return data;
  },
  
  async applyPrompt(request: AIPromptRequest) {
    const { data } = await apiClient.post('/ai/assist/prompt', request);
    return data;
  },
  
  async searchKnowledge(query: string, conversationId?: string) {
    const { data } = await apiClient.post('/ai/knowledge/search', { 
      query, 
      conversationId 
    });
    return data;
  }
};
