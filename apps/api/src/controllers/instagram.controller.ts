import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { emitToTenant } from '../lib/socket.js';
import { AppError } from '../middleware/error.js';

class InstagramController {
  async initiateConnection(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { name, username, password } = req.body;

    const connection = await prisma.connection.create({
      data: {
        tenantId,
        type: 'INSTAGRAM',
        name: name || 'Instagram',
        status: 'DISCONNECTED',
        meta: {
          username,
          password: Buffer.from(password).toString('base64')
        }
      }
    });

    // Publish to worker
    await redis.publish('instagram:connect', JSON.stringify({
      connectionId: connection.id,
      username,
      password
    }));

    res.status(201).json(connection);
  }

  async getAccounts(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'INSTAGRAM' }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    const accountsData = await redis.get(`instagram:${connectionId}:accounts`);
    const accounts = accountsData ? JSON.parse(accountsData) : [];

    res.json({ accounts });
  }

  async sendBulkMessages(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;
    const { recipients, message, delay, jitter } = req.body;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'INSTAGRAM', status: 'CONNECTED' }
    });

    if (!connection) {
      throw new AppError('Instagram not connected', 400);
    }

    const broadcast = await prisma.broadcast.create({
      data: {
        tenantId,
        name: `Instagram Bulk - ${new Date().toLocaleString()}`,
        filters: { recipients },
        script: { message },
        status: 'RUNNING',
        config: {
          channel: 'instagram',
          connectionId,
          delay: delay || 3000,
          jitter: jitter || 0.15
        }
      }
    });

    await redis.publish('broadcast:mass', JSON.stringify({
      broadcastId: broadcast.id,
      channel: 'instagram',
      connectionId,
      recipients,
      message,
      delay: delay || 3000,
      jitter: jitter || 0.15
    }));

    emitToTenant(tenantId, 'broadcast:started', broadcast);
    res.status(201).json(broadcast);
  }

  async disconnect(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;

    await prisma.connection.update({
      where: { id: connectionId, tenantId },
      data: { status: 'DISCONNECTED' }
    });

    await redis.publish('instagram:disconnect', JSON.stringify({ connectionId }));

    emitToTenant(tenantId, 'connection:status', {
      connectionId,
      type: 'instagram',
      status: 'disconnected'
    });

    res.json({ message: 'Disconnected successfully' });
  }

  async getStatus(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'INSTAGRAM' }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    res.json(connection);
  }
}

export const instagramController = new InstagramController();
