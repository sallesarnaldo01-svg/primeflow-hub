import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const dashboardController = {
  async getMetrics(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get conversations metrics
      const [
        totalConversations,
        activeConversations,
        totalMessages,
        todayMessages,
      ] = await Promise.all([
        prisma.conversation.count({ where: { contact: { tenantId } } }),
        prisma.conversation.count({
          where: {
            contact: { tenantId },
            status: 'OPEN',
          },
        }),
        prisma.message.count({
          where: {
            conversation: {
              contact: { tenantId },
            },
          },
        }),
        prisma.message.count({
          where: {
            conversation: {
              contact: { tenantId },
            },
            createdAt: { gte: new Date(now.setHours(0, 0, 0, 0)) },
          },
        }),
      ]);

      // Get leads metrics
      const [totalLeads, qualifiedLeads, convertedLeads] = await Promise.all([
        prisma.contact.count({
          where: {
            tenantId,
            source: { in: ['whatsapp', 'facebook', 'instagram', 'website'] },
          },
        }),
        prisma.contact.count({
          where: {
            tenantId,
            customFields: {
              path: ['leadStatus'],
              equals: 'qualified',
            },
          },
        }),
        prisma.contact.count({
          where: {
            tenantId,
            customFields: {
              path: ['leadStatus'],
              equals: 'converted',
            },
          },
        }),
      ]);

      // Get campaigns metrics
      const [activeCampaigns, totalSent] = await Promise.all([
        prisma.broadcast.count({
          where: {
            tenantId,
            status: 'RUNNING',
          },
        }),
        prisma.broadcast.aggregate({
          where: {
            tenantId,
            createdAt: { gte: thirtyDaysAgo },
          },
          _sum: {
            totalContacts: true,
          },
        }),
      ]);

      // Get tickets metrics
      const [openTickets, totalTickets] = await Promise.all([
        prisma.ticket.count({
          where: {
            tenantId,
            status: { in: ['OPEN', 'IN_PROGRESS'] },
          },
        }),
        prisma.ticket.count({ where: { tenantId } }),
      ]);

      res.json({
        data: {
          conversations: {
            total: totalConversations,
            active: activeConversations,
            messages: totalMessages,
            todayMessages,
          },
          leads: {
            total: totalLeads,
            qualified: qualifiedLeads,
            converted: convertedLeads,
            conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0,
          },
          campaigns: {
            active: activeCampaigns,
            totalSent: totalSent._sum.totalContacts || 0,
          },
          tickets: {
            open: openTickets,
            total: totalTickets,
          },
        },
      });
    } catch (error) {
      logger.error('Error getting dashboard metrics', { error });
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  },

  async getActivityFeed(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const { limit = 20 } = req.query;

      // Get recent messages
      const recentMessages = await prisma.message.findMany({
        where: {
          conversation: {
            contact: { tenantId },
          },
        },
        include: {
          conversation: {
            include: {
              contact: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      const activities = recentMessages.map(msg => ({
        type: 'message',
        timestamp: msg.createdAt,
        description: `${msg.direction === 'INBOUND' ? 'Recebeu' : 'Enviou'} mensagem ${
          msg.direction === 'INBOUND' ? 'de' : 'para'
        } ${msg.conversation.contact.name}`,
        channel: msg.conversation.channel,
      }));

      res.json({ data: activities });
    } catch (error) {
      logger.error('Error getting activity feed', { error });
      res.status(500).json({ error: 'Failed to get activity feed' });
    }
  },

  async getConversationTrends(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const { days = 7 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      // Get daily conversation counts
      const conversations = await prisma.conversation.groupBy({
        by: ['createdAt'],
        where: {
          contact: { tenantId },
          createdAt: { gte: startDate },
        },
        _count: true,
      });

      res.json({ data: conversations });
    } catch (error) {
      logger.error('Error getting conversation trends', { error });
      res.status(500).json({ error: 'Failed to get trends' });
    }
  },
};
