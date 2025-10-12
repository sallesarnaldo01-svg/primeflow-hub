import login from 'facebook-chat-api';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { getOrCreateContact, getOrCreateConversation, saveIncomingMessage } from '../../utils/contact-manager.js';

interface FacebookSession {
  api: any;
  connectionId: string;
}

class FacebookProvider {
  private sessions: Map<string, FacebookSession> = new Map();
  private messageCallbacks: Array<(data: any) => void> = [];

  async connect(connectionId: string, credentials: { email: string; password: string }) {
    try {
      logger.info('Connecting to Facebook', { connectionId });

      return new Promise((resolve, reject) => {
        login({ email: credentials.email, password: credentials.password }, async (err, api) => {
          if (err) {
            logger.error('Facebook login error', { error: err });
            await prisma.connection.update({
              where: { id: connectionId },
              data: { status: 'ERROR', meta: { error: err.message } }
            });
            return reject(err);
          }

          // Store session
          this.sessions.set(connectionId, { api, connectionId });

          // Update connection status
          await prisma.connection.update({
            where: { id: connectionId },
            data: { status: 'CONNECTED', connectedAt: new Date() }
          });

          // Get user pages
          api.getThreadList(20, null, [], (err: any, threads: any[]) => {
            if (!err && threads) {
              const pages = threads.map((t: any) => ({
                id: t.threadID,
                name: t.name,
                type: t.isGroup ? 'group' : 'user'
              }));
              redis.set(`facebook:${connectionId}:pages`, JSON.stringify(pages));
            }
          });

          // Listen for messages
          api.listenMqtt(async (err: any, message: any) => {
            if (err) {
              logger.error('Facebook listen error', { error: err, connectionId });
              return;
            }

            try {
              if (message.type === 'message' && !message.isGroup) {
                const connectionData = await prisma.connection.findUnique({
                  where: { id: connectionId },
                  select: { tenantId: true }
                });

                if (!connectionData) return;

                const senderId = message.senderID;
                const messageText = message.body || '';

                // Create or get contact
                const contact = await getOrCreateContact(
                  connectionData.tenantId,
                  senderId,
                  `Facebook User ${senderId}`,
                  'facebook'
                );

                // Create or get conversation
                const conversation = await getOrCreateConversation(
                  contact.id,
                  'facebook',
                  connectionId
                );

                // Save message
                await saveIncomingMessage(
                  conversation.id,
                  messageText,
                  'TEXT',
                  {
                    messageId: message.messageID,
                    threadId: message.threadID,
                    timestamp: message.timestamp
                  }
                );

                // Trigger callbacks
                this.messageCallbacks.forEach(cb => cb({
                  connectionId,
                  from: senderId,
                  content: { text: messageText },
                  timestamp: new Date(message.timestamp)
                }));

                logger.info('Facebook message processed', {
                  conversationId: conversation.id,
                  from: senderId
                });
              }
            } catch (error) {
              logger.error('Error processing Facebook message', { error });
            }
          });

          logger.info('✅ Facebook connected', { connectionId });
          resolve(api);
        });
      });
    } catch (error) {
      logger.error('Facebook connection failed', { error, connectionId });
      throw error;
    }
  }

  async sendMessage(connectionId: string, recipientId: string, message: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Facebook session not found');
    }

    return new Promise((resolve, reject) => {
      session.api.sendMessage(message, recipientId, (err: any, messageInfo: any) => {
        if (err) {
          logger.error('Failed to send Facebook message', { error: err });
          return reject(err);
        }
        resolve(messageInfo);
      });
    });
  }

  async disconnect(connectionId: string) {
    const session = this.sessions.get(connectionId);
    if (session) {
      try {
        session.api.logout();
        this.sessions.delete(connectionId);
        
        await prisma.connection.update({
          where: { id: connectionId },
          data: { status: 'DISCONNECTED' }
        });

        logger.info('Facebook disconnected', { connectionId });
      } catch (error) {
        logger.error('Error disconnecting Facebook', { error });
      }
    }
  }

  isConnected(connectionId: string): boolean {
    return this.sessions.has(connectionId);
  }

  onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }
}

export const facebookProvider = new FacebookProvider();
