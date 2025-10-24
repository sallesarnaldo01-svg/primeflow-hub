import { apiClient } from '@/lib/api-client';

export interface LeadInteraction {
  id: string;
  leadId: string;
  tipo: 'ANOTACAO' | 'LIGACAO' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'VISITA' | 'TAREFA';
  descricao: string;
  resultado?: string;
  duracao?: number;
  agendadoPara?: string;
  concluido: boolean;
  createdBy: string;
  createdAt: string;
}

export const leadInteractionsService = {
  async list(leadId: string) {
    const { data } = await apiClient.get(`/leads/${leadId}/interactions`);
    return data;
  },

  async create(leadId: string, interaction: Partial<LeadInteraction>) {
    const { data } = await apiClient.post(`/leads/${leadId}/interactions`, interaction);
    return data;
  },

  async update(interactionId: string, interaction: Partial<LeadInteraction>) {
    const { data } = await apiClient.put(`/lead-interactions/${interactionId}`, interaction);
    return data;
  },

  async delete(interactionId: string) {
    await apiClient.delete(`/lead-interactions/${interactionId}`);
  }
};
