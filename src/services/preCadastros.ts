import { apiClient } from '@/lib/api-client';

export interface PreCadastro {
  id: string;
  numero: string;
  tenantId: string;
  leadId?: string;
  clienteNome: string;
  clienteCpf: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  empreendimentoId: string;
  blocoUnidade?: string;
  valorAvaliacao: number;
  valorAprovado?: number;
  valorSubsidio?: number;
  valorFgts?: number;
  valorTotal?: number;
  rendaMensalBruta?: number;
  rendaFamiliarBruta?: number;
  prazoFinanciamento?: number;
  valorPrestacao?: number;
  situacao: 'NOVA' | 'ANALISE' | 'APROVADO' | 'REJEITADO' | 'PENDENTE' | 'CANCELADO';
  correspondente?: {
    empresaId?: string;
    usuarioId?: string;
  };
  dataVencimento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentoPreCadastro {
  id: string;
  preCadastroId: string;
  nome: string;
  tipo: string;
  fileUrl: string;
  pessoa: 'TITULAR' | 'CONJUGE' | 'OUTROS';
  situacao: 'PENDENTE' | 'AGUARDANDO' | 'APROVADO' | 'REJEITADO';
  observacoes?: string;
  createdAt: string;
}

export const preCadastrosService = {
  async list(filters?: { situacao?: string; empreendimentoId?: string }) {
    const { data } = await apiClient.get('/pre-cadastros', { params: filters });
    return data;
  },

  async getById(id: string) {
    const { data } = await apiClient.get(`/pre-cadastros/${id}`);
    return data;
  },

  async create(preCadastro: Partial<PreCadastro>) {
    const { data } = await apiClient.post('/pre-cadastros', preCadastro);
    return data;
  },

  async update(id: string, preCadastro: Partial<PreCadastro>) {
    const { data } = await apiClient.put(`/pre-cadastros/${id}`, preCadastro);
    return data;
  },

  async delete(id: string) {
    await apiClient.delete(`/pre-cadastros/${id}`);
  },

  async getDocumentos(preCadastroId: string) {
    const { data } = await apiClient.get(`/pre-cadastros/${preCadastroId}/documentos`);
    return data;
  },

  async uploadDocumento(preCadastroId: string, formData: FormData) {
    const { data } = await apiClient.post(`/pre-cadastros/${preCadastroId}/documentos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  async aprovarDocumento(documentoId: string) {
    const { data } = await apiClient.post(`/pre-cadastros/documentos/${documentoId}/aprovar`);
    return data;
  },

  async rejeitarDocumento(documentoId: string, motivo: string) {
    const { data } = await apiClient.post(`/pre-cadastros/documentos/${documentoId}/rejeitar`, { motivo });
    return data;
  },

  async downloadDocumentos(preCadastroId: string, formato: 'zip' | 'pdf' = 'zip') {
    const { data } = await apiClient.get(`/pre-cadastros/${preCadastroId}/documentos/download`, {
      params: { formato },
      responseType: 'blob'
    });
    return data;
  },

  async getPercentualDocumentacao(preCadastroId: string) {
    const { data } = await apiClient.get(`/pre-cadastros/${preCadastroId}/documentos/percentual`);
    return data;
  }
};
