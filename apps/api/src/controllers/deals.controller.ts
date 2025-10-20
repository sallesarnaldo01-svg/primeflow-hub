import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { emitDealMoved } from '../lib/socket.js';

export const dealsController = {
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { stage, brokerId, propertyId } = req.query;

      const where: any = { tenantId };
      if (stage) where.stage = stage;
      if (brokerId) where.brokerId = brokerId;
      if (propertyId) where.propertyId = propertyId;

      const deals = await prisma.deals.findMany({
        where,
        orderBy: [
          { stage: 'asc' },
          { position: 'asc' },
          { createdAt: 'desc' }
        ],
        include: {
          property: true
        }
      });

      res.json({ data: deals });
    } catch (error) {
      logger.error('Error listing deals', { error });
      res.status(500).json({ error: 'Failed to list deals' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const deal = await prisma.deals.findFirst({
        where: { id, tenantId },
        include: {
          property: true
        }
      });

      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      res.json({ data: deal });
    } catch (error) {
      logger.error('Error getting deal', { error });
      res.status(500).json({ error: 'Failed to get deal' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;

      const deal = await prisma.deals.create({
        data: {
          ...req.body,
          tenantId,
          brokerId: req.body.brokerId || userId
        }
      });

      logger.info('Deal created', { dealId: deal.id });
      res.status(201).json({ data: deal });
    } catch (error) {
      logger.error('Error creating deal', { error });
      res.status(500).json({ error: 'Failed to create deal' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const deal = await prisma.deals.updateMany({
        where: { id, tenantId },
        data: req.body
      });

      if (deal.count === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      const updated = await prisma.deals.findFirst({
        where: { id, tenantId },
        include: {
          property: true
        }
      });

      res.json({ data: updated });
    } catch (error) {
      logger.error('Error updating deal', { error });
      res.status(500).json({ error: 'Failed to update deal' });
    }
  },

  async updateStage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stage, position } = req.body;
      const tenantId = req.user?.tenantId;

      const deal = await prisma.deals.updateMany({
        where: { id, tenantId },
        data: { stage, position }
      });

      if (deal.count === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      const updated = await prisma.deals.findFirst({
        where: { id, tenantId }
      });

      // Emit deal moved event
      emitDealMoved(tenantId!, {
        dealId: id,
        stage,
        position,
        deal: updated
      });

      res.json({ data: updated });
    } catch (error) {
      logger.error('Error updating deal stage', { error });
      res.status(500).json({ error: 'Failed to update deal stage' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const result = await prisma.deals.deleteMany({
        where: { id, tenantId }
      });

      if (result.count === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting deal', { error });
      res.status(500).json({ error: 'Failed to delete deal' });
    }
  },

  async qualifyLead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { messages } = req.body;
      const tenantId = req.user?.tenantId;

      const deal = await prisma.deals.findFirst({
        where: { id, tenantId }
      });

      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      // Call AI edge function for lead qualification
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/ai-lead-qualifier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          messages,
          leadData: deal
        })
      });

      if (!response.ok) {
        throw new Error('Failed to qualify lead');
      }

      const { qualification } = await response.json();

      // Update deal with AI insights
      await prisma.deals.update({
        where: { id },
        data: {
          aiScore: qualification.score,
          aiInsights: qualification as any,
          customFields: {
            ...((deal.customFields as any) || {}),
            preferences: {
              propertyType: qualification.propertyType,
              transactionType: qualification.transactionType,
              priceRange: qualification.priceRange,
              location: qualification.location,
              bedrooms: qualification.bedrooms,
              bathrooms: qualification.bathrooms,
              features: qualification.features,
              urgency: qualification.urgency
            }
          }
        }
      });

      res.json({ data: qualification });
    } catch (error) {
      logger.error('Error qualifying lead', { error });
      res.status(500).json({ error: 'Failed to qualify lead' });
    }
  },

  async recommendProperties(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.body;
      const tenantId = req.user?.tenantId;

      const deal = await prisma.deals.findFirst({
        where: { id, tenantId }
      });

      if (!deal) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      const preferences = (deal.customFields as any)?.preferences || {};

      // Call AI edge function for property recommendations
      const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/ai-property-recommender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
          leadPreferences: preferences,
          tenantId,
          limit
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const { recommendations } = await response.json();

      res.json({ data: recommendations });
    } catch (error) {
      logger.error('Error recommending properties', { error });
      res.status(500).json({ error: 'Failed to recommend properties' });
    }
  },

  async bulkAIAction(req: Request, res: Response) {
    try {
      const { dealIds, action, prompt } = req.body;
      const tenantId = req.user?.tenantId;

      const deals = await prisma.deals.findMany({
        where: {
          id: { in: dealIds },
          tenantId
        }
      });

      if (deals.length === 0) {
        return res.status(404).json({ error: 'No deals found' });
      }

      const results = [];

      for (const deal of deals) {
        try {
          if (action === 'qualify') {
            const messages = [
              { role: 'user', content: prompt || 'Qualifique este lead' }
            ];

            const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/ai-lead-qualifier`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
              },
              body: JSON.stringify({ messages, leadData: deal })
            });

            if (response.ok) {
              const { qualification } = await response.json();
              
              await prisma.deals.update({
                where: { id: deal.id },
                data: {
                  aiScore: qualification.score,
                  aiInsights: qualification as any
                }
              });

              results.push({ dealId: deal.id, success: true, data: qualification });
            } else {
              results.push({ dealId: deal.id, success: false, error: 'AI qualification failed' });
            }
          }
        } catch (error) {
          results.push({ 
            dealId: deal.id, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      res.json({ data: results });
    } catch (error) {
      logger.error('Error in bulk AI action', { error });
      res.status(500).json({ error: 'Failed to execute bulk AI action' });
    }
  }
};
