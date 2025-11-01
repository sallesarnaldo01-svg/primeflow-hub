import { apiClient } from '@/lib/api-client';

export interface Correspondente {
  id: string;
  tenant_id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  banco_credenciado?: string;
  status: string;
  total_usuarios?: number;
  created_at: string;
}

export interface CorrespondenteUsuario {
  id: string;
  correspondente_id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  status: string;
}

export const correspondentesService = {
  async list(filters?: { status?: string }) {
    const { data } = await apiClient.get('/correspondentes', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/correspondentes/${id}`);
    return data;
  },

  async create(correspondente: Partial<Correspondente>) {
    const { data } = await apiClient.post('/correspondentes', correspondente);
    return data;
  },

  async update(id: string, correspondente: Partial<Correspondente>) {
    const { data } = await apiClient.put(`/correspondentes/${id}`, correspondente);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/correspondentes/${id}`);
  },

  async createUsuario(correspondente_id: string, usuario: Partial<CorrespondenteUsuario>) {
    const { data } = await apiClient.post(`/correspondentes/${correspondente_id}/usuarios`, usuario);
    return data;
  },

  async updateUsuario(correspondente_id: string, usuario_id: string, usuario: Partial<CorrespondenteUsuario>) {
    const { data } = await apiClient.put(`/correspondentes/${correspondente_id}/usuarios/${usuario_id}`, usuario);
    return data;
  },

  async deleteUsuario(correspondente_id: string, usuario_id: string) {
    await apiClient.delete(`/correspondentes/${correspondente_id}/usuarios/${usuario_id}`);
  },

  async getUsuarios(correspondente_id: string) {
    const { data } = await apiClient.get(`/correspondentes/${correspondente_id}`);
    return data.usuarios || [];
  }
};
