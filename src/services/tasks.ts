import { api } from './api';

export interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  created_by: string;
  due_date?: string;
  checklist?: { id: number; text: string; completed: boolean }[];
  tags?: string[];
  contact_id?: string;
  deal_id?: string;
  conversation_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  comment: string;
  mentions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  created_at: string;
}

export const tasksService = {
  async list(filters?: { status?: string; assignee_id?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id);
    
    return api.get<{ data: Task[] }>(`/tasks?${params}`);
  },

  async get(id: string) {
    return api.get<{ data: Task }>(`/tasks/${id}`);
  },

  async create(task: Partial<Task>) {
    return api.post<{ data: Task }>('/tasks', task);
  },

  async update(id: string, updates: Partial<Task>) {
    return api.put<{ data: Task }>(`/tasks/${id}`, updates);
  },

  async delete(id: string) {
    return api.delete(`/tasks/${id}`);
  },

  async move(id: string, status: Task['status'], position: number) {
    return api.put(`/tasks/${id}/move`, { status, position });
  },

  // Comments
  async getComments(taskId: string) {
    return api.get<{ data: TaskComment[] }>(`/tasks/${taskId}/comments`);
  },

  async addComment(taskId: string, comment: string, mentions?: string[]) {
    return api.post<{ data: TaskComment }>(`/tasks/${taskId}/comments`, {
      comment,
      mentions
    });
  },

  async updateComment(taskId: string, commentId: string, comment: string) {
    return api.put(`/tasks/${taskId}/comments/${commentId}`, { comment });
  },

  async deleteComment(taskId: string, commentId: string) {
    return api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Attachments
  async getAttachments(taskId: string) {
    return api.get<{ data: TaskAttachment[] }>(`/tasks/${taskId}/attachments`);
  },

  async uploadAttachment(taskId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<{ data: TaskAttachment }>(
      `/tasks/${taskId}/attachments`,
      formData
    );
  },

  async deleteAttachment(taskId: string, attachmentId: string) {
    return api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  }
};
