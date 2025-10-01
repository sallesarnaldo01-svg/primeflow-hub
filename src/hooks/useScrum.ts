import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface BacklogItem {
  id: string;
  type: 'story' | 'bug' | 'task';
  title: string;
  description: string;
  points: number;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  assignee: string;
  epic: string;
  sprintId?: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  totalStoryPoints: number;
  completedStoryPoints: number;
}

export interface Ceremony {
  id: string;
  name: string;
  nextDate: string;
  duration: string;
  participants: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

// Mock data inicial
const mockSprints: Sprint[] = [
  {
    id: '1',
    name: 'Sprint 23',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    status: 'active',
    totalStoryPoints: 42,
    completedStoryPoints: 27,
  },
];

const mockBacklog: BacklogItem[] = [
  {
    id: '1',
    type: 'story',
    title: 'Implementar autenticação de usuário',
    description: 'Como usuário, quero fazer login para acessar o sistema',
    points: 8,
    priority: 'high',
    status: 'todo',
    assignee: 'João Santos',
    epic: 'Autenticação',
  },
  {
    id: '2',
    type: 'story',
    title: 'Dashboard de métricas',
    description: 'Como gestor, quero visualizar KPIs em tempo real',
    points: 13,
    priority: 'high',
    status: 'in-progress',
    assignee: 'Ana Costa',
    epic: 'Dashboard',
  },
  {
    id: '3',
    type: 'bug',
    title: 'Corrigir erro no formulário de contato',
    description: 'Campos não estão sendo validados corretamente',
    points: 3,
    priority: 'medium',
    status: 'done',
    assignee: 'Pedro Lima',
    epic: 'Bugs',
  },
];

const mockCeremonies: Ceremony[] = [
  {
    id: '1',
    name: 'Daily Standup',
    nextDate: '2024-01-16T09:00:00',
    duration: '15 min',
    participants: 4,
    status: 'scheduled',
  },
  {
    id: '2',
    name: 'Sprint Review',
    nextDate: '2024-01-29T14:00:00',
    duration: '2 horas',
    participants: 8,
    status: 'scheduled',
  },
  {
    id: '3',
    name: 'Retrospectiva',
    nextDate: '2024-01-29T16:00:00',
    duration: '1 hora',
    participants: 4,
    status: 'scheduled',
  },
];

export function useScrum() {
  const queryClient = useQueryClient();
  const [localBacklog, setLocalBacklog] = useState<BacklogItem[]>(mockBacklog);
  const [localSprints, setLocalSprints] = useState<Sprint[]>(mockSprints);
  const [localCeremonies, setLocalCeremonies] = useState<Ceremony[]>(mockCeremonies);

  // Queries
  const { data: sprints = localSprints } = useQuery({
    queryKey: ['sprints'],
    queryFn: async () => localSprints,
    initialData: localSprints,
  });

  const { data: backlogItems = localBacklog } = useQuery({
    queryKey: ['backlog'],
    queryFn: async () => localBacklog,
    initialData: localBacklog,
  });

  const { data: ceremonies = localCeremonies } = useQuery({
    queryKey: ['ceremonies'],
    queryFn: async () => localCeremonies,
    initialData: localCeremonies,
  });

  // Mutations
  const createBacklogItem = useMutation({
    mutationFn: async (newItem: Omit<BacklogItem, 'id'>) => {
      const item = { ...newItem, id: Date.now().toString() };
      setLocalBacklog(prev => [...prev, item]);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item criado com sucesso');
    },
  });

  const updateBacklogItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BacklogItem> }) => {
      setLocalBacklog(prev =>
        prev.map(item => (item.id === id ? { ...item, ...data } : item))
      );
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item atualizado');
    },
  });

  const deleteBacklogItem = useMutation({
    mutationFn: async (id: string) => {
      setLocalBacklog(prev => prev.filter(item => item.id !== id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item removido');
    },
  });

  const createSprint = useMutation({
    mutationFn: async (newSprint: Omit<Sprint, 'id'>) => {
      const sprint = { ...newSprint, id: Date.now().toString() };
      setLocalSprints(prev => [...prev, sprint]);
      return sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint criado com sucesso');
    },
  });

  const updateSprint = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Sprint> }) => {
      setLocalSprints(prev =>
        prev.map(sprint => (sprint.id === id ? { ...sprint, ...data } : sprint))
      );
      return { id, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint atualizado');
    },
  });

  const activeSprint = sprints.find(s => s.status === 'active');

  const moveItemToStatus = useCallback(
    (itemId: string, newStatus: BacklogItem['status']) => {
      updateBacklogItem.mutate({ id: itemId, data: { status: newStatus } });
    },
    [updateBacklogItem]
  );

  return {
    sprints,
    activeSprint,
    backlogItems,
    ceremonies,
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    createSprint,
    updateSprint,
    moveItemToStatus,
  };
}
