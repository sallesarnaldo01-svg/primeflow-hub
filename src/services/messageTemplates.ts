import { api } from './api';

export interface MessageTemplate {
  id: string;
  tenant_id: string;
  name: string;
  content: string;
  category?: string;
  variables?: string[];
  shared: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTemplateData {
  name: string;
  content: string;
  category?: string;
  variables?: string[];
  shared?: boolean;
}

export const messageTemplatesService = {
  async list(category?: string) {
    const params = category ? { category } : {};
    return api.get<{ data: MessageTemplate[] }>('/message-templates', params);
  },

  async get(id: string) {
    return api.get<{ data: MessageTemplate }>(`/message-templates/${id}`);
  },

  async create(template: CreateTemplateData) {
    return api.post<{ data: MessageTemplate }>('/message-templates', template);
  },

  async update(id: string, updates: Partial<CreateTemplateData>) {
    return api.put<{ data: MessageTemplate }>(`/message-templates/${id}`, updates);
  },

  async delete(id: string) {
    return api.delete(`/message-templates/${id}`);
  },

  // Processar variáveis no template
  processTemplate(content: string, variables: Record<string, string>): string {
    let processed = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value);
    });
    return processed;
  },

  // Extrair variáveis do conteúdo
  extractVariables(content: string): string[] {
    const matches = content.match(/{{\s*(\w+)\s*}}/g);
    if (!matches) return [];
    
    return Array.from(new Set(
      matches.map(match => match.replace(/[{}\s]/g, ''))
    ));
  }
};
