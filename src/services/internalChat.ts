import { api } from './api';

export interface InternalChat {
  id: string;
  tenant_id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InternalMessage {
  id: string;
  chat_id: string;
  user_id: string;
  message: string;
  attachments?: { name: string; url: string; type: string }[];
  mentions?: string[];
  read_by: string[];
  created_at: string;
  updated_at: string;
}

export const internalChatService = {
  // Chats
  async listChats() {
    return api.get<{ data: InternalChat[] }>('/internal-chats');
  },

  async getChat(id: string) {
    return api.get<{ data: InternalChat }>(`/internal-chats/${id}`);
  },

  async createChat(data: { type: 'direct' | 'group'; participants: string[]; name?: string }) {
    return api.post<{ data: InternalChat }>('/internal-chats', data);
  },

  async updateChat(id: string, updates: Partial<InternalChat>) {
    return api.put<{ data: InternalChat }>(`/internal-chats/${id}`, updates);
  },

  async deleteChat(id: string) {
    return api.delete(`/internal-chats/${id}`);
  },

  // Messages
  async listMessages(chatId: string, limit = 50) {
    return api.get<{ data: InternalMessage[] }>(`/internal-chats/${chatId}/messages`, { limit });
  },

  async sendMessage(chatId: string, data: {
    message: string;
    mentions?: string[];
    attachments?: { name: string; url: string; type: string }[];
  }) {
    return api.post<{ data: InternalMessage }>(`/internal-chats/${chatId}/messages`, data);
  },

  async markAsRead(chatId: string, messageId: string) {
    return api.put(`/internal-chats/${chatId}/messages/${messageId}/read`, {});
  },

  async deleteMessage(chatId: string, messageId: string) {
    return api.delete(`/internal-chats/${chatId}/messages/${messageId}`);
  }
};
