import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AIAgent {
  id: string;
  tenantId: string;
  providerId: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  config?: any;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    type: string;
    name: string;
  };
}

export function useAIAgent(agentId: string | null) {
  const queryClient = useQueryClient();

  const { data: agent, isLoading } = useQuery({
    queryKey: ['ai-agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const response = await apiClient.get(`/ai-agents/${agentId}`);
      return response.data as AIAgent;
    },
    enabled: !!agentId
  });

  const updateSystemPrompt = useMutation({
    mutationFn: async (prompt: string) => {
      if (!agentId) throw new Error('Agent ID is required');
      return apiClient.put(`/ai-agents/${agentId}/system-prompt`, { 
        system_prompt: prompt 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    }
  });

  const updateAgent = useMutation({
    mutationFn: async (data: Partial<AIAgent>) => {
      if (!agentId) throw new Error('Agent ID is required');
      return apiClient.put(`/ai-agents/${agentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    }
  });

  return {
    agent,
    isLoading,
    updateSystemPrompt: updateSystemPrompt.mutateAsync,
    updateAgent: updateAgent.mutateAsync,
    isUpdating: updateSystemPrompt.isPending || updateAgent.isPending
  };
}

export function useAIAgents() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: async () => {
      const response = await apiClient.get('/ai-agents');
      return response.data as AIAgent[];
    }
  });

  return {
    agents: agents || [],
    isLoading
  };
}
