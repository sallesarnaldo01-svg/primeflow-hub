import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { scrumService } from '@/services/scrum';
import type { BacklogItem, Sprint, Ceremony } from '@/services/scrum';

export type { BacklogItem, Sprint, Ceremony };

export function useScrum() {
  const queryClient = useQueryClient();

  // Queries - conectado à API real
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints'],
    queryFn: () => scrumService.listSprints()
  });

  const { data: backlogItems = [] } = useQuery({
    queryKey: ['backlog'],
    queryFn: () => scrumService.listBacklog()
  });

  const { data: ceremonies = [] } = useQuery({
    queryKey: ['ceremonies'],
    queryFn: () => scrumService.listCeremonies()
  });

  // Mutations - conectado à API real
  const createBacklogItem = useMutation({
    mutationFn: (newItem: Omit<BacklogItem, 'id'>) => scrumService.createBacklogItem(newItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item criado com sucesso');
    }
  });

  const updateBacklogItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BacklogItem> }) => 
      scrumService.updateBacklogItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item atualizado');
    }
  });

  const deleteBacklogItem = useMutation({
    mutationFn: (id: string) => scrumService.deleteBacklogItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog'] });
      toast.success('Item removido');
    }
  });

  const createSprint = useMutation({
    mutationFn: (newSprint: Omit<Sprint, 'id' | 'completedStoryPoints'>) => 
      scrumService.createSprint(newSprint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint criado com sucesso');
    }
  });

  const updateSprint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sprint> }) => 
      scrumService.updateSprint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast.success('Sprint atualizado');
    }
  });

  const activeSprint = sprints.find(s => s.status === 'ACTIVE');

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
