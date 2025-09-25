import { api, PaginatedResponse } from './api';

export interface Conversation {
  id: string;
  contactId: string;
  channel: 'whatsapp' | 'facebook' | 'instagram' | 'email' | 'webchat';
  status: 'open' | 'pending' | 'closed';
  assignedTo?: string;
  lastMessageAt: string;
  unreadCount: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos
  contact?: Contact;
  assignee?: User;
  messages?: Message[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: Attachment[];
  isInternal?: boolean;
  mentions?: string[];
  replyTo?: string;
  createdAt: string;
  
  // Relacionamentos
  sender?: User;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  tags: string[];
  customFields?: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ConversationsFilters {
  status?: string;
  channel?: string;
  assignedTo?: string;
  tags?: string[];
  priority?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'audio' | 'video' | 'document';
  attachments?: File[];
  isInternal?: boolean;
  mentions?: string[];
  replyTo?: string;
}

export interface QuickReply {
  id: string;
  title: string;
  content: string;
  tags: string[];
  variables?: string[];
}

export const conversasService = {
  async getConversations(filters?: ConversationsFilters): Promise<PaginatedResponse<Conversation>> {
    const response = await api.get<PaginatedResponse<Conversation>>('/conversations', filters);
    return response.data;
  },

  async getConversation(id: string): Promise<Conversation> {
    const response = await api.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    const response = await api.get<PaginatedResponse<Message>>(
      `/conversations/${conversationId}/messages`,
      { page, limit }
    );
    return response.data;
  },

  async sendMessage(data: SendMessageData): Promise<Message> {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('type', data.type || 'text');
    formData.append('isInternal', String(data.isInternal || false));
    
    if (data.mentions) {
      formData.append('mentions', JSON.stringify(data.mentions));
    }
    
    if (data.replyTo) {
      formData.append('replyTo', data.replyTo);
    }

    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await fetch(`/api/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      body: formData,
    });

    return response.json();
  },

  async assignConversation(conversationId: string, userId: string): Promise<Conversation> {
    const response = await api.put<Conversation>(`/conversations/${conversationId}/assign`, {
      userId,
    });
    return response.data;
  },

  async updateStatus(conversationId: string, status: string): Promise<Conversation> {
    const response = await api.put<Conversation>(`/conversations/${conversationId}/status`, {
      status,
    });
    return response.data;
  },

  async addTags(conversationId: string, tags: string[]): Promise<Conversation> {
    const response = await api.put<Conversation>(`/conversations/${conversationId}/tags`, {
      tags,
    });
    return response.data;
  },

  async removeTags(conversationId: string, tags: string[]): Promise<Conversation> {
    const response = await api.put<Conversation>(`/conversations/${conversationId}/tags/remove`, {
      tags,
    });
    return response.data;
  },

  async archiveConversation(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/archive`);
  },

  async getQuickReplies(search?: string): Promise<QuickReply[]> {
    const response = await api.get<QuickReply[]>('/quick-replies', { search });
    return response.data;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.put(`/conversations/${conversationId}/read`);
  },

  async translateMessage(messageId: string, targetLanguage: string): Promise<{ translation: string }> {
    const response = await api.post<{ translation: string }>(`/messages/${messageId}/translate`, {
      targetLanguage,
    });
    return response.data;
  },

  async summarizeConversation(conversationId: string): Promise<{ summary: string }> {
    const response = await api.post<{ summary: string }>(`/conversations/${conversationId}/summarize`);
    return response.data;
  },
};