import { api, PaginatedResponse } from './api';

export interface Deal {
  id: string;
  title: string;
  value?: number;
  currency?: string;
  probability?: number;
  stage: string;
  expectedCloseDate?: string;
  contactId?: string;
  companyId?: string;
  ownerId?: string;
  source?: string;
  tags?: string[];
  propertyId?: string;
  leadSource?: string;
  notes?: string;
  position?: number;
  aiScore?: number;
  aiInsights?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos
  contact?: Contact;
  company?: Company;
  owner?: User;
  property?: Property;
  activities?: Activity[];
}

export interface Property {
  id: string;
  title: string;
  type: string;
  status: string;
  price?: number;
  address?: string;
  city?: string;
  state?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  companyId?: string;
  tags: string[];
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  segment?: string;
  size?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  date: string;
  userId: string;
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  color: string;
  probability: number;
}

export interface DealsFilters {
  stage?: string;
  ownerId?: string;
  source?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MoveDealData {
  id: string;
  stage: string;
  position?: number;
}

export const dealsService = {
  async getDeals(filters?: DealsFilters): Promise<PaginatedResponse<Deal>> {
    const response = await api.get<PaginatedResponse<Deal>>('/deals', filters);
    return response.data;
  },

  async getDeal(id: string): Promise<Deal> {
    const response = await api.get<Deal>(`/deals/${id}`);
    return response.data;
  },

  async createDeal(data: Partial<Deal>): Promise<Deal> {
    const response = await api.post<Deal>('/deals', data);
    return response.data;
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const response = await api.put<Deal>(`/deals/${id}`, data);
    return response.data;
  },

  async deleteDeal(id: string): Promise<void> {
    await api.delete(`/deals/${id}`);
  },

  async moveStage(data: MoveDealData): Promise<Deal> {
    const response = await api.put<Deal>(`/deals/${data.id}/move`, {
      stage: data.stage,
      position: data.position,
    });
    return response.data;
  },

  async getStages(): Promise<Stage[]> {
    const response = await api.get<Stage[]>('/deals/stages');
    return response.data;
  },

  async updateStages(stages: Stage[]): Promise<Stage[]> {
    const response = await api.put<Stage[]>('/deals/stages', { stages });
    return response.data;
  },

  async getFunnelAnalytics(filters?: { dateFrom?: string; dateTo?: string; ownerId?: string }): Promise<any> {
    const response = await api.get('/deals/analytics/funnel', filters);
    return response.data;
  },
};