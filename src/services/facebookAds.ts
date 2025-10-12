import { apiClient } from '@/lib/api-client';

export interface FacebookCampaign {
  id: string;
  tenantId: string;
  fbCampaignId?: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  objective: 'CONVERSIONS' | 'TRAFFIC' | 'ENGAGEMENT' | 'LEADS' | 'REACH' | 'BRAND_AWARENESS';
  budgetDaily?: number;
  budgetTotal?: number;
  startDate?: string;
  endDate?: string;
  targetAudience?: any;
  targetLists?: string[];
  creativeConfig?: any;
  metrics?: any;
  lastSyncAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FacebookCampaignMetrics {
  id: string;
  campaignId: string;
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpc: number;
  cpa: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const facebookAdsService = {
  async getCampaigns(status?: string): Promise<FacebookCampaign[]> {
    const response = await apiClient.get<FacebookCampaign[]>('/facebook-ads', { params: { status } });
    return response.data;
  },

  async getCampaignById(id: string): Promise<FacebookCampaign> {
    const response = await apiClient.get<FacebookCampaign>(`/facebook-ads/${id}`);
    return response.data;
  },

  async createCampaign(data: Partial<FacebookCampaign>): Promise<FacebookCampaign> {
    const response = await apiClient.post<FacebookCampaign>('/facebook-ads', data);
    return response.data;
  },

  async updateCampaign(id: string, data: Partial<FacebookCampaign>): Promise<FacebookCampaign> {
    const response = await apiClient.put<FacebookCampaign>(`/facebook-ads/${id}`, data);
    return response.data;
  },

  async deleteCampaign(id: string): Promise<void> {
    await apiClient.delete(`/facebook-ads/${id}`);
  },

  async pauseCampaign(id: string): Promise<FacebookCampaign> {
    const response = await apiClient.post<FacebookCampaign>(`/facebook-ads/${id}/pause`);
    return response.data;
  },

  async activateCampaign(id: string): Promise<FacebookCampaign> {
    const response = await apiClient.post<FacebookCampaign>(`/facebook-ads/${id}/activate`);
    return response.data;
  },

  async getCampaignMetrics(
    campaignId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<FacebookCampaignMetrics[]> {
    const response = await apiClient.get<FacebookCampaignMetrics[]>(
      `/facebook-ads/${campaignId}/metrics`,
      { params: { dateFrom, dateTo } }
    );
    return response.data;
  },

  async syncCampaignMetrics(campaignId: string): Promise<any> {
    const response = await apiClient.post(`/facebook-ads/${campaignId}/sync-metrics`);
    return response.data;
  },

  async syncLeads(campaignId: string): Promise<{ synced: number }> {
    const response = await apiClient.post(`/facebook-ads/${campaignId}/sync-leads`);
    return response.data;
  },

  async calculateROI(campaignId: string): Promise<{
    totalSpend: number;
    totalConversions: number;
    estimatedRevenue: number;
    roi: number;
  }> {
    const response = await apiClient.get(`/facebook-ads/${campaignId}/roi`);
    return response.data;
  }
};
