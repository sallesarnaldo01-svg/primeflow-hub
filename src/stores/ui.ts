import { create } from 'zustand';

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  
  // Modals
  modals: Record<string, boolean>;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (loading: boolean, message?: string) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  isLoading: false,
  loadingMessage: undefined,
  modals: {},

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  
  setLoading: (isLoading, loadingMessage) => 
    set({ isLoading, loadingMessage }),

  openModal: (modalId) => 
    set((state) => ({ 
      modals: { ...state.modals, [modalId]: true } 
    })),

  closeModal: (modalId) => 
    set((state) => ({ 
      modals: { ...state.modals, [modalId]: false } 
    })),

  toggleModal: (modalId) => {
    const { modals } = get();
    set({ 
      modals: { ...modals, [modalId]: !modals[modalId] } 
    });
  },
}));