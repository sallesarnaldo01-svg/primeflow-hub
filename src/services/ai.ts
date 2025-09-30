import { apiClient } from '@/lib/api-client';
import { AISettings, AITestMessage } from '@/types/ai';

export const aiService = {
  async getSettings(): Promise<AISettings> {
    const response = await apiClient.get<AISettings>('/ai/settings');
    return response.data;
  },

  async updateSettings(settings: Partial<AISettings>): Promise<AISettings> {
    const response = await apiClient.put<AISettings>('/ai/settings', settings);
    return response.data;
  },

  async testAI(messages: AITestMessage[]): Promise<{ response: string }> {
    const response = await apiClient.post<{ response: string }>('/ai/test', { messages });
    return response.data;
  },

  async analyzeMessage(content: string, type: 'text' | 'image' | 'audio'): Promise<{
    sentiment: string;
    category: string;
    confidence: number;
  }> {
    const response = await apiClient.post('/ai/analyze', { content, type });
    return response.data;
  },

  async generateResponse(context: string): Promise<{ suggestions: string[] }> {
    const response = await apiClient.post('/ai/generate-response', { context });
    return response.data;
  },
};
