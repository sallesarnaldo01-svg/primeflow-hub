import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AISettings } from '@/types/ai';

interface AISettingsState {
  settings: AISettings;
  loading: boolean;

  // Actions
  updateSettings: (settings: Partial<AISettings>) => void;
  updateStyle: (style: Partial<AISettings['style']>) => void;
  updateContext: (context: Partial<AISettings['context']>) => void;
  updateCapabilities: (capabilities: Partial<AISettings['capabilities']>) => void;
  updateObjections: (objections: Partial<AISettings['objections']>) => void;
  setLoading: (loading: boolean) => void;
  toggleActive: () => void;
}

const defaultSettings: AISettings = {
  style: {
    formality: 'neutral',
    empathy: 5,
    persona: '',
  },
  context: {
    topics: [],
    prohibitedTerms: [],
    knowledgeBase: '',
    faqDocuments: [],
  },
  capabilities: {
    understandImages: true,
    sendImages: false,
    transcribeAudio: true,
    detectEmotions: true,
  },
  objections: {
    enabled: false,
    playbook: [],
  },
  active: false,
};

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      loading: false,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateStyle: (style) =>
        set((state) => ({
          settings: {
            ...state.settings,
            style: { ...state.settings.style, ...style },
          },
        })),

      updateContext: (context) =>
        set((state) => ({
          settings: {
            ...state.settings,
            context: { ...state.settings.context, ...context },
          },
        })),

      updateCapabilities: (capabilities) =>
        set((state) => ({
          settings: {
            ...state.settings,
            capabilities: { ...state.settings.capabilities, ...capabilities },
          },
        })),

      updateObjections: (objections) =>
        set((state) => ({
          settings: {
            ...state.settings,
            objections: { ...state.settings.objections, ...objections },
          },
        })),

      setLoading: (loading) => set({ loading }),

      toggleActive: () =>
        set((state) => ({
          settings: { ...state.settings, active: !state.settings.active },
        })),
    }),
    {
      name: 'primezap-ai-settings',
    }
  )
);
