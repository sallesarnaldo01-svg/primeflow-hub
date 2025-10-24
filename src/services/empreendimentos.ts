import { apiClient } from '@/lib/api-client';

export interface Empreendimento {
  id: string;
  tenantId: string;
  nome: string;
  descricao?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  construtora?: string;
  valorMinimo?: number;
  valorMaximo?: number;
  ativo: boolean;
  createdAt: string;
}

export const empreendimentosService = {
  async list() {
    const { data } = await apiClient.get('/empreendimentos');
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/empreendimentos/${id}`);
    return data;
  },

  async create(empreendimento: Partial<Empreendimento>) {
    const { data } = await apiClient.post('/empreendimentos', empreendimento);
    return data;
  },

  async update(id: string, empreendimento: Partial<Empreendimento>) {
    const { data } = await apiClient.put(`/empreendimentos/${id}`, empreendimento);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/empreendimentos/${id}`);
  }
};
