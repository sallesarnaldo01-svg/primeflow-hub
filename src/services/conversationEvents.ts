import { apiClient } from '@/lib/api-client';

export interface ConversationEvent {
  id: string;
  tenantId: string;
  conversationId: string;
  type: string;
  actor: string;
  actorId?: string;
  actorName?: string;
  content?: string;
  metadata?: any;
  rating?: number;
  feedback?: string;
  createdAt: string;
}

export const conversationEventsService = {
  async list(conversationId: string, limit?: number): Promise<ConversationEvent[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<ConversationEvent[]>(
      `/conversations/${conversationId}/events${params}`
    );
    return response.data;
  },

  async timeline(conversationId: string): Promise<any> {
    const response = await apiClient.get(`/conversations/${conversationId}/timeline`);
    return response.data;
  },

  async create(conversationId: string, event: {
    type: string;
    actor: string;
    actorId?: string;
    actorName?: string;
    content?: string;
    metadata?: any;
  }): Promise<ConversationEvent> {
    const response = await apiClient.post<ConversationEvent>(
      `/conversations/${conversationId}/events`,
      event
    );
    return response.data;
  },

  async rate(conversationId: string, eventId: string, rating: number, feedback?: string): Promise<ConversationEvent> {
    const response = await apiClient.post<ConversationEvent>(
      `/conversations/${conversationId}/events/${eventId}/rate`,
      { rating, feedback }
    );
    return response.data;
  }
};
