import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const messageTemplatesController = {
  async list(req: Request, res: Response) {
    const { category } = req.query;

    const where: any = {
      OR: [
        { createdById: req.user!.userId },
        { shared: true }
      ]
    };

    if (category) {
      where.category = category;
    }

    const templates = await prisma.messageTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: templates
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        OR: [
          { createdById: req.user!.userId },
          { shared: true }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!template) {
      throw new AppError('Template não encontrado', 404);
    }

    res.json({
      success: true,
      data: template
    });
  },

  async create(req: Request, res: Response) {
    const { name, content, category, variables, shared } = req.body;

    // Extrair variáveis automaticamente do conteúdo se não fornecidas
    let templateVariables = variables;
    if (!templateVariables) {
      const matches = content.match(/{{\s*(\w+)\s*}}/g);
      if (matches) {
        templateVariables = Array.from(new Set(
          matches.map((match: string) => match.replace(/[{}\s]/g, ''))
        ));
      }
    }

    const template = await prisma.messageTemplate.create({
      data: {
        tenantId: req.user!.tenantId,
        name,
        content,
        category,
        variables: templateVariables,
        shared: shared || false,
        createdById: req.user!.userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'message_template.create',
        entity: 'message_template',
        entityId: template.id,
        newValue: template,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: template
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;

    const existing = await prisma.messageTemplate.findFirst({
      where: {
        id,
        createdById: req.user!.userId
      }
    });

    if (!existing) {
      throw new AppError('Template não encontrado ou sem permissão', 404);
    }

    const template = await prisma.messageTemplate.update({
      where: { id },
      data: req.body,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'message_template.update',
        entity: 'message_template',
        entityId: template.id,
        oldValue: existing,
        newValue: template,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: template
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const template = await prisma.messageTemplate.findFirst({
      where: {
        id,
        createdById: req.user!.userId
      }
    });

    if (!template) {
      throw new AppError('Template não encontrado ou sem permissão', 404);
    }

    await prisma.messageTemplate.delete({
      where: { id }
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'message_template.delete',
        entity: 'message_template',
        entityId: id,
        oldValue: template,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Template deletado com sucesso'
    });
  }
};
