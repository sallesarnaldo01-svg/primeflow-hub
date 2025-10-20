import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const companySettingsController = {
  async get(req: Request, res: Response) {
    let settings = await prisma.companySetting.findUnique({
      where: { tenantId: req.user!.tenantId }
    });

    // Se não existir, criar com valores padrão
    if (!settings) {
      settings = await prisma.companySetting.create({
        data: {
          tenantId: req.user!.tenantId,
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          locale: 'pt-BR',
          dateFormat: 'DD/MM/YYYY'
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  },

  async update(req: Request, res: Response) {
    const settings = await prisma.companySetting.upsert({
      where: { tenantId: req.user!.tenantId },
      update: req.body,
      create: {
        tenantId: req.user!.tenantId,
        ...req.body
      }
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'company_settings.update',
        entity: 'company_settings',
        entityId: settings.id,
        newValue: settings,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: settings
    });
  }
};
