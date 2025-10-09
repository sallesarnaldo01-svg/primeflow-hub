import { supabase } from '@/integrations/supabase/client';

export interface InstagramConnection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  meta?: any;
}

export const instagramService = {
  async initiate(username: string, password: string, name?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('instagram_connections')
      .insert({
        user_id: user.id,
        name: name || 'Instagram Connection',
        status: 'CONNECTED',
        meta: { username }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAccounts(connectionId: string) {
    const { data, error } = await supabase
      .from('instagram_connections')
      .select('meta')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    const meta = data.meta as any;
    return meta?.accounts || [];
  },

  async sendBulk(
    connectionId: string,
    recipients: string[],
    message: string,
    delay?: number,
    jitter?: number
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        user_id: user.id,
        name: `Instagram Broadcast ${new Date().toISOString()}`,
        message,
        channel: 'instagram',
        status: 'sending',
        total_contacts: recipients.length
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async disconnect(connectionId: string) {
    const { error } = await supabase
      .from('instagram_connections')
      .update({ 
        status: 'DISCONNECTED',
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (error) throw error;
  },

  async getStatus(connectionId: string) {
    const { data, error } = await supabase
      .from('instagram_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    return data;
  }
};
