import { apiClient } from '@/lib/api-client';

export interface FollowUpCadence {
  id: string;
  name: string;
  trigger: any;
  steps: any[];
  active: boolean;
  createdAt: string;
}

export const followUpCadenceService = {
  async list() {
    const { data } = await apiClient.get('/ai/cadences');
    return data;
  },
  async create(cadence: any) {
    const { data } = await apiClient.post('/ai/cadences', cadence);
    return data;
  },
  async update(id: string, cadence: any) {
    const { data } = await apiClient.put(`/ai/cadences/${id}`, cadence);
    return data;
  },
  async delete(id: string) {
    await apiClient.delete(`/ai/cadences/${id}`);
  }
};
