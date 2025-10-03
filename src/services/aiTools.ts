import { apiClient } from '@/lib/api-client';

export interface AITool {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  parameters: any;
  headers?: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateToolData {
  name: string;
  description: string;
  endpoint: string;
  method: string;
  parameters: any;
  headers?: any;
}

export const aiToolsService = {
  async list(): Promise<AITool[]> {
    const response = await apiClient.get<AITool[]>('/ai/tools');
    return response.data;
  },

  async create(data: CreateToolData): Promise<AITool> {
    const response = await apiClient.post<AITool>('/ai/tools', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateToolData>): Promise<AITool> {
    const response = await apiClient.put<AITool>(`/ai/tools/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/ai/tools/${id}`);
  },

  async test(id: string, parameters: any): Promise<any> {
    const response = await apiClient.post(`/ai/tools/${id}/test`, { parameters });
    return response.data;
  }
};
