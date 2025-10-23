import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const leadInteractionsController = {
  async getByLead(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const tenantId = req.user?.tenantId;

      const interactions = await prisma.$queryRawUnsafe(`
        SELECT li.*,
          p.display_name as usuario_nome
        FROM public.lead_interactions li
        LEFT JOIN public.profiles p ON p.id = li.usuario_id
        WHERE li.lead_id = $1 AND li.tenant_id = $2
        ORDER BY li.created_at DESC
      `, leadId, tenantId);

      res.json({ data: interactions });
    } catch (error) {
      logger.error('Error fetching lead interactions', { error });
      res.status(500).json({ error: 'Failed to fetch lead interactions' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { leadId } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;
      const data = req.body;

      const interaction = await prisma.$queryRawUnsafe(`
        INSERT INTO public.lead_interactions (
          tenant_id, lead_id, tipo, direcao, titulo, descricao, duracao_minutos,
          resultado, agendado_para, concluido, usuario_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `,
        tenantId,
        leadId,
        data.tipo,
        data.direcao || null,
        data.titulo,
        data.descricao || null,
        data.duracao_minutos || null,
        data.resultado || null,
        data.agendado_para || null,
        data.concluido || false,
        userId,
        JSON.stringify(data.metadata || {})
      );

      logger.info('Lead interaction created', { id: interaction[0].id, leadId });
      res.status(201).json({ data: interaction[0] });
    } catch (error) {
      logger.error('Error creating lead interaction', { error });
      res.status(500).json({ error: 'Failed to create lead interaction' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { leadId, id } = req.params;
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = [
        'tipo', 'direcao', 'titulo', 'descricao', 'duracao_minutos',
        'resultado', 'agendado_para', 'concluido'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id, leadId, tenantId);

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.lead_interactions
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND lead_id = $${paramIndex + 1} AND tenant_id = $${paramIndex + 2}
        RETURNING *
      `, ...values);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Interaction not found' });
      }

      logger.info('Lead interaction updated', { id });
      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating lead interaction', { error });
      res.status(500).json({ error: 'Failed to update lead interaction' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { leadId, id } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.lead_interactions
        WHERE id = $1 AND lead_id = $2 AND tenant_id = $3
      `, id, leadId, tenantId);

      logger.info('Lead interaction deleted', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting lead interaction', { error });
      res.status(500).json({ error: 'Failed to delete lead interaction' });
    }
  }
};
