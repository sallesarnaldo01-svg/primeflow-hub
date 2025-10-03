import { apiClient } from '@/lib/api-client';

export interface CustomField {
  id: string;
  tenantId: string;
  entity: string;
  name: string;
  label: string;
  type: string;
  options: string[];
  required: boolean;
  order: number;
  active: boolean;
}

export interface CreateFieldData {
  entity: string;
  name: string;
  label: string;
  type: string;
  options?: string[];
  required?: boolean;
  order?: number;
}

export const customFieldsService = {
  async list(entity?: string): Promise<CustomField[]> {
    const params = entity ? `?entity=${entity}` : '';
    const response = await apiClient.get<CustomField[]>(`/custom-fields${params}`);
    return response.data;
  },

  async listEntities(): Promise<any[]> {
    const response = await apiClient.get('/custom-fields/entities');
    return response.data;
  },

  async create(data: CreateFieldData): Promise<CustomField> {
    const response = await apiClient.post<CustomField>('/custom-fields', data);
    return response.data;
  },

  async update(id: string, data: Partial<CreateFieldData>): Promise<CustomField> {
    const response = await apiClient.put<CustomField>(`/custom-fields/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/custom-fields/${id}`);
  }
};
