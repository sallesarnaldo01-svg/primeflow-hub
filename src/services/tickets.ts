import { api, PaginatedResponse } from './api';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subcategory?: string;
  assignedTo?: string;
  contactId: string;
  companyId?: string;
  dealId?: string;
  source: 'email' | 'chat' | 'phone' | 'form' | 'api';
  tags: string[];
  customFields?: Record<string, any>;
  slaDeadline?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  contact?: Contact;
  assignee?: User;
  company?: Company;
  deal?: Deal;
  activities?: Activity[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
}

export interface Activity {
  id: string;
  type: 'comment' | 'status_change' | 'assignment' | 'escalation';
  content: string;
  userId: string;
  createdAt: string;
  user?: User;
}

export interface TicketsFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  contactId?: string;
  companyId?: string;
  category?: string;
  tags?: string[];
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  subcategory?: string;
  contactId: string;
  companyId?: string;
  dealId?: string;
  source: 'email' | 'chat' | 'phone' | 'form' | 'api';
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: 'open' | 'pending' | 'resolved' | 'closed';
  assignedTo?: string;
}

export interface TicketMetrics {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  closed: number;
  avgFirstResponse: number;
  avgResolution: number;
  slaCompliance: number;
}

export const ticketsService = {
  async getTickets(filters?: TicketsFilters): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get<PaginatedResponse<Ticket>>('/tickets', filters);
    return response.data;
  },

  async getTicket(id: string): Promise<Ticket> {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  },

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/${id}`, data);
    return response.data;
  },

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  },

  async assignTicket(id: string, userId: string): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/${id}/assign`, { userId });
    return response.data;
  },

  async addComment(id: string, content: string): Promise<Activity> {
    const response = await api.post<Activity>(`/tickets/${id}/comments`, { content });
    return response.data;
  },

  async escalateTicket(id: string, reason: string): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/${id}/escalate`, { reason });
    return response.data;
  },

  async closeTicket(id: string, resolution: string): Promise<Ticket> {
    const response = await api.put<Ticket>(`/tickets/${id}/close`, { resolution });
    return response.data;
  },

  async getMetrics(filters?: { dateFrom?: string; dateTo?: string }): Promise<TicketMetrics> {
    const response = await api.get<TicketMetrics>('/tickets/metrics', filters);
    return response.data;
  },

  async getCategories(): Promise<{ name: string; subcategories: string[] }[]> {
    const response = await api.get<{ name: string; subcategories: string[] }[]>('/tickets/categories');
    return response.data;
  },
};