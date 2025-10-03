import { apiClient } from '@/lib/api-client';

export interface FollowUpCadence {
  id: string;
  tenantId: string;
  name: string;
  trigger: any;
  steps: any[];
  active: boolean;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCadenceData {
  name: string;
  trigger: any;
  steps: any[];
  agentId?: string;
}

export const followUpCadenceService = {
  async list(): Promise<FollowUpCadence[]> {
    const response = await apiClient.get<FollowUpCadence[]>('/ai/cadences');
    return response.data;
  },

  async getById(id: string): Promise<FollowUpCadence> {
    const response = await apiClient.get<FollowUpCadence>(`/ai/cadences/${id}`);
    return response.data;
  },

  async create(data: CreateCadenceData): Promise<FollowUpCadence> {
    const response = await apiClient.post<FollowUpCadence>('/ai/cadences', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateCadenceData>): Promise<FollowUpCadence> {
    const response = await apiClient.put<FollowUpCadence>(`/ai/cadences/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/ai/cadences/${id}`);
  },

  async trigger(id: string, leadIds: string[]): Promise<any> {
    const response = await apiClient.post(`/ai/cadences/${id}/trigger`, { leadIds });
    return response.data;
  }
};
