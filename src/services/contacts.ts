import { apiClient } from '@/lib/api-client';

export interface Contact {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactData {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactsFilters {
  search?: string;
  source?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export const contactsService = {
  async getContacts(filters?: ContactsFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return apiClient.get<{ data: Contact[]; pagination: any }>(`/contacts?${params}`);
  },

  async getContact(id: string) {
    return apiClient.get<{ data: Contact }>(`/contacts/${id}`);
  },

  async createContact(data: CreateContactData) {
    return apiClient.post<{ data: Contact }>('/contacts', data);
  },

  async updateContact(id: string, data: UpdateContactData) {
    return apiClient.patch<{ data: Contact }>(`/contacts/${id}`, data);
  },

  async deleteContact(id: string) {
    return apiClient.delete(`/contacts/${id}`);
  },

  async importCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<{ data: { imported: number; errors: string[] } }>(
      '/contacts/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  async exportCSV(filters?: ContactsFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.source) params.append('source', filters.source);
    if (filters?.tags?.length) params.append('tags', filters.tags.join(','));

    return apiClient.get(`/contacts/export?${params}`, {
      responseType: 'blob',
    });
  },

  async addTags(id: string, tags: string[]) {
    return apiClient.post<{ data: Contact }>(`/contacts/${id}/tags`, { tags });
  },

  async removeTags(id: string, tags: string[]) {
    return apiClient.delete(`/contacts/${id}/tags`, { data: { tags } });
  },

  async getTimeline(id: string) {
    return apiClient.get<{ data: any[] }>(`/contacts/${id}/timeline`);
  },

  async syncFromChannels(data: { sources: string[] }) {
    return apiClient.post<{ data: { synced: number; failed: number } }>('/contacts/sync', data);
  },
};
