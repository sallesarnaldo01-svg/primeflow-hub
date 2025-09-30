import { useEffect } from 'react';
import { socketClient } from '@/lib/socket';
import { useAuthStore } from '@/stores/auth';
import { useIntegrationsStore } from '@/stores/integrations';

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = socketClient.connect(token);

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
      // Handle new message
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

    return () => {
      socketClient.disconnect();
    };
  }, [isAuthenticated, token]);

  return {
    connected: socketClient.connected,
    emit: socketClient.emit.bind(socketClient),
    on: socketClient.on.bind(socketClient),
    off: socketClient.off.bind(socketClient),
  };
}
