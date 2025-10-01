import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  WASocket 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { MessageProvider, SendMessageOptions, MessageContent } from '../message.provider.js';
import { ConnectionType } from '@primeflow/shared/types';
import { logger } from '../../lib/logger.js';

export class BaileysProvider implements MessageProvider {
  type = ConnectionType.WHATSAPP;
  private sockets = new Map<string, WASocket>();
  private messageCallbacks: Array<Function> = [];

  async connect(connectionId: string, config: any): Promise<void> {
    if (this.sockets.has(connectionId)) {
      logger.warn('Connection already exists', { connectionId });
      return;
    }

    try {
      const { state, saveCreds } = await useMultiFileAuthState(`./.wwebjs_auth/${connectionId}`);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
      });

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          logger.info('Connection closed', { connectionId, shouldReconnect });
          
          if (shouldReconnect) {
            this.connect(connectionId, config);
          } else {
            this.sockets.delete(connectionId);
          }
        } else if (connection === 'open') {
          logger.info('WhatsApp connected', { connectionId });
        }
      });

      sock.ev.on('messages.upsert', ({ messages }) => {
        for (const msg of messages) {
          if (msg.key.fromMe) continue;

          const content: MessageContent = {};
          
          if (msg.message?.conversation) {
            content.text = msg.message.conversation;
          } else if (msg.message?.extendedTextMessage) {
            content.text = msg.message.extendedTextMessage.text;
          } else if (msg.message?.imageMessage) {
            content.image = {
              url: '', // Download URL
              caption: msg.message.imageMessage.caption
            };
          }

          this.messageCallbacks.forEach(cb => cb({
            connectionId,
            from: msg.key.remoteJid!,
            content,
            timestamp: new Date(msg.messageTimestamp! * 1000)
          }));
        }
      });

      this.sockets.set(connectionId, sock);
    } catch (error) {
      logger.error('Failed to connect Baileys', { connectionId, error });
      throw error;
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const sock = this.sockets.get(connectionId);
    if (sock) {
      await sock.logout();
      this.sockets.delete(connectionId);
      logger.info('WhatsApp disconnected', { connectionId });
    }
  }

  async isConnected(connectionId: string): Promise<boolean> {
    return this.sockets.has(connectionId);
  }

  async sendMessage(options: SendMessageOptions): Promise<{ messageId: string }> {
    const sock = this.sockets.get(options.connectionId);
    
    if (!sock) {
      throw new Error('Connection not found');
    }

    const jid = options.to.includes('@') ? options.to : `${options.to}@s.whatsapp.net`;
    let result;

    if (options.content.text) {
      result = await sock.sendMessage(jid, { text: options.content.text });
    } else if (options.content.image) {
      result = await sock.sendMessage(jid, {
        image: { url: options.content.image.url },
        caption: options.content.image.caption
      });
    } else if (options.content.audio) {
      result = await sock.sendMessage(jid, {
        audio: { url: options.content.audio.url },
        ptt: options.content.audio.ptt
      });
    } else if (options.content.video) {
      result = await sock.sendMessage(jid, {
        video: { url: options.content.video.url },
        caption: options.content.video.caption
      });
    } else if (options.content.document) {
      result = await sock.sendMessage(jid, {
        document: { url: options.content.document.url },
        fileName: options.content.document.filename
      });
    } else {
      throw new Error('No content to send');
    }

    return { messageId: result!.key.id! };
  }

  onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }
}

export const baileysProvider = new BaileysProvider();
