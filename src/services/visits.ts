import { apiClient } from '@/lib/api-client';

export interface PropertyVisit {
  id: string;
  tenantId: string;
  propertyId: string;
  dealId?: string;
  contactId?: string;
  brokerId?: string;
  scheduledAt: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export const visitsService = {
  async getVisits(filters?: { propertyId?: string; brokerId?: string; status?: string }) {
    const response = await apiClient.get<{ data: PropertyVisit[] }>('/visits', { params: filters });
    return response.data;
  },

  async createVisit(data: Partial<PropertyVisit>) {
    const response = await apiClient.post<{ data: PropertyVisit }>('/visits', data);
    return response.data;
  },

  async updateVisit(id: string, data: Partial<PropertyVisit>) {
    const response = await apiClient.put<{ data: PropertyVisit }>(`/visits/${id}`, data);
    return response.data;
  },

  async cancelVisit(id: string) {
    const response = await apiClient.patch<{ data: PropertyVisit }>(`/visits/${id}`, { status: 'cancelled' });
    return response.data;
  }
};
