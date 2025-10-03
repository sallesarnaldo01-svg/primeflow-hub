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
}

export const instagramProvider = new InstagramProvider();
