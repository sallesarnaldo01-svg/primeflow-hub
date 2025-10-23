import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const simulacoesController = {
  async calcular(req: Request, res: Response) {
    try {
      const {
        valor_imovel,
        valor_entrada,
        valor_fgts,
        valor_subsidio,
        prazo_meses,
        taxa_juros_anual,
        sistema_amortizacao
      } = req.body;

      const result = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.calcular_simulacao_financiamento($1, $2, $3, $4, $5, $6, $7)
      `,
        valor_imovel,
        valor_entrada || 0,
        valor_fgts || 0,
        valor_subsidio || 0,
        prazo_meses,
        taxa_juros_anual,
        sistema_amortizacao || 'SAC'
      );

      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error calculating simulacao', { error });
      res.status(500).json({ error: 'Failed to calculate simulacao' });
    }
  },

  async salvar(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;
      const data = req.body;

      const simulacao = await prisma.$queryRawUnsafe(`
        INSERT INTO public.simulacoes_financiamento (
          tenant_id, lead_id, deal_id, pre_cadastro_id,
          valor_imovel, valor_entrada, valor_fgts, valor_subsidio,
          prazo_meses, taxa_juros_anual, sistema_amortizacao,
          valor_financiado, valor_parcela, total_juros, total_pagar, renda_minima_necessaria,
          nome_simulacao, observacoes, usuario_id, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `,
        tenantId,
        data.lead_id || null,
        data.deal_id || null,
        data.pre_cadastro_id || null,
        data.valor_imovel,
        data.valor_entrada || 0,
        data.valor_fgts || 0,
        data.valor_subsidio || 0,
        data.prazo_meses,
        data.taxa_juros_anual,
        data.sistema_amortizacao || 'SAC',
        data.valor_financiado,
        data.valor_parcela,
        data.total_juros,
        data.total_pagar,
        data.renda_minima_necessaria,
        data.nome_simulacao || null,
        data.observacoes || null,
        userId,
        JSON.stringify(data.metadata || {})
      );

      logger.info('Simulacao saved', { id: simulacao[0].id });
      res.status(201).json({ data: simulacao[0] });
    } catch (error) {
      logger.error('Error saving simulacao', { error });
      res.status(500).json({ error: 'Failed to save simulacao' });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { lead_id, deal_id, pre_cadastro_id } = req.query;

      let query = 'SELECT * FROM public.simulacoes_financiamento WHERE tenant_id = $1';
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (lead_id) {
        query += ` AND lead_id = $${paramIndex++}`;
        params.push(lead_id);
      }

      if (deal_id) {
        query += ` AND deal_id = $${paramIndex++}`;
        params.push(deal_id);
      }

      if (pre_cadastro_id) {
        query += ` AND pre_cadastro_id = $${paramIndex++}`;
        params.push(pre_cadastro_id);
      }

      query += ' ORDER BY created_at DESC';

      const simulacoes = await prisma.$queryRawUnsafe(query, ...params);

      res.json({ data: simulacoes });
    } catch (error) {
      logger.error('Error fetching simulacoes', { error });
      res.status(500).json({ error: 'Failed to fetch simulacoes' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const simulacao = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.simulacoes_financiamento
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!simulacao || simulacao.length === 0) {
        return res.status(404).json({ error: 'Simulacao not found' });
      }

      res.json({ data: simulacao[0] });
    } catch (error) {
      logger.error('Error fetching simulacao', { error });
      res.status(500).json({ error: 'Failed to fetch simulacao' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.simulacoes_financiamento
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      logger.info('Simulacao deleted', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting simulacao', { error });
      res.status(500).json({ error: 'Failed to delete simulacao' });
    }
  }
};
