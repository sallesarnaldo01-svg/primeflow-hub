import login from 'facebook-chat-api';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';

interface FacebookSession {
  api: any;
  connectionId: string;
}

class FacebookProvider {
  private sessions: Map<string, FacebookSession> = new Map();

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
            data: { status: 'CONNECTED' }
          });

          // Get user pages
          api.getThreadList(20, null, [], (err: any, threads: any[]) => {
            if (!err && threads) {
              const pages = threads.map(t => ({
                id: t.threadID,
                name: t.name,
                type: t.isGroup ? 'group' : 'user'
              }));
              redis.set(`facebook:${connectionId}:pages`, JSON.stringify(pages));
            }
          });

          // Listen for messages
          api.listenMqtt((err: any, message: any) => {
            if (err) return;
            this.handleIncomingMessage(connectionId, message);
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

  private async handleIncomingMessage(connectionId: string, message: any) {
    try {
      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
        include: { tenant: true }
      });

      if (!connection) return;

      // Log message
      await prisma.messageLog.create({
        data: {
          tenantId: connection.tenantId,
          channel: 'FACEBOOK',
          direction: 'IN',
          contact: message.senderID,
          payload: {
            messageId: message.messageID,
            threadId: message.threadID,
            body: message.body,
            attachments: message.attachments
          }
        }
      });

      logger.info('Facebook message received', { 
        connectionId, 
        from: message.senderID 
      });
    } catch (error) {
      logger.error('Error handling Facebook message', { error });
    }
  }

  isConnected(connectionId: string): boolean {
    return this.sessions.has(connectionId);
  }
}

export const facebookProvider = new FacebookProvider();
