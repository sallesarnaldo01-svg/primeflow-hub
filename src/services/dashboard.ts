import { apiClient } from '@/lib/api-client';

export interface DashboardMetrics {
  conversations: {
    total: number;
    active: number;
    messages: number;
    todayMessages: number;
  };
  leads: {
    total: number;
    qualified: number;
    converted: number;
    conversionRate: string;
  };
  campaigns: {
    active: number;
    totalSent: number;
  };
  tickets: {
    open: number;
    total: number;
  };
}

export interface Activity {
  type: string;
  timestamp: string;
  description: string;
  channel: string;
}

export const dashboardService = {
  async getMetrics() {
    return apiClient.get<{ data: DashboardMetrics }>('/dashboard/metrics');
  },

  async getActivityFeed(limit = 20) {
    return apiClient.get<{ data: Activity[] }>(`/dashboard/activity?limit=${limit}`);
  },

  async getConversationTrends(days = 7) {
    return apiClient.get<{ data: any[] }>(`/dashboard/trends?days=${days}`);
  },
};
