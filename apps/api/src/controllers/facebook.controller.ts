import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { redis } from '../lib/redis.js';
import { emitToTenant } from '../lib/socket.js';
import { AppError } from '../middleware/error.js';

class FacebookController {
  async initiateConnection(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { name, email, password } = req.body;

    const connection = await prisma.connection.create({
      data: {
        tenantId,
        type: 'FACEBOOK',
        name: name || 'Facebook',
        status: 'DISCONNECTED',
        meta: {
          email,
          password: Buffer.from(password).toString('base64') // Basic encoding (use proper encryption in production)
        }
      }
    });

    // Publish to worker to start connection
    await redis.publish('facebook:connect', JSON.stringify({
      connectionId: connection.id,
      email,
      password
    }));

    res.status(201).json(connection);
  }

  async getPages(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'FACEBOOK' }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Get pages from Redis cache (populated by worker)
    const pagesData = await redis.get(`facebook:${connectionId}:pages`);
    const pages = pagesData ? JSON.parse(pagesData) : [];

    res.json({ pages });
  }

  async sendBulkMessages(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;
    const { recipients, message, delay, jitter } = req.body;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'FACEBOOK', status: 'CONNECTED' }
    });

    if (!connection) {
      throw new AppError('Facebook not connected', 400);
    }

    const broadcast = await prisma.broadcast.create({
      data: {
        tenantId,
        name: `Facebook Bulk - ${new Date().toLocaleString()}`,
        filters: { recipients },
        script: { message },
        status: 'RUNNING',
        config: {
          channel: 'facebook',
          connectionId,
          delay: delay || 3000,
          jitter: jitter || 0.15
        }
      }
    });

    // Publish to mass broadcast queue
    await redis.publish('broadcast:mass', JSON.stringify({
      broadcastId: broadcast.id,
      channel: 'facebook',
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

    await redis.publish('facebook:disconnect', JSON.stringify({ connectionId }));

    emitToTenant(tenantId, 'connection:status', {
      connectionId,
      type: 'facebook',
      status: 'disconnected'
    });

    res.json({ message: 'Disconnected successfully' });
  }

  async getStatus(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: { id: connectionId, tenantId, type: 'FACEBOOK' }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    res.json(connection);
  }
}

export const facebookController = new FacebookController();
