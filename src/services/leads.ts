import { apiClient } from '@/lib/api-client';

export interface Lead {
  id: string;
  tenantId: string;
  name: string;
  phone?: string;
  email?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATING' | 'CONVERTED' | 'LOST' | 'NOT_INTERESTED';
  origin: 'WHATSAPP' | 'FACEBOOK_ADS' | 'INSTAGRAM' | 'WEBSITE' | 'MANUAL' | 'IMPORTED' | 'OTHER';
  score: number;
  ownerId?: string;
  pipelineId?: string;
  columnId?: string;
  tags: string[];
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadMessage {
  id: string;
  leadId: string;
  direction: 'IN' | 'OUT';
  content: string;
  channel: string;
  senderType: 'customer' | 'ai_agent' | 'human_agent' | 'system';
  senderId?: string;
  senderName?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LeadFilters {
  status?: string;
  origin?: string;
  ownerId?: string;
  search?: string;
  tags?: string[];
  minScore?: number;
  dateFrom?: string;
  dateTo?: string;
}

export const leadsService = {
  async getLeads(filters?: LeadFilters): Promise<Lead[]> {
    const response = await apiClient.get<Lead[]>('/leads', { params: filters });
    return response.data;
  },

  async getLeadById(id: string): Promise<Lead> {
    const response = await apiClient.get<Lead>(`/leads/${id}`);
    return response.data;
  },

  async createLead(data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.post<Lead>('/leads', data);
    return response.data;
  },

  async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
    const response = await apiClient.put<Lead>(`/leads/${id}`, data);
    return response.data;
  },

  async deleteLead(id: string): Promise<void> {
    await apiClient.delete(`/leads/${id}`);
  },

  async getLeadMessages(leadId: string): Promise<LeadMessage[]> {
    const response = await apiClient.get<LeadMessage[]>(`/leads/${leadId}/messages`);
    return response.data;
  },

  async distributeLeads(method: 'round_robin' | 'territory' = 'round_robin'): Promise<{ distributed: number }> {
    const response = await apiClient.post('/leads/distribute', { method });
    return response.data;
  },

  async exportCSV(filters?: LeadFilters): Promise<Blob> {
    const response = await apiClient.get('/leads/export', {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }
};
