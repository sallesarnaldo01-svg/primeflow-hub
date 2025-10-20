import { api } from './api';

export interface CompanySettings {
  id: string;
  tenant_id: string;
  company_name?: string;
  logo_url?: string;
  timezone: string;
  currency: string;
  locale: string;
  date_format: string;
  business_hours?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };
  created_at: string;
  updated_at: string;
}

export const companySettingsService = {
  async get() {
    return api.get<{ data: CompanySettings }>('/company-settings');
  },

  async update(settings: Partial<CompanySettings>) {
    return api.put<{ data: CompanySettings }>('/company-settings', settings);
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    
    return api.post<{ data: { logo_url: string } }>(
      '/company-settings/logo',
      formData
    );
  }
};
