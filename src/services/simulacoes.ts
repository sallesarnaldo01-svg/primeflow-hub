import { apiClient } from '@/lib/api-client';

export interface SimulacaoFinanciamento {
  id?: string;
  tenantId?: string;
  leadId?: string;
  preCadastroId?: string;
  valorImovel: number;
  valorEntrada: number;
  prazoMeses: number;
  taxaJuros: number;
  valorFgts?: number;
  valorSubsidio?: number;
  sistemaAmortizacao: 'SAC' | 'PRICE';
  valorFinanciado?: number;
  valorPrestacao?: number;
  valorTotal?: number;
  rendaMinimaRequerida?: number;
  createdAt?: string;
}

export const simulacoesService = {
  async calcular(dados: Partial<SimulacaoFinanciamento>) {
    const { data } = await apiClient.post('/simulacoes/calcular', dados);
    return data;
  },

  async salvar(simulacao: SimulacaoFinanciamento) {
    const { data } = await apiClient.post('/simulacoes', simulacao);
    return data;
  },

  async list(filters?: { leadId?: string; preCadastroId?: string }) {
    const { data } = await apiClient.get('/simulacoes', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/simulacoes/${id}`);
    return data;
  },

  async gerarPdf(id: string) {
    const { data } = await apiClient.get(`/simulacoes/${id}/pdf`, {
      responseType: 'blob'
    });
    return data;
  }
};
