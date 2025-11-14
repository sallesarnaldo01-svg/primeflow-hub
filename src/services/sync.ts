import { apiClient } from '@/lib/api-client';

export interface ChannelSyncResult {
  success: boolean;
  listId: string;
  synced: number;
  added: number;
}

export interface ChannelList {
  id: string;
  tenantId: string;
  listId: string;
  channel: string;
  connectionId?: string;
  autoSync: boolean;
  lastSyncAt?: string;
  list: {
    id: string;
    name: string;
    description?: string;
    _count: {
      members: number;
    };
  };
}

export const syncService = {
  async syncChannelContacts(channel: string, connectionId?: string): Promise<ChannelSyncResult> {
    const response = await apiClient.post<ChannelSyncResult>('/sync/contacts', {
      channel,
      connectionId
    });
    return response.data;
  },

  async getChannelLists(): Promise<ChannelList[]> {
    const response = await apiClient.get<ChannelList[]>('/sync/channel-lists');
    return response.data;
  },

  async syncAllChannels(): Promise<{ success: boolean; results: ChannelSyncResult[] }> {
    const response = await apiClient.post<{ success: boolean; results: ChannelSyncResult[] }>('/sync/all');
    return response.data;
  }
};
