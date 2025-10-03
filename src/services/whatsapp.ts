import { apiClient } from '@/lib/api-client';

export interface WhatsAppConnection {
  id: string;
  status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';
  phone?: string;
  device?: string;
  connectedAt?: string;
}

export interface BulkMessageRequest {
  contacts: string[];
  message: {
    text: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio' | 'video' | 'document';
  };
  delayMs?: number;
}

export const whatsappService = {
  async initiateConnection(name?: string): Promise<WhatsAppConnection> {
    const response = await apiClient.post<WhatsAppConnection>('/whatsapp/initiate', { name });
    return response.data;
  },

  async getQRCode(connectionId: string): Promise<{ qrCode: string; status: string }> {
    const response = await apiClient.get<{ qrCode: string; status: string }>(
      `/whatsapp/${connectionId}/qr`
    );
    return response.data;
  },

  async getConnectionStatus(connectionId: string): Promise<WhatsAppConnection> {
    const response = await apiClient.get<WhatsAppConnection>(
      `/whatsapp/${connectionId}/status`
    );
    return response.data;
  },

  async sendBulkMessages(
    connectionId: string,
    data: BulkMessageRequest
  ): Promise<{ broadcastId: string; totalContacts: number; estimatedTime: number }> {
    const response = await apiClient.post(
      `/whatsapp/${connectionId}/bulk`,
      data
    );
    return response.data;
  },

  async disconnect(connectionId: string): Promise<void> {
    await apiClient.post(`/whatsapp/${connectionId}/disconnect`);
  },
};
