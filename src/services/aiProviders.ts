import { apiClient } from '@/lib/api-client';

export type AIProviderType = 'LOVABLE' | 'OPENAI' | 'MANUS' | 'GEMINI' | 'CLAUDE';

export interface AIProvider {
  id: string;
  tenantId: string;
  type: AIProviderType;
  name: string;
  apiKey?: string;
  config?: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  agents?: AIAgent[];
}

export interface AIAgent {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  config?: any;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    type: AIProviderType;
    name: string;
  };
}

export interface CreateProviderData {
  type: AIProviderType;
  name: string;
  apiKey?: string;
  config?: any;
}

export interface UpdateProviderData {
  name?: string;
  apiKey?: string;
  config?: any;
  active?: boolean;
}

export interface CreateAgentData {
  providerId: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  config?: any;
}

export interface UpdateAgentData {
  name?: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  config?: any;
  active?: boolean;
}

export const aiProvidersService = {
  // Provedores
  async listProviders(): Promise<AIProvider[]> {
    const response = await apiClient.get<AIProvider[]>('/ai/providers');
    return response.data;
  },

  async createProvider(data: CreateProviderData): Promise<AIProvider> {
    const response = await apiClient.post<AIProvider>('/ai/providers', data);
    return response.data;
  },

  async updateProvider(id: string, data: UpdateProviderData): Promise<AIProvider> {
    const response = await apiClient.put<AIProvider>(`/ai/providers/${id}`, data);
    return response.data;
  },

  async deleteProvider(id: string): Promise<void> {
    await apiClient.delete(`/ai/providers/${id}`);
  },

  // Agentes
  async listAgents(): Promise<AIAgent[]> {
    const response = await apiClient.get<AIAgent[]>('/ai/agents');
    return response.data;
  },

  async createAgent(data: CreateAgentData): Promise<AIAgent> {
    const response = await apiClient.post<AIAgent>('/ai/agents', data);
    return response.data;
  },

  async updateAgent(id: string, data: UpdateAgentData): Promise<AIAgent> {
    const response = await apiClient.put<AIAgent>(`/ai/agents/${id}`, data);
    return response.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await apiClient.delete(`/ai/agents/${id}`);
  },

  // Teste
  async testAgent(agentId: string, message: string): Promise<any> {
    const response = await apiClient.post('/ai/test', { agentId, message });
    return response.data;
  }
};
