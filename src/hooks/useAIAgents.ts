import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiAgentsService, AIAgent } from '@/services/aiAgents';
import { toast } from 'sonner';

export const useAIAgents = () => {
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ['ai-agents'],
    queryFn: () => aiAgentsService.list(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AIAgent> }) =>
      aiAgentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Agente atualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar agente');
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({ id, templateId }: { id: string; templateId: string }) =>
      aiAgentsService.applyTemplate(id, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Template aplicado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao aplicar template');
    },
  });

  return {
    agents,
    isLoading,
    updateAgent: updateAgentMutation.mutate,
    applyTemplate: applyTemplateMutation.mutate,
  };
};

export const useAIAgent = (agentId: string | null) => {
  const queryClient = useQueryClient();

  const { data: agent, isLoading } = useQuery({
    queryKey: ['ai-agent', agentId],
    queryFn: () => (agentId ? aiAgentsService.getById(agentId) : null),
    enabled: !!agentId,
    retry: 1,
  });

  const updateSystemPromptMutation = useMutation({
    mutationFn: (systemPrompt: string) =>
      agentId ? aiAgentsService.updateSystemPrompt(agentId, systemPrompt) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Prompt do sistema atualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar prompt');
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: (data: Partial<AIAgent>) =>
      agentId ? aiAgentsService.update(agentId, data) : Promise.reject(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agent', agentId] });
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast.success('Agente atualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar agente');
    },
  });

  return {
    agent,
    isLoading,
    updateSystemPrompt: updateSystemPromptMutation.mutate,
    updateAgent: updateAgentMutation.mutate,
    isUpdating: updateSystemPromptMutation.isPending || updateAgentMutation.isPending,
  };
};
