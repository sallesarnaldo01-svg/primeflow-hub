import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const conversationEventsController = {
  // GET /conversations/:conversationId/events - Listar eventos
  async list(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const tenantId = req.user?.tenantId;
      const { limit = 100 } = req.query;

      const events = await prisma.conversationEvent.findMany({
        where: {
          tenantId,
          conversationId
        },
        take: Number(limit),
        orderBy: { createdAt: 'asc' }
      });

      res.json(events);
    } catch (error) {
      logger.error('Erro ao listar eventos de conversa', { error });
      throw Boom.internal('Erro ao listar eventos');
    }
  },

  // POST /conversations/:conversationId/events - Criar evento
  async create(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const tenantId = req.user?.tenantId;
      const { type, actor, actorId, actorName, content, metadata } = req.body;

      const event = await prisma.conversationEvent.create({
        data: {
          tenantId,
          conversationId,
          type,
          actor,
          actorId,
          actorName,
          content,
          metadata
        }
      });

      logger.info('Evento de conversa criado', { eventId: event.id, type });
      res.status(201).json(event);
    } catch (error) {
      logger.error('Erro ao criar evento', { error });
      throw error;
    }
  },

  // POST /conversations/:conversationId/events/:eventId/rate - Avaliar evento
  async rate(req: Request, res: Response) {
    try {
      const { conversationId, eventId } = req.params;
      const tenantId = req.user?.tenantId;
      const { rating, feedback } = req.body;

      const event = await prisma.conversationEvent.findFirst({
        where: {
          id: eventId,
          conversationId,
          tenantId
        }
      });

      if (!event) {
        throw Boom.notFound('Evento não encontrado');
      }

      const updated = await prisma.conversationEvent.update({
        where: { id: eventId },
        data: {
          rating,
          feedback
        }
      });

      logger.info('Evento avaliado', { eventId, rating });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao avaliar evento', { error });
      throw error;
    }
  },

  // GET /conversations/:conversationId/timeline - Timeline unificada
  async timeline(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const tenantId = req.user?.tenantId;

      const events = await prisma.conversationEvent.findMany({
        where: {
          tenantId,
          conversationId
        },
        orderBy: { createdAt: 'asc' }
      });

      // Agrupar por tipo para estatísticas
      const stats = {
        totalMessages: events.filter(e => e.type === 'message').length,
        aiMessages: events.filter(e => e.actor === 'ai_agent').length,
        humanMessages: events.filter(e => e.actor === 'human_agent').length,
        customerMessages: events.filter(e => e.actor === 'customer').length,
        systemEvents: events.filter(e => e.actor === 'system').length,
        averageRating: events
          .filter(e => e.rating)
          .reduce((sum, e) => sum + (e.rating || 0), 0) / events.filter(e => e.rating).length || 0
      };

      res.json({
        events,
        stats
      });
    } catch (error) {
      logger.error('Erro ao obter timeline', { error });
      throw error;
    }
  }
};
