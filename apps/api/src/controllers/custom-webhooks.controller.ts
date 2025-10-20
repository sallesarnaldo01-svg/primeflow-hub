import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';
import { redis } from '../lib/redis.js';
import crypto from 'crypto';

export const customWebhooksController = {
  // CRUD Operations
  async list(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { enabled } = req.query;

    const where: any = { tenantId };
    if (enabled !== undefined) {
      where.enabled = enabled === 'true';
    }

    const webhooks = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.webhooks 
      WHERE tenant_id = $1 
      ${enabled !== undefined ? `AND enabled = $2` : ''}
      ORDER BY created_at DESC
    `, tenantId, ...(enabled !== undefined ? [enabled === 'true'] : []));

    res.json({ data: webhooks });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const webhook = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.webhooks 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    res.json({ data: webhook[0] });
  },

  async create(req: Request, res: Response) {
    const tenantId = req.user!.tenantId;
    const { name, url, events, secret, metadata = {} } = req.body;

    if (!name || !url || !events || !Array.isArray(events)) {
      throw new AppError('Name, URL, and events are required', 400);
    }

    // Generate secret if not provided
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.$queryRawUnsafe(`
      INSERT INTO public.webhooks (tenant_id, name, url, secret, events, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, tenantId, name, url, webhookSecret, events, JSON.stringify(metadata));

    logger.info('Webhook created', { webhookId: webhook[0].id });

    res.status(201).json({ 
      data: webhook[0],
      message: 'Webhook created successfully. Save the secret securely!'
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const { name, url, events, enabled, metadata } = req.body;

    const updates: string[] = [];
    const values: any[] = [id, tenantId];
    let paramIndex = 3;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (url !== undefined) {
      updates.push(`url = $${paramIndex++}`);
      values.push(url);
    }
    if (events !== undefined) {
      updates.push(`events = $${paramIndex++}`);
      values.push(events);
    }
    if (enabled !== undefined) {
      updates.push(`enabled = $${paramIndex++}`);
      values.push(enabled);
    }
    if (metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      throw new AppError('No fields to update', 400);
    }

    const webhook = await prisma.$queryRawUnsafe(`
      UPDATE public.webhooks 
      SET ${updates.join(', ')}
      WHERE id = $1 AND tenant_id = $2
      RETURNING *
    `, ...values);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    res.json({ data: webhook[0] });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const result = await prisma.$queryRawUnsafe(`
      DELETE FROM public.webhooks 
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
    `, id, tenantId);

    if (!result || result.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    logger.info('Webhook deleted', { webhookId: id });
    res.status(204).send();
  },

  // Logs
  async getLogs(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;
    const { page = 1, limit = 50, success } = req.query;

    // Verify webhook belongs to tenant
    const webhook = await prisma.$queryRawUnsafe(`
      SELECT id FROM public.webhooks 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE webhook_id = $1';
    const params: any[] = [id];

    if (success !== undefined) {
      whereClause += ` AND success = $${params.length + 1}`;
      params.push(success === 'true');
    }

    const logs = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.webhook_logs 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, ...params, Number(limit), offset);

    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) FROM public.webhook_logs ${whereClause}
    `, ...params);

    res.json({
      data: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult[0].count),
        pages: Math.ceil(parseInt(countResult[0].count) / Number(limit))
      }
    });
  },

  // Test webhook
  async test(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const webhook = await prisma.$queryRawUnsafe(`
      SELECT * FROM public.webhooks 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    const webhookData = webhook[0];

    // Enqueue test event
    await redis.publish('webhook:deliver', JSON.stringify({
      webhookId: id,
      eventType: 'webhook.test',
      payload: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook event'
      }
    }));

    res.json({ 
      message: 'Test webhook queued. Check logs for delivery status.',
      webhookId: id
    });
  },

  // Regenerate secret
  async regenerateSecret(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    const newSecret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.$queryRawUnsafe(`
      UPDATE public.webhooks 
      SET secret = $1
      WHERE id = $2 AND tenant_id = $3
      RETURNING *
    `, newSecret, id, tenantId);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    logger.warn('Webhook secret regenerated', { webhookId: id });

    res.json({ 
      data: webhook[0],
      message: 'Secret regenerated. Save it securely - it will not be shown again!'
    });
  },

  // Get webhook statistics
  async getStats(req: Request, res: Response) {
    const { id } = req.params;
    const tenantId = req.user!.tenantId;

    // Verify webhook belongs to tenant
    const webhook = await prisma.$queryRawUnsafe(`
      SELECT id FROM public.webhooks 
      WHERE id = $1 AND tenant_id = $2
    `, id, tenantId);

    if (!webhook || webhook.length === 0) {
      throw new AppError('Webhook not found', 404);
    }

    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN success = true THEN 1 END) as successful_calls,
        COUNT(CASE WHEN success = false THEN 1 END) as failed_calls,
        AVG(duration_ms) as avg_duration_ms,
        MAX(duration_ms) as max_duration_ms,
        MIN(duration_ms) as min_duration_ms
      FROM public.webhook_logs
      WHERE webhook_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    `, id);

    const recentErrors = await prisma.$queryRawUnsafe(`
      SELECT event_type, error_message, created_at
      FROM public.webhook_logs
      WHERE webhook_id = $1 AND success = false
      ORDER BY created_at DESC
      LIMIT 10
    `, id);

    res.json({
      data: {
        stats: stats[0],
        recentErrors
      }
    });
  }
};