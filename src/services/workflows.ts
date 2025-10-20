import { apiClient } from '@/lib/api-client';

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  graphJson: any;
  status: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
  version: number;
  triggerConfig?: any;
  rateLimitConfig?: any;
  tags: string[];
  createdBy?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  tenantId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  triggerData?: any;
  contextData?: any;
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface WorkflowLog {
  id: string;
  runId: string;
  nodeId: string;
  nodeType: string;
  status: 'SUCCESS' | 'ERROR' | 'SKIPPED';
  inputData?: any;
  outputData?: any;
  errorMessage?: string;
  tokensUsed?: number;
  costBrl?: number;
  durationMs?: number;
  executedAt: string;
}

export const workflowsService = {
  async getWorkflows(status?: string): Promise<Workflow[]> {
    const response = await apiClient.get<Workflow[]>('/workflows', { params: { status } });
    return response.data;
  },

  async getWorkflowById(id: string): Promise<Workflow> {
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

  async publishWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflows/${id}/publish`);
    return response.data;
  },

  async pauseWorkflow(id: string): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflows/${id}/pause`);
    return response.data;
  },

  async duplicateWorkflow(id: string, name: string): Promise<Workflow> {
    const response = await apiClient.post<Workflow>(`/workflows/${id}/duplicate`, { name });
    return response.data;
  },

  async validateWorkflow(graphJson: any): Promise<{ valid: boolean; errors: string[] }> {
    const response = await apiClient.post('/workflows/validate', { graphJson });
    return response.data;
  },

  async executeWorkflow(id: string, triggerData?: any, contextData?: any): Promise<{ jobId: string; message: string }> {
    const response = await apiClient.post(`/workflows/${id}/execute`, { triggerData, contextData });
    return response.data;
  },

  async getWorkflowRuns(workflowId: string, limit = 50, offset = 0): Promise<WorkflowRun[]> {
    const response = await apiClient.get<WorkflowRun[]>(`/workflows/${workflowId}/runs`, {
      params: { limit, offset }
    });
    return response.data;
  },

  async getWorkflowRunById(runId: string): Promise<WorkflowRun> {
    const response = await apiClient.get<WorkflowRun>(`/workflows/runs/${runId}`);
    return response.data;
  },

  async getWorkflowLogs(runId: string): Promise<WorkflowLog[]> {
    const response = await apiClient.get<WorkflowLog[]>(`/workflows/runs/${runId}/logs`);
    return response.data;
  }
};
