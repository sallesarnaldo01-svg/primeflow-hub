import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  WASocket 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { MessageProvider, SendMessageOptions, MessageContent } from '../message.provider.js';
import { ConnectionType } from '@primeflow/shared/types';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { getOrCreateContact, getOrCreateConversation, saveIncomingMessage } from '../../utils/contact-manager.js';

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

      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          logger.info('QR Code received', { connectionId });
          
          // Save QR to Redis with 60s expiration
          await redis.set(`qr:${connectionId}`, qr, 'EX', 60);
          
          // Update connection with QR code
          await prisma.connection.update({
            where: { id: connectionId },
            data: { 
              status: 'CONNECTING',
              meta: { qrCode: qr }
            }
          });
        }
        
        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          logger.info('Connection closed', { connectionId, shouldReconnect });
          
          if (shouldReconnect) {
            setTimeout(() => this.connect(connectionId, config), 3000);
          } else {
            await prisma.connection.update({
              where: { id: connectionId },
              data: { status: 'DISCONNECTED' }
            });
            this.sockets.delete(connectionId);
          }
        } else if (connection === 'open') {
          logger.info('WhatsApp connected', { connectionId });
          
          const phone = sock.user?.id.split(':')[0];
          await prisma.connection.update({
            where: { id: connectionId },
            data: { 
              status: 'CONNECTED',
              connectedAt: new Date(),
              meta: { 
                phone, 
                device: 'Baileys',
                pushName: sock.user?.name
              }
            }
          });
          
          await redis.del(`qr:${connectionId}`);
        }
      });

      sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          if (msg.key.fromMe) continue;

          try {
            const from = msg.key.remoteJid || '';
            const phone = from.split('@')[0];
            
            // Get connection to find tenant
            const connectionData = await prisma.connection.findUnique({
              where: { id: connectionId },
              select: { tenantId: true }
            });

            if (!connectionData) continue;

            // Create or get contact
            const contact = await getOrCreateContact(
              connectionData.tenantId,
              phone,
              msg.pushName || phone,
              'whatsapp'
            );

            // Create or get conversation
            const conversation = await getOrCreateConversation(
              contact.id,
              'whatsapp',
              connectionId
            );

            // Extract message content
            const content = msg.message?.conversation || 
                           msg.message?.extendedTextMessage?.text ||
                           msg.message?.imageMessage?.caption ||
                           '';

            // Save message
            await saveIncomingMessage(
              conversation.id,
              content,
              'TEXT',
              {
                messageId: msg.key.id,
                timestamp: msg.messageTimestamp,
                type: Object.keys(msg.message || {})[0]
              }
            );

            // Trigger callbacks for realtime updates
            const messageContent: MessageContent = {};
            if (msg.message?.conversation || msg.message?.extendedTextMessage) {
              messageContent.text = content;
            }

            this.messageCallbacks.forEach(cb => cb({
              connectionId,
              from: phone,
              content: messageContent,
              timestamp: new Date(msg.messageTimestamp as number * 1000)
            }));

            logger.info('Message processed', { 
              conversationId: conversation.id,
              from: phone
            });
          } catch (error) {
            logger.error('Error processing incoming message', { error });
          }
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
