import { supabase } from '@/integrations/supabase/client';

export interface FacebookConnection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  meta?: any;
}

export const facebookService = {
  async initiate(email: string, password: string, name?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('facebook_connections')
      .insert({
        user_id: user.id,
        name: name || 'Facebook Connection',
        status: 'CONNECTED',
        meta: { email }
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPages(connectionId: string) {
    const { data, error } = await supabase
      .from('facebook_connections')
      .select('meta')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    const meta = data.meta as any;
    return meta?.pages || [];
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
        name: `Facebook Broadcast ${new Date().toISOString()}`,
        message,
        channel: 'facebook',
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
      .from('facebook_connections')
      .update({ 
        status: 'DISCONNECTED',
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId);

    if (error) throw error;
  },

  async getStatus(connectionId: string) {
    const { data, error } = await supabase
      .from('facebook_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error) throw error;
    return data;
  }
};
