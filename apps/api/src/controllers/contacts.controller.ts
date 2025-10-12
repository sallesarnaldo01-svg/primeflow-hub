import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const contactsController = {
  async list(req: Request, res: Response) {
    try {
      const { search, source, tags, page = 1, limit = 50 } = req.query;
      const tenantId = req.user!.tenantId;

      const where: any = { tenantId };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { phone: { contains: search as string } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (source) {
        where.source = source;
      }

      if (tags && typeof tags === 'string') {
        where.tags = {
          hasSome: tags.split(','),
        };
      }

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
        }),
        prisma.contact.count({ where }),
      ]);

      res.json({
        data: contacts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      logger.error('Error listing contacts', { error });
      throw Boom.internal('Failed to list contacts');
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      res.json({ data: contact });
    } catch (error) {
      logger.error('Error getting contact', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to get contact');
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user!.tenantId;
      const { name, phone, email, source, tags, customFields } = req.body;

      // Check if contact already exists
      const existing = await prisma.contact.findFirst({
        where: { tenantId, phone },
      });

      if (existing) {
        throw Boom.conflict('Contact with this phone already exists');
      }

      const contact = await prisma.contact.create({
        data: {
          tenantId,
          name,
          phone,
          email,
          source: source || 'manual',
          tags: tags || [],
          customFields: customFields || {},
        },
      });

      logger.info('Contact created', { contactId: contact.id });
      res.status(201).json({ data: contact });
    } catch (error) {
      logger.error('Error creating contact', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to create contact');
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;
      const { name, phone, email, source, tags, customFields } = req.body;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      const updated = await prisma.contact.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(email !== undefined && { email }),
          ...(source && { source }),
          ...(tags && { tags }),
          ...(customFields && { customFields }),
        },
      });

      logger.info('Contact updated', { contactId: id });
      res.json({ data: updated });
    } catch (error) {
      logger.error('Error updating contact', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to update contact');
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      await prisma.contact.delete({ where: { id } });

      logger.info('Contact deleted', { contactId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting contact', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to delete contact');
    }
  },

  async addTags(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      const tenantId = req.user!.tenantId;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      const currentTags = (contact.tags as string[]) || [];
      const newTags = Array.from(new Set([...currentTags, ...tags]));

      const updated = await prisma.contact.update({
        where: { id },
        data: { tags: newTags },
      });

      res.json({ data: updated });
    } catch (error) {
      logger.error('Error adding tags', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to add tags');
    }
  },

  async removeTags(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tags } = req.body;
      const tenantId = req.user!.tenantId;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      const currentTags = (contact.tags as string[]) || [];
      const newTags = currentTags.filter(tag => !tags.includes(tag));

      const updated = await prisma.contact.update({
        where: { id },
        data: { tags: newTags },
      });

      res.json({ data: updated });
    } catch (error) {
      logger.error('Error removing tags', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to remove tags');
    }
  },

  async getTimeline(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user!.tenantId;

      const contact = await prisma.contact.findFirst({
        where: { id, tenantId },
      });

      if (!contact) {
        throw Boom.notFound('Contact not found');
      }

      // Get conversations and messages
      const conversations = await prisma.conversation.findMany({
        where: { contactId: id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const timeline = conversations.flatMap(conv =>
        conv.messages.map(msg => ({
          type: 'message',
          timestamp: msg.createdAt,
          content: msg.content,
          direction: msg.direction,
          channel: conv.channel,
        }))
      );

      res.json({ data: timeline });
    } catch (error) {
      logger.error('Error getting timeline', { error });
      if (Boom.isBoom(error)) throw error;
      throw Boom.internal('Failed to get timeline');
    }
  },
};
