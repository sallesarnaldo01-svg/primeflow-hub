import { supabase } from '@/integrations/supabase/client';

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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('whatsapp_connections')
      .insert({
        user_id: user.id,
        name: name || 'WhatsApp Connection',
        status: 'CONNECTING'
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      status: data.status as any,
      phone: data.phone || undefined,
      device: data.device || undefined,
      connectedAt: data.connected_at || undefined
    };
  },

  async getQRCode(connectionId: string): Promise<{ qrCode: string; status: string }> {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('qr_code, status')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    
    return {
      qrCode: data.qr_code || '',
      status: data.status
    };
  },

  async getConnectionStatus(connectionId: string): Promise<WhatsAppConnection> {
    const { data, error } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      status: data.status as any,
      phone: data.phone || undefined,
      device: data.device || undefined,
      connectedAt: data.connected_at || undefined
    };
  },

  async sendBulkMessages(
    connectionId: string,
    data: BulkMessageRequest
  ): Promise<{ broadcastId: string; totalContacts: number; estimatedTime: number }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: broadcast, error } = await supabase
      .from('broadcasts')
      .insert({
        user_id: user.id,
        name: `Broadcast ${new Date().toISOString()}`,
        message: data.message.text,
        channel: 'whatsapp',
        status: 'sending',
        total_contacts: data.contacts.length
      })
      .select()
      .single();

    if (error) throw error;

    return {
      broadcastId: broadcast.id,
      totalContacts: data.contacts.length,
      estimatedTime: data.contacts.length * (data.delayMs || 1000) / 1000
    };
  },

  async disconnect(connectionId: string): Promise<void> {
    const { error } = await supabase
      .from('whatsapp_connections')
      .update({ 
        status: 'DISCONNECTED',
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (error) throw error;
  },
};
