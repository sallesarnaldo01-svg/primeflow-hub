import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const customFieldsController = {
  // GET /custom-fields - Listar campos customizados
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { entity } = req.query;

      const fields = await prisma.customField.findMany({
        where: {
          tenantId,
          ...(entity && { entity: entity as string })
        },
        orderBy: { order: 'asc' }
      });

      res.json(fields);
    } catch (error) {
      logger.error('Erro ao listar campos customizados', { error });
      throw Boom.internal('Erro ao listar campos');
    }
  },

  // POST /custom-fields - Criar campo customizado
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { entity, name, label, type, options, required, order } = req.body;

      const field = await prisma.customField.create({
        data: {
          tenantId,
          entity,
          name,
          label,
          type,
          options: options || [],
          required: required || false,
          order: order || 0,
          active: true
        }
      });

      logger.info('Campo customizado criado', { fieldId: field.id });
      res.status(201).json(field);
    } catch (error) {
      logger.error('Erro ao criar campo customizado', { error });
      throw error;
    }
  },

  // PUT /custom-fields/:id - Atualizar campo customizado
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { label, type, options, required, order, active } = req.body;

      const field = await prisma.customField.findFirst({
        where: { id, tenantId }
      });

      if (!field) {
        throw Boom.notFound('Campo não encontrado');
      }

      const updated = await prisma.customField.update({
        where: { id },
        data: {
          ...(label && { label }),
          ...(type && { type }),
          ...(options && { options }),
          ...(required !== undefined && { required }),
          ...(order !== undefined && { order }),
          ...(active !== undefined && { active })
        }
      });

      logger.info('Campo customizado atualizado', { fieldId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar campo', { error });
      throw error;
    }
  },

  // DELETE /custom-fields/:id - Deletar campo customizado
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const field = await prisma.customField.findFirst({
        where: { id, tenantId }
      });

      if (!field) {
        throw Boom.notFound('Campo não encontrado');
      }

      await prisma.customField.delete({
        where: { id }
      });

      logger.info('Campo customizado deletado', { fieldId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar campo', { error });
      throw error;
    }
  },

  // GET /custom-fields/entities - Listar entidades disponíveis
  async listEntities(req: Request, res: Response) {
    try {
      const entities = [
        { value: 'lead', label: 'Leads' },
        { value: 'contact', label: 'Contatos' },
        { value: 'deal', label: 'Negócios' },
        { value: 'product', label: 'Produtos' }
      ];

      res.json(entities);
    } catch (error) {
      logger.error('Erro ao listar entidades', { error });
      throw error;
    }
  }
};
