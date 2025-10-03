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
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentData {
  name: string;
  type: string;
  fileUrl: string;
  content?: string;
  agentId?: string;
  tags?: string[];
  metadata?: any;
}

export const knowledgeService = {
  async list(agentId?: string, type?: string): Promise<KnowledgeDocument[]> {
    const params = new URLSearchParams();
    if (agentId) params.append('agentId', agentId);
    if (type) params.append('type', type);
    
    const response = await apiClient.get<KnowledgeDocument[]>(`/ai/knowledge?${params}`);
    return response.data;
  },

  async create(data: CreateDocumentData): Promise<KnowledgeDocument> {
    const response = await apiClient.post<KnowledgeDocument>('/ai/knowledge', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/ai/knowledge/${id}`);
  },

  async search(query: string, agentId?: string, limit?: number): Promise<any> {
    const response = await apiClient.post('/ai/knowledge/search', { query, agentId, limit });
    return response.data;
  }
};
