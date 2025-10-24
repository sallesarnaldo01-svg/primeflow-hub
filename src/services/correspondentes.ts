import { apiClient } from '@/lib/api-client';

export interface Correspondente {
  id: string;
  tenantId: string;
  nome: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  createdAt: string;
}

export interface UsuarioCorrespondente {
  id: string;
  correspondenteId: string;
  nome: string;
  email: string;
  telefone?: string;
  ativo: boolean;
  createdAt: string;
}

export const correspondentesService = {
  async list() {
    const { data } = await apiClient.get('/correspondentes');
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

  async getUsuarios(correspondenteId: string) {
    const { data } = await apiClient.get(`/correspondentes/${correspondenteId}/usuarios`);
    return data;
  },

  async createUsuario(correspondenteId: string, usuario: Partial<UsuarioCorrespondente>) {
    const { data } = await apiClient.post(`/correspondentes/${correspondenteId}/usuarios`, usuario);
    return data;
  },

  async updateUsuario(usuarioId: string, usuario: Partial<UsuarioCorrespondente>) {
    const { data } = await apiClient.put(`/correspondentes/usuarios/${usuarioId}`, usuario);
    return data;
  },

  async deleteUsuario(usuarioId: string) {
    await apiClient.delete(`/correspondentes/usuarios/${usuarioId}`);
  }
};
