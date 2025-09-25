import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Função para inicializar o MSW apenas em desenvolvimento
export const startMockWorker = async () => {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('[MSW] Mock worker started');
    } catch (error) {
      console.error('[MSW] Failed to start mock worker:', error);
    }
  }
};