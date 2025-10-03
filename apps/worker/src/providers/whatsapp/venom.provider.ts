import venom, { Whatsapp, Message } from 'venom-bot';
import { MessageProvider, SendMessageOptions, MessageContent } from '../message.provider.js';
import { ConnectionType } from '@primeflow/shared/types';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { EventEmitter } from 'events';

export class VenomProvider implements MessageProvider {
  type = ConnectionType.WHATSAPP;
  private clients = new Map<string, Whatsapp>();
  private messageCallbacks: Array<Function> = [];
  private qrEmitter = new EventEmitter();

  async connect(connectionId: string, config: any): Promise<void> {
    if (this.clients.has(connectionId)) {
      logger.warn('Venom connection already exists', { connectionId });
      return;
    }

    try {
      logger.info('Starting Venom connection', { connectionId });

      const client = await venom.create(
        connectionId,
        (base64Qr) => {
          logger.info('QR Code generated', { connectionId });
          this.qrEmitter.emit(`qr:${connectionId}`, base64Qr);
          
          // Update connection with QR code
          prisma.connection.update({
            where: { id: connectionId },
            data: {
              status: 'CONNECTING',
              meta: { qrCode: base64Qr }
            }
          }).catch(err => logger.error('Failed to update QR', { error: err }));
        },
        (statusSession) => {
          logger.info('Session status', { connectionId, status: statusSession });
        },
        {
          headless: true,
          useChrome: false,
          debug: false,
          logQR: false,
          browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ],
          autoClose: 60000,
          disableSpins: true,
        }
      );

      // Connection established
      await prisma.connection.update({
        where: { id: connectionId },
        data: {
          status: 'CONNECTED',
          meta: { 
            phone: client.getHostDevice()?.id?.user,
            device: client.getHostDevice()?.platform 
          }
        }
      });

      logger.info('Venom WhatsApp connected', { connectionId });

      // Listen for incoming messages
      client.onMessage((message: Message) => {
        if (message.isGroupMsg) return;
        if (message.fromMe) return;

        const content: MessageContent = {};

        if (message.type === 'chat') {
          content.text = message.body;
        } else if (message.type === 'image') {
          content.image = {
            url: message.body,
            caption: message.caption
          };
        } else if (message.type === 'audio' || message.type === 'ptt') {
          content.audio = {
            url: message.body,
            ptt: message.type === 'ptt'
          };
        } else if (message.type === 'video') {
          content.video = {
            url: message.body,
            caption: message.caption
          };
        } else if (message.type === 'document') {
          content.document = {
            url: message.body,
            filename: message.filename
          };
        }

        this.messageCallbacks.forEach(cb => cb({
          connectionId,
          from: message.from,
          content,
          timestamp: new Date(message.timestamp * 1000)
        }));
      });

      this.clients.set(connectionId, client);
    } catch (error) {
      logger.error('Failed to connect Venom', { connectionId, error });
      
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'ERROR' }
      }).catch(() => {});
      
      throw error;
    }
  }

  async disconnect(connectionId: string): Promise<void> {
    const client = this.clients.get(connectionId);
    if (client) {
      await client.close();
      this.clients.delete(connectionId);
      
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'DISCONNECTED' }
      });
      
      logger.info('Venom WhatsApp disconnected', { connectionId });
    }
  }

  async isConnected(connectionId: string): Promise<boolean> {
    const client = this.clients.get(connectionId);
    if (!client) return false;
    
    try {
      const state = await client.getConnectionState();
      return state === 'CONNECTED';
    } catch {
      return false;
    }
  }

  async sendMessage(options: SendMessageOptions): Promise<{ messageId: string }> {
    const client = this.clients.get(options.connectionId);
    
    if (!client) {
      throw new Error('Connection not found');
    }

    const phone = options.to.replace(/\D/g, '');
    const chatId = phone.includes('@') ? phone : `${phone}@c.us`;

    let result;

    try {
      if (options.content.text) {
        result = await client.sendText(chatId, options.content.text);
      } else if (options.content.image) {
        result = await client.sendImage(
          chatId,
          options.content.image.url,
          'image',
          options.content.image.caption || ''
        );
      } else if (options.content.audio) {
        result = await client.sendVoice(chatId, options.content.audio.url);
      } else if (options.content.video) {
        result = await client.sendVideoAsGif(
          chatId,
          options.content.video.url,
          'video',
          options.content.video.caption || ''
        );
      } else if (options.content.document) {
        result = await client.sendFile(
          chatId,
          options.content.document.url,
          options.content.document.filename || 'document',
          ''
        );
      } else if (options.content.buttons) {
        result = await client.sendText(
          chatId,
          options.content.text || 'Escolha uma opção:'
        );
      } else {
        throw new Error('No content to send');
      }

      logger.info('Message sent via Venom', { connectionId: options.connectionId, to: chatId });
      
      return { messageId: result.id };
    } catch (error) {
      logger.error('Failed to send message', { error, connectionId: options.connectionId });
      throw error;
    }
  }

  onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  onQRCode(connectionId: string, callback: (qr: string) => void): void {
    this.qrEmitter.on(`qr:${connectionId}`, callback);
  }

  removeQRListener(connectionId: string): void {
    this.qrEmitter.removeAllListeners(`qr:${connectionId}`);
  }
}

export const venomProvider = new VenomProvider();
