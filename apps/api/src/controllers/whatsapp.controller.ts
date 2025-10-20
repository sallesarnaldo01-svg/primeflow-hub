import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';
import { emitToTenant } from '../lib/socket.js';
import { redis } from '../lib/redis.js';
import { RateLimiter } from '../lib/rate-limiter.js';

export const whatsappController = {
  async getQRCode(req: Request, res: Response) {
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        tenantId: req.user!.tenantId,
        type: 'WHATSAPP'
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    // Get QR code from connection meta or Redis
    let qrCode = connection.meta?.qrCode;
    
    if (!qrCode) {
      const qrFromRedis = await redis.get(`qr:${connectionId}`);
      qrCode = qrFromRedis;
    }

    if (!qrCode) {
      throw new AppError('QR Code não disponível', 404);
    }

    res.json({
      success: true,
      data: {
        qrCode,
        status: connection.status
      }
    });
  },

  async initiateConnection(req: Request, res: Response) {
    const { name } = req.body;

    // Create connection record
    const connection = await prisma.connection.create({
      data: {
        type: 'WHATSAPP',
        tenantId: req.user!.tenantId,
        status: 'DISCONNECTED',
        meta: { name: name || 'WhatsApp Principal' }
      }
    });

    // Send command to worker to start connection
    await redis.publish('whatsapp:connect', JSON.stringify({
      connectionId: connection.id,
      tenantId: req.user!.tenantId
    }));

    logger.info('WhatsApp connection initiated', { connectionId: connection.id });

    res.status(201).json({
      success: true,
      data: connection,
      message: 'Conexão iniciada. Aguarde o QR Code...'
    });
  },

  async sendBulkMessages(req: Request, res: Response) {
    const { connectionId } = req.params;
    const { contacts, message, delayMs = 1000 } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      throw new AppError('Lista de contatos inválida', 400);
    }

    if (!message || !message.text) {
      throw new AppError('Mensagem é obrigatória', 400);
    }

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        tenantId: req.user!.tenantId,
        type: 'WHATSAPP',
        status: 'CONNECTED'
      }
    });

    if (!connection) {
      throw new AppError('Conexão WhatsApp não encontrada ou não conectada', 404);
    }

    // Check rate limit
    const withinLimit = await RateLimiter.checkLimit(connectionId, 'per_minute');
    if (!withinLimit) {
      throw new AppError('Rate limit exceeded. Please wait before sending more messages.', 429);
    }

    // Check remaining quota
    const remaining = await RateLimiter.getRemaining(connectionId, 'per_hour');
    if (remaining < contacts.length) {
      throw new AppError(
        `Rate limit: Only ${remaining} messages available in current hour window`,
        429
      );
    }

    // Create broadcast record
    const broadcast = await prisma.broadcast.create({
      data: {
        name: `Disparo em massa - ${new Date().toLocaleString('pt-BR')}`,
        tenantId: req.user!.tenantId,
        status: 'RUNNING',
        filters: { contacts },
        script: [{ type: 'message', config: message }],
        config: {
          intervalSec: Math.round(delayMs / 1000),
          signature: { enabled: false }
        },
        stats: {
          queued: contacts.length,
          sent: 0,
          failed: 0,
          progress: 0
        }
      }
    });

    // Enqueue broadcast job
    await redis.publish('broadcast:mass', JSON.stringify({
      broadcastId: broadcast.id,
      connectionId,
      contacts,
      message,
      delayMs
    }));

    logger.info('Bulk messages queued', { 
      broadcastId: broadcast.id, 
      connectionId, 
      contacts: contacts.length 
    });

    emitToTenant(req.user!.tenantId, 'broadcast:started', {
      broadcastId: broadcast.id,
      total: contacts.length
    });

    res.json({
      success: true,
      data: {
        broadcastId: broadcast.id,
        totalContacts: contacts.length,
        estimatedTime: Math.round((contacts.length * delayMs) / 1000)
      },
      message: 'Disparo em massa iniciado'
    });
  },

  async getConnectionStatus(req: Request, res: Response) {
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        tenantId: req.user!.tenantId,
        type: 'WHATSAPP'
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    res.json({
      success: true,
      data: {
        id: connection.id,
        status: connection.status,
        phone: connection.meta?.phone,
        device: connection.meta?.device,
        connectedAt: connection.updatedAt
      }
    });
  },

  async disconnectWhatsApp(req: Request, res: Response) {
    const { connectionId } = req.params;

    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        tenantId: req.user!.tenantId,
        type: 'WHATSAPP'
      }
    });

    if (!connection) {
      throw new AppError('Conexão não encontrada', 404);
    }

    // Send disconnect command to worker
    await redis.publish('whatsapp:disconnect', JSON.stringify({
      connectionId: connection.id
    }));

    await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'DISCONNECTED' }
    });

    logger.info('WhatsApp disconnected', { connectionId });

    res.json({
      success: true,
      message: 'WhatsApp desconectado'
    });
  }
};
