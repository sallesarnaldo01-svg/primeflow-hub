import { useEffect } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth';
import { useIntegrationsStore } from '@/stores/integrations';

export function useSocket() {
  const { session, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !session?.access_token) return;

    const socket = socketClient.connect(session.access_token);

    // Integration updates
    socket.on('integrations:updated', (data: any) => {
      console.log('[Socket] Integration updated:', data);
      useIntegrationsStore.getState().updateIntegration(data.id, data);
    });

    // Conversation events
    socket.on('conversation:created', (data: any) => {
      console.log('[Socket] Conversation created:', data);
      // Handle new conversation
    });

    socket.on('message:new', (data: any) => {
      console.log('[Socket] New message:', data);
      
      // Show notification
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      
      // Toast notification
      import('sonner').then(({ toast }) => {
        toast.info(`Nova mensagem de ${data.contactName}`, {
          duration: 5000,
          action: {
            label: 'Ver',
            onClick: () => {
              window.location.href = `/conversas?id=${data.conversationId}`;
            }
          }
        });
      });
    });

    socket.on('message:sent', (data: any) => {
      console.log('[Socket] Message sent:', data);
    });

    // Workflow events
    socket.on('workflow:published', (data: any) => {
      console.log('[Socket] Workflow published:', data);
      // Handle workflow published
    });

    // Contact sync progress
    socket.on('contacts:sync:progress', (data: any) => {
      console.log('[Socket] Contact sync progress:', data);
      // Handle sync progress
    });

    // Broadcast progress events
    socket.on('broadcast:progress', (data: any) => {
      console.log('[Socket] Broadcast progress:', data);
      const { sent, failed, total, percentage } = data;
      
      import('sonner').then(({ toast }) => {
        toast.info(`Disparo: ${sent}/${total} enviadas (${percentage}%)`, {
          duration: 3000
        });
      });
    });

    socket.on('broadcast:completed', (data: any) => {
      console.log('[Socket] Broadcast completed:', data);
      
      import('sonner').then(({ toast }) => {
        toast.success(`Disparo concluído! ${data.sent} enviadas, ${data.failed} falharam.`, {
          duration: 5000
        });
      });
    });

    // New realtime events
    socket.on('message:received', (data: any) => {
      console.log('[Socket] Message received:', data);
      
      // Show notification
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
      
      import('sonner').then(({ toast }) => {
        toast.info(`Nova mensagem de ${data.contactName}`, {
          duration: 5000,
          action: {
            label: 'Ver',
            onClick: () => {
              window.location.href = `/conversas?id=${data.conversationId}`;
            }
          }
        });
      });
    });

    socket.on('conversation:updated', (data: any) => {
      console.log('[Socket] Conversation updated:', data);
    });

    socket.on('deal:moved', (data: any) => {
      console.log('[Socket] Deal moved:', data);
      
      import('sonner').then(({ toast }) => {
        toast.info(`Deal movido para ${data.stage}`, {
          duration: 3000
        });
      });
    });

    socket.on('agent:assigned', (data: any) => {
      console.log('[Socket] Agent assigned:', data);
      
      import('sonner').then(({ toast }) => {
        toast.info('Agente atribuído', {
          duration: 3000
        });
      });
    });

    socket.on('workflow:completed', (data: any) => {
      console.log('[Socket] Workflow completed:', data);
      
      import('sonner').then(({ toast }) => {
        toast.success(`Workflow "${data.workflowName}" concluído!`, {
          duration: 5000
        });
      });
    });

    socket.on('workflow:progress', (data: any) => {
      console.log('[Socket] Workflow progress:', data);
    });

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, session]);

  return {
    connected: socketClient.connected,
    emit: socketClient.emit.bind(socketClient),
    on: socketClient.on.bind(socketClient),
    off: socketClient.off.bind(socketClient),
  };
}
