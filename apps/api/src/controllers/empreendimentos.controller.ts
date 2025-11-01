import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const empreendimentosController = {
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { status, cidade, tipo } = req.query;

      const where: any = { tenant_id: tenantId };
      if (status) where.status = status;
      if (cidade) where.cidade = cidade;
      if (tipo) where.tipo = tipo;

      const empreendimentos = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.empreendimentos
        WHERE tenant_id = $1
        ${status ? `AND status = '${status}'` : ''}
        ${cidade ? `AND cidade ILIKE '%${cidade}%'` : ''}
        ${tipo ? `AND tipo = '${tipo}'` : ''}
        ORDER BY nome ASC
      `, tenantId);

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

      const result = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.empreendimentos
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Empreendimento not found' });
      }

      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error fetching empreendimento', { error });
      res.status(500).json({ error: 'Failed to fetch empreendimento' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const result = await prisma.$queryRawUnsafe(`
        INSERT INTO public.empreendimentos (
          tenant_id, nome, descricao, construtora, incorporadora,
          endereco, bairro, cidade, estado, cep,
          latitude, longitude, tipo, status,
          data_lancamento, data_entrega_prevista,
          total_unidades, unidades_disponiveis,
          valor_minimo, valor_maximo, imagens, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *
      `,
        tenantId,
        data.nome,
        data.descricao || null,
        data.construtora || null,
        data.incorporadora || null,
        data.endereco || null,
        data.bairro || null,
        data.cidade || null,
        data.estado || null,
        data.cep || null,
        data.latitude || null,
        data.longitude || null,
        data.tipo || null,
        data.status || 'ATIVO',
        data.data_lancamento || null,
        data.data_entrega_prevista || null,
        data.total_unidades || null,
        data.unidades_disponiveis || null,
        data.valor_minimo || null,
        data.valor_maximo || null,
        JSON.stringify(data.imagens || []),
        JSON.stringify(data.metadata || {})
      );

      logger.info('Empreendimento created', { id: result[0].id });
      res.status(201).json({ data: result[0] });
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
        'nome', 'descricao', 'construtora', 'incorporadora',
        'endereco', 'bairro', 'cidade', 'estado', 'cep',
        'latitude', 'longitude', 'tipo', 'status',
        'data_lancamento', 'data_entrega_prevista',
        'total_unidades', 'unidades_disponiveis',
        'valor_minimo', 'valor_maximo'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (data.imagens !== undefined) {
        updates.push(`imagens = $${paramIndex++}`);
        values.push(JSON.stringify(data.imagens));
      }

      if (data.metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(data.metadata));
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
