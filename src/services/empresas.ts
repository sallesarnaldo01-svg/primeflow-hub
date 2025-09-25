import { api, PaginatedResponse } from './api';

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  revenue?: number;
  employees?: number;
  address?: Address;
  tags: string[];
  customFields?: Record<string, any>;
  status: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned';
  healthScore?: number;
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;

  // Relacionamentos
  contacts?: Contact[];
  deals?: Deal[];
  tickets?: Ticket[];
  activities?: Activity[];
  owner?: User;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position?: string;
  isPrimary: boolean;
  avatar?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  status: 'open' | 'won' | 'lost';
}

export interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description?: string;
  date: string;
  userId: string;
  user?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CompaniesFilters {
  search?: string;
  industry?: string;
  size?: string;
  status?: string;
  ownerId?: string;
  tags?: string[];
  healthScoreMin?: number;
  healthScoreMax?: number;
  revenueMin?: number;
  revenueMax?: number;
  employeesMin?: number;
  employeesMax?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateCompanyData {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  revenue?: number;
  employees?: number;
  address?: Address;
  tags?: string[];
  customFields?: Record<string, any>;
  ownerId?: string;
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  status?: 'active' | 'inactive' | 'prospect' | 'customer' | 'churned';
  healthScore?: number;
}

export interface CompanyMetrics {
  total: number;
  active: number;
  prospects: number;
  customers: number;
  churned: number;
  avgHealthScore: number;
  totalRevenue: number;
  avgDealValue: number;
}

export interface MergeCompaniesData {
  primaryCompanyId: string;
  secondaryCompanyIds: string[];
  mergeContacts?: boolean;
  mergeDeals?: boolean;
  mergeTickets?: boolean;
  mergeActivities?: boolean;
}

export const empresasService = {
  async getCompanies(filters?: CompaniesFilters): Promise<PaginatedResponse<Company>> {
    const response = await api.get<PaginatedResponse<Company>>('/companies', filters);
    return response.data;
  },

  async getCompany(id: string): Promise<Company> {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  async createCompany(data: CreateCompanyData): Promise<Company> {
    const response = await api.post<Company>('/companies', data);
    return response.data;
  },

  async updateCompany(id: string, data: UpdateCompanyData): Promise<Company> {
    const response = await api.put<Company>(`/companies/${id}`, data);
    return response.data;
  },

  async deleteCompany(id: string): Promise<void> {
    await api.delete(`/companies/${id}`);
  },

  async getContacts(companyId: string): Promise<Contact[]> {
    const response = await api.get<Contact[]>(`/companies/${companyId}/contacts`);
    return response.data;
  },

  async addContact(companyId: string, contactData: Omit<Contact, 'id'>): Promise<Contact> {
    const response = await api.post<Contact>(`/companies/${companyId}/contacts`, contactData);
    return response.data;
  },

  async removeContact(companyId: string, contactId: string): Promise<void> {
    await api.delete(`/companies/${companyId}/contacts/${contactId}`);
  },

  async getDeals(companyId: string): Promise<Deal[]> {
    const response = await api.get<Deal[]>(`/companies/${companyId}/deals`);
    return response.data;
  },

  async getTickets(companyId: string): Promise<Ticket[]> {
    const response = await api.get<Ticket[]>(`/companies/${companyId}/tickets`);
    return response.data;
  },

  async getActivities(companyId: string, page = 1, limit = 50): Promise<PaginatedResponse<Activity>> {
    const response = await api.get<PaginatedResponse<Activity>>(
      `/companies/${companyId}/activities`,
      { page, limit }
    );
    return response.data;
  },

  async addActivity(companyId: string, activity: Omit<Activity, 'id' | 'user'>): Promise<Activity> {
    const response = await api.post<Activity>(`/companies/${companyId}/activities`, activity);
    return response.data;
  },

  async mergeCompanies(data: MergeCompaniesData): Promise<Company> {
    const response = await api.post<Company>('/companies/merge', data);
    return response.data;
  },

  async getDuplicates(companyId: string): Promise<Company[]> {
    const response = await api.get<Company[]>(`/companies/${companyId}/duplicates`);
    return response.data;
  },

  async enrichCompany(id: string): Promise<Company> {
    const response = await api.post<Company>(`/companies/${id}/enrich`);
    return response.data;
  },

  async getMetrics(filters?: { dateFrom?: string; dateTo?: string }): Promise<CompanyMetrics> {
    const response = await api.get<CompanyMetrics>('/companies/metrics', filters);
    return response.data;
  },

  async exportCompanies(filters?: CompaniesFilters): Promise<{ downloadUrl: string }> {
    const response = await api.get<{ downloadUrl: string }>('/companies/export', filters);
    return response.data;
  },

  async importCompanies(file: File): Promise<{ message: string; importedCount: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/companies/import', {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },
};