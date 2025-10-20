import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const auditController = {
  async list(req: Request, res: Response) {
    const {
      user_id,
      action,
      entity,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const where: any = {};

    if (user_id) where.userId = user_id as string;
    if (action) where.action = { contains: action as string };
    if (entity) where.entity = entity as string;
    
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date as string);
      if (end_date) where.createdAt.lte = new Date(end_date as string);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  },

  async create(req: Request, res: Response) {
    const { action, entity, entity_id, old_value, new_value } = req.body;

    const log = await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action,
        entity,
        entityId: entity_id,
        oldValue: old_value,
        newValue: new_value,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: log
    });
  },

  async export(req: Request, res: Response) {
    const {
      user_id,
      action,
      entity,
      start_date,
      end_date
    } = req.query;

    const where: any = {};

    if (user_id) where.userId = user_id as string;
    if (action) where.action = { contains: action as string };
    if (entity) where.entity = entity as string;
    
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date as string);
      if (end_date) where.createdAt.lte = new Date(end_date as string);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Gerar CSV
    const csv = [
      ['Data', 'Usuário', 'Email', 'Ação', 'Entidade', 'ID da Entidade', 'IP'].join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.user?.name || '',
        log.user?.email || '',
        log.action,
        log.entity,
        log.entityId || '',
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString()}.csv`);
    res.send(csv);
  }
};
