import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const ticketsController = {
  async list(req: Request, res: Response) {
    try {
      const { status, priority, category, assignedTo, search, page = 1, limit = 50 } = req.query;
      const tenantId = req.user!.tenantId;

      const where: any = { tenantId };

      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;
      if (assignedTo) where.assignedToId = assignedTo;

      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            contact: {
              select: { id: true, name: true, phone: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.ticket.count({ where }),
      ]);

      res.json({
        data: tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error listing tickets', { error });
      throw Boom.internal('Failed to list tickets');
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const ticket = await prisma.ticket.findFirst({
        where: { id, tenantId },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          contact: true,
        },
      });

      if (!ticket) {
        throw Boom.notFound('Ticket not found');
      }

      res.json({ data: ticket });
    } catch (error) {
      logger.error('Error getting ticket', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to get ticket');
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = req.user!.userId;
      const { title, description, priority, category, assignedTo, contactId } = req.body;

      const ticket = await prisma.ticket.create({
        data: {
          tenantId,
          title,
          description,
          priority,
          category,
          assignedToId: assignedTo,
          contactId,
          createdById: userId,
          status: 'OPEN',
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info('Ticket created', { ticketId: ticket.id });
      res.status(201).json({ data: ticket });
    } catch (error) {
      logger.error('Error creating ticket', { error });
      throw Boom.internal('Failed to create ticket');
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      const { title, description, status, priority, category, assignedTo } = req.body;

      const ticket = await prisma.ticket.findFirst({
        where: { id, tenantId },
      });

      if (!ticket) {
        throw Boom.notFound('Ticket not found');
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (status) {
        updateData.status = status;
        if (status === 'RESOLVED' || status === 'CLOSED') {
          updateData.resolvedAt = new Date();
        }
      }
      if (priority) updateData.priority = priority;
      if (category) updateData.category = category;
      if (assignedTo !== undefined) updateData.assignedToId = assignedTo;

      const updated = await prisma.ticket.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info('Ticket updated', { ticketId: id });
      res.json({ data: updated });
    } catch (error) {
      logger.error('Error updating ticket', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to update ticket');
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const ticket = await prisma.ticket.findFirst({
        where: { id, tenantId },
      });

      if (!ticket) {
        throw Boom.notFound('Ticket not found');
      }

      await prisma.ticket.delete({ where: { id } });

      logger.info('Ticket deleted', { ticketId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting ticket', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to delete ticket');
    }
  },

  async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { comment } = req.body;
      const tenantId = req.user!.tenantId;
      const userId = req.user!.userId;

      const ticket = await prisma.ticket.findFirst({
        where: { id, tenantId },
      });

      if (!ticket) {
        throw Boom.notFound('Ticket not found');
      }

      const ticketComment = await prisma.ticketComment.create({
        data: {
          ticketId: id,
          userId,
          content: comment,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.status(201).json({ data: ticketComment });
    } catch (error) {
      logger.error('Error adding comment', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to add comment');
    }
  },

  async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const ticket = await prisma.ticket.findFirst({
        where: { id, tenantId },
      });

      if (!ticket) {
        throw Boom.notFound('Ticket not found');
      }

      const comments = await prisma.ticketComment.findMany({
        where: { ticketId: id },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ data: comments });
    } catch (error) {
      logger.error('Error getting comments', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to get comments');
    }
  },
};
