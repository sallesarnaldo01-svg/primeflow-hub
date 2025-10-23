import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const empreendimentosController = {
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { status, cidade, estado } = req.query;

      let query = `SELECT * FROM public.empreendimentos WHERE tenant_id = $1`;
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(status);
      }

      if (cidade) {
        query += ` AND cidade ILIKE $${paramIndex++}`;
        params.push(`%${cidade}%`);
      }

      if (estado) {
        query += ` AND estado = $${paramIndex++}`;
        params.push(estado);
      }

      query += ' ORDER BY nome ASC';

      const empreendimentos = await prisma.$queryRawUnsafe(query, ...params);

      res.json({ data: empreendimentos });
    } catch (error) {
      logger.error('Error fetching empreendimentos', { error });
      res.status(500).json({ error: 'Failed to fetch empreendimentos' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const empreendimento = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.empreendimentos
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!empreendimento || empreendimento.length === 0) {
        return res.status(404).json({ error: 'Empreendimento not found' });
      }

      res.json({ data: empreendimento[0] });
    } catch (error) {
      logger.error('Error fetching empreendimento', { error });
      res.status(500).json({ error: 'Failed to fetch empreendimento' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const empreendimento = await prisma.$queryRawUnsafe(`
        INSERT INTO public.empreendimentos (
          tenant_id, nome, construtora, endereco, cidade, estado, cep,
          total_unidades, unidades_disponiveis, valor_minimo, valor_maximo,
          area_minima, area_maxima, descricao, caracteristicas, imagens, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `,
        tenantId,
        data.nome,
        data.construtora || null,
        data.endereco || null,
        data.cidade || null,
        data.estado || null,
        data.cep || null,
        data.total_unidades || 0,
        data.unidades_disponiveis || 0,
        data.valor_minimo || null,
        data.valor_maximo || null,
        data.area_minima || null,
        data.area_maxima || null,
        data.descricao || null,
        JSON.stringify(data.caracteristicas || {}),
        data.imagens || [],
        data.status || 'ATIVO',
        JSON.stringify(data.metadata || {})
      );

      logger.info('Empreendimento created', { id: empreendimento[0].id });
      res.status(201).json({ data: empreendimento[0] });
    } catch (error) {
      logger.error('Error creating empreendimento', { error });
      res.status(500).json({ error: 'Failed to create empreendimento' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = [
        'nome', 'construtora', 'endereco', 'cidade', 'estado', 'cep',
        'total_unidades', 'unidades_disponiveis', 'valor_minimo', 'valor_maximo',
        'area_minima', 'area_maxima', 'descricao', 'status'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (data.caracteristicas !== undefined) {
        updates.push(`caracteristicas = $${paramIndex++}`);
        values.push(JSON.stringify(data.caracteristicas));
      }

      if (data.imagens !== undefined) {
        updates.push(`imagens = $${paramIndex++}`);
        values.push(data.imagens);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id, tenantId);

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.empreendimentos
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
        RETURNING *
      `, ...values);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Empreendimento not found' });
      }

      logger.info('Empreendimento updated', { id });
      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating empreendimento', { error });
      res.status(500).json({ error: 'Failed to update empreendimento' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.empreendimentos
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      logger.info('Empreendimento deleted', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting empreendimento', { error });
      res.status(500).json({ error: 'Failed to delete empreendimento' });
    }
  }
};
