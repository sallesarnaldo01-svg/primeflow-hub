import { apiClient } from '@/lib/api-client';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: { id: string; name: string; email: string };
  contact?: { id: string; name: string; phone: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assignedTo?: string;
  contactId?: string;
}

export interface UpdateTicketData extends Partial<CreateTicketData> {
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}

export interface TicketsFilters {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ticketsService = {
  async getAll(filters?: TicketsFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{ data: Ticket[]; pagination: any }>(`/tickets?${params}`);
  },

  async getById(id: string) {
    return apiClient.get<{ data: Ticket }>(`/tickets/${id}`);
  },

  async create(data: CreateTicketData) {
    return apiClient.post<{ data: Ticket }>('/tickets', data);
  },

  async update(id: string, data: UpdateTicketData) {
    return apiClient.patch<{ data: Ticket }>(`/tickets/${id}`, data);
  },

  async delete(id: string) {
    return apiClient.delete(`/tickets/${id}`);
  },

  async addComment(id: string, comment: string) {
    return apiClient.post(`/tickets/${id}/comments`, { comment });
  },

  async getComments(id: string) {
    return apiClient.get<{ data: any[] }>(`/tickets/${id}/comments`);
  },

  async getMetrics() {
    return apiClient.get<{
      data: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        avgResolutionTime: number;
      };
    }>('/tickets/metrics');
  },
};
