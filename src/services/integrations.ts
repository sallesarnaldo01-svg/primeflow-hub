import { supabase } from '@/integrations/supabase/client';
import { Integration, IntegrationStatus } from '@/types/integrations';

export const integrationsService = {
  async getIntegrations(): Promise<Integration[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(int => ({
      ...int,
      provider: int.provider as 'whatsapp' | 'facebook' | 'instagram',
      status: int.status as 'connected' | 'disconnected' | 'error',
      config: int.config as any
    }));
  },

  async getIntegrationStatus(): Promise<IntegrationStatus[]> {
    const integrations = await this.getIntegrations();
    
    const statusMap = integrations.reduce((acc, int) => {
      if (!acc[int.provider]) {
        acc[int.provider] = {
          provider: int.provider,
          connected: int.status === 'connected',
          accounts: 0,
          lastSync: int.last_sync_at
        };
      }
      if (int.status === 'connected') {
        acc[int.provider].accounts += 1;
      }
      return acc;
    }, {} as Record<string, IntegrationStatus>);

    return Object.values(statusMap);
  },

  async connectIntegration(provider: string, config: any): Promise<Integration> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('integrations')
      .insert({
        user_id: user.id,
        provider,
        config,
        status: 'connected',
        connected_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      provider: data.provider as 'whatsapp' | 'facebook' | 'instagram',
      status: data.status as 'connected' | 'disconnected' | 'error',
      config: data.config as any
    };
  },

  async updateIntegration(id: string, config: any): Promise<Integration> {
    const { data, error } = await supabase
      .from('integrations')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      provider: data.provider as 'whatsapp' | 'facebook' | 'instagram',
      status: data.status as 'connected' | 'disconnected' | 'error',
      config: data.config as any
    };
  },

  async disconnectIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integrations')
      .update({ 
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async syncIntegration(id: string): Promise<void> {
    const { error } = await supabase
      .from('integrations')
      .update({ 
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      success: data.status === 'connected',
      message: data.status === 'connected' ? 'Integration is active' : 'Integration is not connected'
    };
  },
};
