import { api } from './api';

export interface Webhook {
  id: string;
  tenantId: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  enabled: boolean;
  retryConfig: {
    maxAttempts: number;
    backoffSeconds: number[];
  };
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  eventType: string;
  payload: any;
  responseStatus?: number;
  responseBody?: string;
  attemptNumber: number;
  success: boolean;
  errorMessage?: string;
  durationMs?: number;
  createdAt: string;
}

export interface WebhookStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
}

export interface CreateWebhookRequest {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  metadata?: any;
}

export const customWebhooksService = {
  async list(enabled?: boolean): Promise<Webhook[]> {
    const params = enabled !== undefined ? { enabled } : {};
    const response = await api.get<Webhook[]>('/custom-webhooks', params);
    return (response.data as any) || [];
  },

  async getById(id: string): Promise<Webhook> {
    const response = await api.get<Webhook>(`/custom-webhooks/${id}`);
    return (response.data as any);
  },

  async create(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await api.post<Webhook>('/custom-webhooks', data);
    return (response.data as any);
  },

  async update(id: string, data: Partial<CreateWebhookRequest>): Promise<Webhook> {
    const response = await api.put<Webhook>(`/custom-webhooks/${id}`, data);
    return (response.data as any);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/custom-webhooks/${id}`);
  },

  async getLogs(id: string, params?: { page?: number; limit?: number; success?: boolean }): Promise<any> {
    const response = await api.get(`/custom-webhooks/${id}/logs`, params);
    return response.data;
  },

  async getStats(id: string): Promise<any> {
    const response = await api.get(`/custom-webhooks/${id}/stats`);
    return response.data;
  },

  async test(id: string): Promise<void> {
    await api.post(`/custom-webhooks/${id}/test`);
  },

  async regenerateSecret(id: string): Promise<Webhook> {
    const response = await api.post<Webhook>(`/custom-webhooks/${id}/regenerate-secret`);
    return (response.data as any);
  },

  // Available event types
  getAvailableEvents(): string[] {
    return [
      'message.received',
      'message.sent',
      'conversation.created',
      'conversation.updated',
      'conversation.closed',
      'contact.created',
      'contact.updated',
      'deal.created',
      'deal.updated',
      'deal.moved',
      'lead.qualified',
      'workflow.completed',
      'broadcast.completed',
      '*' // Subscribe to all events
    ];
  }
};