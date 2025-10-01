export enum ConnectionType {
  WHATSAPP = 'WHATSAPP',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM'
}

export enum MessageDirection {
  IN = 'IN',
  OUT = 'OUT'
}

export interface MessagePayload {
  id?: string;
  channel: ConnectionType;
  contact: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'document';
  metadata?: Record<string, any>;
}

export interface IncomingMessage {
  id: string;
  channel: ConnectionType;
  from: string;
  content: string;
  mediaUrl?: string;
  timestamp: Date;
}
