import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Integration } from '@/types/integrations';

interface IntegrationsState {
  integrations: Integration[];
  loading: boolean;
  error: string | null;

  // Actions
  setIntegrations: (integrations: Integration[]) => void;
  updateIntegration: (id: string, data: Partial<Integration>) => void;
  addIntegration: (integration: Integration) => void;
  removeIntegration: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useIntegrationsStore = create<IntegrationsState>()(
  persist(
    (set) => ({
      integrations: [],
      loading: false,
      error: null,

      setIntegrations: (integrations) => set({ integrations }),
      
      updateIntegration: (id, data) =>
        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.id === id ? { ...integration, ...data } : integration
          ),
        })),

      addIntegration: (integration) =>
        set((state) => ({
          integrations: [...state.integrations, integration],
        })),

      removeIntegration: (id) =>
        set((state) => ({
          integrations: state.integrations.filter((i) => i.id !== id),
        })),

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'primezap-integrations',
    }
  )
);
