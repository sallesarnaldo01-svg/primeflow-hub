import { apiClient } from '@/lib/api-client';
import { Workflow, WorkflowValidationError } from '@/types/workflow';

export const workflowsService = {
  async getWorkflows(): Promise<Workflow[]> {
    const response = await apiClient.get<Workflow[]>('/workflows');
    return response.data;
  },

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.get<Workflow>(`/workflows/${id}`);
    return response.data;
  },

  async createWorkflow(data: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.post<Workflow>('/workflows', data);
    return response.data;
  },

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const response = await apiClient.put<Workflow>(`/workflows/${id}`, data);
    return response.data;
  },

  async deleteWorkflow(id: string): Promise<void> {
    await apiClient.delete(`/workflows/${id}`);
  },

  async validateWorkflow(workflow: Workflow): Promise<{ valid: boolean; errors: WorkflowValidationError[] }> {
    const response = await apiClient.post<{ valid: boolean; errors: WorkflowValidationError[] }>(
      '/workflows/validate',
      workflow
    );
    return response.data;
  },

  async publishWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflows/${id}/publish`);
    return response.data;
  },

  async duplicateWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflows/${id}/duplicate`);
    return response.data;
  },
};
