import { ConnectionType } from '@primeflow/shared/types';

export interface MessageContent {
  text?: string;
  image?: { url: string; caption?: string };
  audio?: { url: string; ptt?: boolean };
  video?: { url: string; caption?: string };
  document?: { url: string; filename?: string };
  buttons?: Array<{ id: string; label: string }>;
  list?: {
    title: string;
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
}

export interface SendMessageOptions {
  connectionId: string;
  to: string;
  content: MessageContent;
  metadata?: Record<string, any>;
}

export interface MessageProvider {
  type: ConnectionType;
  
  connect(connectionId: string, config: any): Promise<void>;
  disconnect(connectionId: string): Promise<void>;
  isConnected(connectionId: string): Promise<boolean>;
  
  sendMessage(options: SendMessageOptions): Promise<{ messageId: string }>;
  
  onMessage(callback: (data: {
    connectionId: string;
    from: string;
    content: MessageContent;
    timestamp: Date;
  }) => void): void;
}
