import { apiClient } from '@/lib/api-client';

export interface AIAgent {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  provider?: {
    name: string;
  };
  capabilities?: {
    canAssign?: boolean;
    canClose?: boolean;
    canUpdateFields?: boolean;
    canUpdateLifecycle?: boolean;
    canInterpretImages?: boolean;
    canRecommendProducts?: boolean;
  };
  template?: string;
}

export const aiAgentsService = {
  async list() {
    const { data } = await apiClient.get('/ai-agents');
    return data;
  },
  
  async getById(id: string) {
    const { data } = await apiClient.get(`/ai-agents/${id}`);
    return data;
  },
  
  async updateSystemPrompt(id: string, systemPrompt: string) {
    const { data } = await apiClient.put(`/ai-agents/${id}/system-prompt`, { systemPrompt });
    return data;
  },
  
  async update(id: string, agent: Partial<AIAgent>) {
    const { data } = await apiClient.put(`/ai-agents/${id}`, agent);
    return data;
  },
  
  async applyTemplate(id: string, templateId: string) {
    const { data } = await apiClient.post(`/ai-agents/${id}/apply-template`, { templateId });
    return data;
  },
  
  async testMessage(id: string, messages: Array<{role: string; content: string}>) {
    const { data } = await apiClient.post(`/ai-agents/${id}/test`, { messages });
    return data;
  }
};
