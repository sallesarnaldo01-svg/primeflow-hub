import { apiClient } from '@/lib/api-client';

export interface AIUsage {
  id: string;
  tenantId: string;
  agentId?: string;
  providerId?: string;
  leadId?: string;
  conversationId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: string;
}

export interface UsageStats {
  totalInteractions: number;
  totalTokens: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalCost: number;
  byModel: {
    model: string;
    interactions: number;
    totalTokens: number;
    totalCost: number;
  }[];
}

export const aiUsageService = {
  async list(filters?: {
    leadId?: string;
    agentId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AIUsage[]> {
    const params = new URLSearchParams();
    if (filters?.leadId) params.append('leadId', filters.leadId);
    if (filters?.agentId) params.append('agentId', filters.agentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await apiClient.get<AIUsage[]>(`/ai/usage?${params}`);
    return response.data;
  },

  async stats(startDate?: string, endDate?: string): Promise<UsageStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get<UsageStats>(`/ai/usage/stats?${params}`);
    return response.data;
  },

  async byLead(leadId: string): Promise<any> {
    const response = await apiClient.get(`/ai/usage/lead/${leadId}`);
    return response.data;
  }
};
