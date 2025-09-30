import { apiClient } from '@/lib/api-client';

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  origin: string;
  tags: string[];
  lastContact?: string;
  customFields?: Record<string, any>;
}

export interface SyncContactsData {
  sources: string[];
  mapping?: Record<string, string>;
  deduplicate?: boolean;
}

export const contactsService = {
  async getContacts(filters?: {
    search?: string;
    origin?: string;
    tags?: string[];
  }): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>('/contacts', { params: filters });
    return response.data;
  },

  async getContact(id: string): Promise<Contact> {
    const response = await apiClient.get<Contact>(`/contacts/${id}`);
    return response.data;
  },

  async createContact(data: Partial<Contact>): Promise<Contact> {
    const response = await apiClient.post<Contact>('/contacts', data);
    return response.data;
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await apiClient.put<Contact>(`/contacts/${id}`, data);
    return response.data;
  },

  async deleteContact(id: string): Promise<void> {
    await apiClient.delete(`/contacts/${id}`);
  },

  async syncFromChannels(data: SyncContactsData): Promise<{ synced: number; failed: number }> {
    const response = await apiClient.post('/contacts/sync', data);
    return response.data;
  },

  async exportCSV(filters?: Record<string, any>): Promise<Blob> {
    const response = await apiClient.get('/contacts/export.csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  async importCSV(file: File): Promise<{ imported: number; failed: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
