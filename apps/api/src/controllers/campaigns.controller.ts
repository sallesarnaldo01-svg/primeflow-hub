import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error.js';

export const campaignsController = {
  async list(req: Request, res: Response) {
    const campaigns = await prisma.campaignPhrase.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        flow: {
          select: { id: true, name: true }
        },
        connection: {
          select: { id: true, type: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: campaigns
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const campaign = await prisma.campaignPhrase.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      include: {
        flow: true,
        connection: true
      }
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    res.json({
      success: true,
      data: campaign
    });
  },

  async create(req: Request, res: Response) {
    const { name, flowId, connectionId, phrase, active } = req.body;

    const campaign = await prisma.campaignPhrase.create({
      data: {
        name,
        tenantId: req.user!.tenantId,
        flowId,
        connectionId,
        phrase,
        active: active !== undefined ? active : true
      },
      include: {
        flow: true,
        connection: true
      }
    });

    logger.info('Campaign created', { campaignId: campaign.id });

    res.status(201).json({
      success: true,
      data: campaign
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, flowId, connectionId, phrase, active } = req.body;

    const campaign = await prisma.campaignPhrase.update({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      data: {
        ...(name && { name }),
        ...(flowId && { flowId }),
        ...(connectionId && { connectionId }),
        ...(phrase && { phrase }),
        ...(active !== undefined && { active })
      },
      include: {
        flow: true,
        connection: true
      }
    });

    res.json({
      success: true,
      data: campaign
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await prisma.campaignPhrase.delete({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    res.json({
      success: true,
      message: 'Campanha excluída'
    });
  },

  async toggle(req: Request, res: Response) {
    const { id } = req.params;

    const campaign = await prisma.campaignPhrase.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!campaign) {
      throw new AppError('Campanha não encontrada', 404);
    }

    const updated = await prisma.campaignPhrase.update({
      where: { id },
      data: { active: !campaign.active }
    });

    res.json({
      success: true,
      data: updated
    });
  }
};
