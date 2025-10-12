import { IgApiClient } from 'instagram-private-api';
import { logger } from '../../lib/logger.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';

interface InstagramSession {
  client: IgApiClient;
  connectionId: string;
  username: string;
}

class InstagramProvider {
  private sessions: Map<string, InstagramSession> = new Map();

  async connect(connectionId: string, credentials: { username: string; password: string }) {
    try {
      logger.info('Connecting to Instagram', { connectionId, username: credentials.username });

      const ig = new IgApiClient();
      ig.state.generateDevice(credentials.username);

      // Login
      await ig.account.login(credentials.username, credentials.password);

      // Store session
      this.sessions.set(connectionId, {
        client: ig,
        connectionId,
        username: credentials.username
      });

      // Update connection status
      await prisma.connection.update({
        where: { id: connectionId },
        data: { 
          status: 'CONNECTED',
          meta: {
            username: credentials.username,
            userId: ig.state.cookieUserId
          }
        }
      });

      // Get account info
      const accountInfo = await ig.account.currentUser();
      await redis.set(`instagram:${connectionId}:accounts`, JSON.stringify([{
        id: accountInfo.pk,
        username: accountInfo.username,
        fullName: accountInfo.full_name,
        profilePicUrl: accountInfo.profile_pic_url
      }]));

      logger.info('✅ Instagram connected', { connectionId, username: credentials.username });

      return ig;
    } catch (error: any) {
      logger.error('Instagram connection failed', { error: error.message, connectionId });
      
      await prisma.connection.update({
        where: { id: connectionId },
        data: { 
          status: 'ERROR',
          meta: { error: error.message }
        }
      });

      throw error;
    }
  }

  async sendDirectMessage(connectionId: string, recipientUsername: string, message: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Instagram session not found');
    }

    try {
      // Get user ID from username
      const userId = await session.client.user.getIdByUsername(recipientUsername);
      
      // Send direct message
      const thread = session.client.entity.directThread([userId.toString()]);
      await thread.broadcastText(message);

      logger.info('Instagram DM sent', { connectionId, to: recipientUsername });

      return { success: true };
    } catch (error: any) {
      logger.error('Failed to send Instagram DM', { error: error.message });
      throw error;
    }
  }

  async disconnect(connectionId: string) {
    const session = this.sessions.get(connectionId);
    if (session) {
      try {
        this.sessions.delete(connectionId);
        
        await prisma.connection.update({
          where: { id: connectionId },
          data: { status: 'DISCONNECTED' }
        });

        logger.info('Instagram disconnected', { connectionId });
      } catch (error) {
        logger.error('Error disconnecting Instagram', { error });
      }
    }
  }

  isConnected(connectionId: string): boolean {
    return this.sessions.has(connectionId);
  }

  onMessage(callback: (data: any) => void): void {
    this.messageCallbacks.push(callback);
  }

  private startMessagePolling(connectionId: string): void {
    const session = this.sessions.get(connectionId);
    if (!session) return;

    // Poll every 10 seconds for new messages
    const interval = setInterval(async () => {
      try {
        const inbox = await session.client.feed.directInbox().items();
        
        // Process only unread threads
        for (const thread of inbox) {
          if (thread.items && thread.items.length > 0) {
            const lastMessage = thread.items[0];
            
            // Skip if message is from us
            if (lastMessage.user_id === session.client.state.cookieUserId) continue;

            const connectionData = await prisma.connection.findUnique({
              where: { id: connectionId },
              select: { tenantId: true }
            });

            if (!connectionData) continue;

            const senderId = lastMessage.user_id.toString();
            const messageText = lastMessage.text || '';

            // Create or get contact
            const contact = await getOrCreateContact(
              connectionData.tenantId,
              senderId,
              thread.thread_title || `Instagram User ${senderId}`,
              'instagram'
            );

            // Create or get conversation
            const conversation = await getOrCreateConversation(
              contact.id,
              'instagram',
              connectionId
            );

            // Check if message already exists to avoid duplicates
            const existingMessage = await prisma.message.findFirst({
              where: {
                conversationId: conversation.id,
                metadata: {
                  path: ['messageId'],
                  equals: lastMessage.item_id
                }
              }
            });

            if (!existingMessage) {
              // Save message
              await saveIncomingMessage(
                conversation.id,
                messageText,
                'TEXT',
                {
                  messageId: lastMessage.item_id,
                  threadId: thread.thread_id,
                  timestamp: lastMessage.timestamp
                }
              );

              // Trigger callbacks
              this.messageCallbacks.forEach(cb => cb({
                connectionId,
                from: senderId,
                content: { text: messageText },
                timestamp: new Date(lastMessage.timestamp / 1000)
              }));

              logger.info('Instagram message processed', {
                conversationId: conversation.id,
                from: senderId
              });
            }
          }
        }
      } catch (error) {
        logger.error('Error polling Instagram messages', { error, connectionId });
      }
    }, 10000);

    this.pollingIntervals.set(connectionId, interval);
  }

  async disconnect(connectionId: string): Promise<void> {
    // Clear polling interval
    const interval = this.pollingIntervals.get(connectionId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(connectionId);
    }

    this.sessions.delete(connectionId);

    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' }
    });

    logger.info('Instagram disconnected', { connectionId });
  }
}

export const instagramProvider = new InstagramProvider();
