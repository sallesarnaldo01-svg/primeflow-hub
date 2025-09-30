import { create } from 'zustand';
import { Workflow, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { produce } from 'immer';

interface WorkflowsState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  history: Workflow[];
  historyIndex: number;
  loading: boolean;

  // Actions
  setWorkflows: (workflows: Workflow[]) => void;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: WorkflowEdge) => void;
  deleteEdge: (id: string) => void;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkflowsStore = create<WorkflowsState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  history: [],
  historyIndex: -1,
  loading: false,

  setWorkflows: (workflows) => set({ workflows }),

  setCurrentWorkflow: (workflow) => 
    set({ 
      currentWorkflow: workflow,
      history: workflow ? [workflow] : [],
      historyIndex: workflow ? 0 : -1,
    }),

  addNode: (node) =>
    set(
      produce((state) => {
        if (state.currentWorkflow) {
          state.currentWorkflow.nodes.push(node);
          get().saveToHistory();
        }
      })
    ),

  updateNode: (id, data) =>
    set(
      produce((state) => {
        if (state.currentWorkflow) {
          const nodeIndex = state.currentWorkflow.nodes.findIndex((n: WorkflowNode) => n.id === id);
          if (nodeIndex !== -1) {
            state.currentWorkflow.nodes[nodeIndex] = {
              ...state.currentWorkflow.nodes[nodeIndex],
              ...data,
            };
          }
        }
      })
    ),

  deleteNode: (id) =>
    set(
      produce((state) => {
        if (state.currentWorkflow) {
          state.currentWorkflow.nodes = state.currentWorkflow.nodes.filter(
            (n: WorkflowNode) => n.id !== id
          );
          state.currentWorkflow.edges = state.currentWorkflow.edges.filter(
            (e: WorkflowEdge) => e.source !== id && e.target !== id
          );
          get().saveToHistory();
        }
      })
    ),

  addEdge: (edge) =>
    set(
      produce((state) => {
        if (state.currentWorkflow) {
          state.currentWorkflow.edges.push(edge);
          get().saveToHistory();
        }
      })
    ),

  deleteEdge: (id) =>
    set(
      produce((state) => {
        if (state.currentWorkflow) {
          state.currentWorkflow.edges = state.currentWorkflow.edges.filter(
            (e: WorkflowEdge) => e.id !== id
          );
          get().saveToHistory();
        }
      })
    ),

  saveToHistory: () =>
    set((state) => {
      if (!state.currentWorkflow) return state;

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ ...state.currentWorkflow });

      return {
        history: newHistory.slice(-20), // Keep last 20 states
        historyIndex: Math.min(newHistory.length - 1, 19),
      };
    }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          historyIndex: state.historyIndex - 1,
          currentWorkflow: state.history[state.historyIndex - 1],
        };
      }
      return state;
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          historyIndex: state.historyIndex + 1,
          currentWorkflow: state.history[state.historyIndex + 1],
        };
      }
      return state;
    }),

  setLoading: (loading) => set({ loading }),
}));
