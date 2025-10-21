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
    console.log('[WhatsApp Service] Initiating connection via API...');
    
    const { data } = await apiClient.post<WhatsAppConnection>('/whatsapp/initiate', {
      name: name || 'WhatsApp Connection'
    });

    console.log('[WhatsApp Service] Connection initiated:', data);
    return data;
  },

  async getQRCode(connectionId: string): Promise<{ qrCode: string; status: string }> {
    console.log('[WhatsApp Service] Fetching QR Code for:', connectionId);
    
    const { data } = await apiClient.get<{ qrCode: string; status: string }>(
      `/whatsapp/${connectionId}/qr`
    );

    console.log('[WhatsApp Service] QR Code fetched, status:', data.status);
    return data;
  },

  async getConnectionStatus(connectionId: string): Promise<WhatsAppConnection> {
    console.log('[WhatsApp Service] Fetching connection status for:', connectionId);
    
    const { data } = await apiClient.get<WhatsAppConnection>(
      `/whatsapp/${connectionId}/status`
    );

    console.log('[WhatsApp Service] Connection status:', data.status);
    return data;
  },

  async sendBulkMessages(
    connectionId: string,
    requestData: BulkMessageRequest
  ): Promise<{ broadcastId: string; totalContacts: number; estimatedTime: number }> {
    console.log('[WhatsApp Service] Sending bulk messages:', {
      connectionId,
      totalContacts: requestData.contacts.length
    });

    if (!requestData.contacts || requestData.contacts.length === 0) {
      throw new Error('Nenhum contato fornecido');
    }

    const { data } = await apiClient.post<{
      broadcastId: string;
      totalContacts: number;
      estimatedTime: number;
    }>(`/whatsapp/${connectionId}/bulk`, requestData);

    console.log('[WhatsApp Service] Bulk send initiated:', data);
    return data;
  },

  async disconnect(connectionId: string): Promise<void> {
    console.log('[WhatsApp Service] Disconnecting:', connectionId);
    
    await apiClient.post(`/whatsapp/${connectionId}/disconnect`);
    
    console.log('[WhatsApp Service] Disconnected successfully');
  },
};
