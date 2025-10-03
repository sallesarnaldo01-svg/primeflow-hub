import { apiClient } from '@/lib/api-client';

export interface AITool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: string;
  parameters: any;
  active: boolean;
}

export const aiToolsService = {
  async list() {
    const { data } = await apiClient.get('/ai/tools');
    return data;
  },
  async create(tool: Partial<AITool>) {
    const { data } = await apiClient.post('/ai/tools', tool);
    return data;
  },
  async update(id: string, tool: Partial<AITool>) {
    const { data } = await apiClient.put(`/ai/tools/${id}`, tool);
    return data;
  },
  async delete(id: string) {
    await apiClient.delete(`/ai/tools/${id}`);
  },
  async test(id: string, parameters: any) {
    const { data } = await apiClient.post(`/ai/tools/${id}/test`, { parameters });
    return data;
  }
};
