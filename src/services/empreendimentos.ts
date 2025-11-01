import { apiClient } from '@/lib/api-client';

export interface Empreendimento {
  id: string;
  tenant_id: string;
  nome: string;
  descricao?: string;
  construtora?: string;
  cidade?: string;
  estado?: string;
  status: string;
  total_unidades?: number;
  unidades_disponiveis?: number;
  valor_minimo?: number;
  valor_maximo?: number;
  created_at: string;
}

export const empreendimentosService = {
  async list(filters?: { status?: string; cidade?: string }) {
    const { data } = await apiClient.get('/empreendimentos', { params: filters });
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
