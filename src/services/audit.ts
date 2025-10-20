import { api } from './api';

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface AuditLogFilters {
  user_id?: string;
  action?: string;
  entity?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export const auditService = {
  async list(filters: AuditLogFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    return api.get<{ data: AuditLog[]; total: number }>(`/audit?${params}`);
  },

  async log(action: string, entity: string, details: {
    entity_id?: string;
    old_value?: any;
    new_value?: any;
  }) {
    return api.post('/audit', { action, entity, ...details });
  },

  async export(filters: AuditLogFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
    
    const response = await api.get(`/audit/export?${params}`);
    
    const blob = new Blob([response.data as string], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};
