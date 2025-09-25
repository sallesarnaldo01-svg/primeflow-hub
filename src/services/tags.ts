import { api, PaginatedResponse } from './api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category?: string;
  isGlobal: boolean;
  workspaceId: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;

  // Relacionamentos
  creator?: User;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface TagCategory {
  id: string;
  name: string;
  color: string;
  tags: Tag[];
}

export interface TagsFilters {
  search?: string;
  category?: string;
  isGlobal?: boolean;
  sortBy?: 'name' | 'usage' | 'created';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTagData {
  name: string;
  color: string;
  description?: string;
  category?: string;
  isGlobal?: boolean;
}

export interface UpdateTagData extends Partial<CreateTagData> {}

export interface BulkTagOperation {
  entityType: 'contact' | 'deal' | 'ticket' | 'conversation';
  entityIds: string[];
  tagIds: string[];
  operation: 'add' | 'remove' | 'replace';
}

export interface TagUsageStats {
  tagId: string;
  tagName: string;
  contacts: number;
  deals: number;
  tickets: number;
  conversations: number;
  total: number;
}

export const tagsService = {
  async getTags(filters?: TagsFilters): Promise<PaginatedResponse<Tag>> {
    const response = await api.get<PaginatedResponse<Tag>>('/tags', filters);
    return response.data;
  },

  async getTag(id: string): Promise<Tag> {
    const response = await api.get<Tag>(`/tags/${id}`);
    return response.data;
  },

  async createTag(data: CreateTagData): Promise<Tag> {
    const response = await api.post<Tag>('/tags', data);
    return response.data;
  },

  async updateTag(id: string, data: UpdateTagData): Promise<Tag> {
    const response = await api.put<Tag>(`/tags/${id}`, data);
    return response.data;
  },

  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },

  async mergeTags(sourceTagIds: string[], targetTagId: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/tags/merge', {
      sourceTagIds,
      targetTagId,
    });
    return response.data;
  },

  async bulkOperation(operation: BulkTagOperation): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/tags/bulk-operation', operation);
    return response.data;
  },

  async getCategories(): Promise<TagCategory[]> {
    const response = await api.get<TagCategory[]>('/tags/categories');
    return response.data;
  },

  async createCategory(name: string, color: string): Promise<TagCategory> {
    const response = await api.post<TagCategory>('/tags/categories', { name, color });
    return response.data;
  },

  async updateCategory(id: string, data: { name?: string; color?: string }): Promise<TagCategory> {
    const response = await api.put<TagCategory>(`/tags/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/tags/categories/${id}`);
  },

  async getUsageStats(tagIds?: string[]): Promise<TagUsageStats[]> {
    const response = await api.get<TagUsageStats[]>('/tags/usage-stats', { tagIds });
    return response.data;
  },

  async searchTags(query: string, limit = 10): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/tags/search', { query, limit });
    return response.data;
  },

  async getPopularTags(limit = 20): Promise<Tag[]> {
    const response = await api.get<Tag[]>('/tags/popular', { limit });
    return response.data;
  },
};