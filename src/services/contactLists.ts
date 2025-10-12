import { apiClient } from '@/lib/api-client';

export interface ContactList {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  segmentConditions: any[];
  autoUpdate: boolean;
  tags: string[];
  metadata?: Record<string, any>;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListMember {
  id: string;
  listId: string;
  contactId?: string;
  leadId?: string;
  addedBy?: string;
  addedMethod: 'MANUAL' | 'IMPORT' | 'AUTO_SEGMENT';
  memberName?: string;
  memberPhone?: string;
  memberEmail?: string;
  createdAt: string;
}

export const contactListsService = {
  async getContactLists(): Promise<ContactList[]> {
    const response = await apiClient.get<ContactList[]>('/contact-lists');
    return response.data;
  },

  async getContactListById(id: string): Promise<ContactList> {
    const response = await apiClient.get<ContactList>(`/contact-lists/${id}`);
    return response.data;
  },

  async createContactList(data: Partial<ContactList>): Promise<ContactList> {
    const response = await apiClient.post<ContactList>('/contact-lists', data);
    return response.data;
  },

  async updateContactList(id: string, data: Partial<ContactList>): Promise<ContactList> {
    const response = await apiClient.put<ContactList>(`/contact-lists/${id}`, data);
    return response.data;
  },

  async deleteContactList(id: string): Promise<void> {
    await apiClient.delete(`/contact-lists/${id}`);
  },

  async getListMembers(listId: string, limit = 100, offset = 0): Promise<ContactListMember[]> {
    const response = await apiClient.get<ContactListMember[]>(`/contact-lists/${listId}/members`, {
      params: { limit, offset }
    });
    return response.data;
  },

  async addMemberToList(
    listId: string,
    data: { contactId?: string; leadId?: string }
  ): Promise<ContactListMember> {
    const response = await apiClient.post<ContactListMember>(`/contact-lists/${listId}/members`, data);
    return response.data;
  },

  async removeMemberFromList(listId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/contact-lists/${listId}/members/${memberId}`);
  },

  async exportCSV(listId: string): Promise<Blob> {
    const response = await apiClient.get(`/contact-lists/${listId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async duplicateList(listId: string, name: string): Promise<ContactList> {
    const response = await apiClient.post<ContactList>(`/contact-lists/${listId}/duplicate`, { name });
    return response.data;
  }
};
