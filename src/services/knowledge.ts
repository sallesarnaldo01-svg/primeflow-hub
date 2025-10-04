import { apiClient } from '@/lib/api-client';

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  fileUrl: string;
  content?: string;
  embeddings?: any;
  agentId?: string;
  tags: string[];
  createdAt: string;
}

export const knowledgeService = {
  async list(agentId?: string) {
    const { data } = await apiClient.get(`/ai/knowledge${agentId ? `?agentId=${agentId}` : ''}`);
    return data;
  },
  async create(doc: any) {
    const { data } = await apiClient.post('/ai/knowledge', doc);
    return data;
  },
  async delete(id: string) {
    await apiClient.delete(`/ai/knowledge/${id}`);
  },
  async search(query: string, agentId?: string) {
    const { data } = await apiClient.post('/ai/knowledge/search', { query, agentId });
    return data;
  }
};
