import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const leadInteractionsController = {
  async getByLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const { tenantId } = req.user as any;

      const interactions = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.lead_interactions 
        WHERE lead_id = $1 AND tenant_id = $2
        ORDER BY created_at DESC
      `, leadId, tenantId);

      res.json(interactions);
    } catch (error) {
      logger.error('Error getting lead interactions', { error });
      res.status(500).json({ error: 'Failed to get interactions' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const { tenantId, userId } = req.user as any;
      const { tipo, descricao, resultado, duracao, agendadoPara, concluido } = req.body;

      const interaction = await prisma.$queryRawUnsafe(`
        INSERT INTO public.lead_interactions 
          (tenant_id, lead_id, tipo, descricao, resultado, duracao, agendado_para, concluido, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, tenantId, leadId, tipo, descricao, resultado, duracao, agendadoPara, concluido || false, userId);

      res.status(201).json(interaction[0]);
    } catch (error) {
      logger.error('Error creating interaction', { error });
      res.status(500).json({ error: 'Failed to create interaction' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;
      const { descricao, resultado, duracao, agendadoPara, concluido } = req.body;

      const updates = [];
      const values = [id, tenantId];
      let paramIndex = 3;

      if (descricao) {
        updates.push(`descricao = $${paramIndex++}`);
        values.push(descricao);
      }
      if (resultado) {
        updates.push(`resultado = $${paramIndex++}`);
        values.push(resultado);
      }
      if (duracao !== undefined) {
        updates.push(`duracao = $${paramIndex++}`);
        values.push(duracao);
      }
      if (agendadoPara) {
        updates.push(`agendado_para = $${paramIndex++}`);
        values.push(agendadoPara);
      }
      if (concluido !== undefined) {
        updates.push(`concluido = $${paramIndex++}`);
        values.push(concluido);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const interaction = await prisma.$queryRawUnsafe(`
        UPDATE public.lead_interactions 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1 AND tenant_id = $2
        RETURNING *
      `, ...values);

      res.json(interaction[0]);
    } catch (error) {
      logger.error('Error updating interaction', { error });
      res.status(500).json({ error: 'Failed to update interaction' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { tenantId } = req.user as any;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.lead_interactions 
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting interaction', { error });
      res.status(500).json({ error: 'Failed to delete interaction' });
    }
  }
};
