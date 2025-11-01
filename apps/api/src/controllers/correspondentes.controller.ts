import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const correspondentesController = {
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { status } = req.query;

      const where: any = { tenant_id: tenantId };
      if (status) where.status = status;

      const correspondentes = await prisma.$queryRawUnsafe(`
        SELECT c.*, 
          (SELECT COUNT(*) FROM public.correspondentes_usuarios WHERE correspondente_id = c.id) as total_usuarios
        FROM public.correspondentes c
        WHERE c.tenant_id = $1
        ${status ? `AND c.status = '${status}'` : ''}
        ORDER BY c.razao_social ASC
      `, tenantId);

      res.json({ data: correspondentes });
    } catch (error) {
      logger.error('Error fetching correspondentes', { error });
      res.status(500).json({ error: 'Failed to fetch correspondentes' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const result = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.correspondentes
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Correspondente not found' });
      }

      // Buscar usuários do correspondente
      const usuarios = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.correspondentes_usuarios
        WHERE correspondente_id = $1
        ORDER BY nome ASC
      `, id);

      res.json({ data: { ...result[0], usuarios } });
    } catch (error) {
      logger.error('Error fetching correspondente', { error });
      res.status(500).json({ error: 'Failed to fetch correspondente' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const result = await prisma.$queryRawUnsafe(`
        INSERT INTO public.correspondentes (
          tenant_id, razao_social, nome_fantasia, cnpj, inscricao_estadual,
          email, telefone, celular, endereco, bairro, cidade, estado, cep,
          responsavel_nome, responsavel_email, responsavel_telefone,
          banco_credenciado, comissao_padrao, status, observacoes, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *
      `,
        tenantId,
        data.razao_social,
        data.nome_fantasia || null,
        data.cnpj || null,
        data.inscricao_estadual || null,
        data.email || null,
        data.telefone || null,
        data.celular || null,
        data.endereco || null,
        data.bairro || null,
        data.cidade || null,
        data.estado || null,
        data.cep || null,
        data.responsavel_nome || null,
        data.responsavel_email || null,
        data.responsavel_telefone || null,
        data.banco_credenciado || null,
        data.comissao_padrao || null,
        data.status || 'ATIVO',
        data.observacoes || null,
        JSON.stringify(data.metadata || {})
      );

      logger.info('Correspondente created', { id: result[0].id });
      res.status(201).json({ data: result[0] });
    } catch (error) {
      logger.error('Error creating correspondente', { error });
      res.status(500).json({ error: 'Failed to create correspondente' });
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
        'razao_social', 'nome_fantasia', 'cnpj', 'inscricao_estadual',
        'email', 'telefone', 'celular', 'endereco', 'bairro', 'cidade', 'estado', 'cep',
        'responsavel_nome', 'responsavel_email', 'responsavel_telefone',
        'banco_credenciado', 'comissao_padrao', 'status', 'observacoes'
      ];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (data.metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(data.metadata));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id, tenantId);

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.correspondentes
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
        RETURNING *
      `, ...values);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Correspondente not found' });
      }

      logger.info('Correspondente updated', { id });
      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating correspondente', { error });
      res.status(500).json({ error: 'Failed to update correspondente' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.correspondentes
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      logger.info('Correspondente deleted', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting correspondente', { error });
      res.status(500).json({ error: 'Failed to delete correspondente' });
    }
  },

  // Gerenciar usuários do correspondente
  async createUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const result = await prisma.$queryRawUnsafe(`
        INSERT INTO public.correspondentes_usuarios (
          tenant_id, correspondente_id, nome, email, telefone, celular, cargo, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
        tenantId,
        id,
        data.nome,
        data.email,
        data.telefone || null,
        data.celular || null,
        data.cargo || null,
        data.status || 'ATIVO',
        JSON.stringify(data.metadata || {})
      );

      logger.info('Correspondente usuario created', { id: result[0].id });
      res.status(201).json({ data: result[0] });
    } catch (error) {
      logger.error('Error creating correspondente usuario', { error });
      res.status(500).json({ error: 'Failed to create correspondente usuario' });
    }
  },

  async updateUsuario(req: Request, res: Response) {
    try {
      const { id, usuarioId } = req.params;
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = ['nome', 'email', 'telefone', 'celular', 'cargo', 'status'];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (data.metadata !== undefined) {
        updates.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(data.metadata));
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(usuarioId, id, tenantId);

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.correspondentes_usuarios
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND correspondente_id = $${paramIndex + 1} AND tenant_id = $${paramIndex + 2}
        RETURNING *
      `, ...values);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Usuario not found' });
      }

      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating correspondente usuario', { error });
      res.status(500).json({ error: 'Failed to update correspondente usuario' });
    }
  },

  async deleteUsuario(req: Request, res: Response) {
    try {
      const { id, usuarioId } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.correspondentes_usuarios
        WHERE id = $1 AND correspondente_id = $2 AND tenant_id = $3
      `, usuarioId, id, tenantId);

      logger.info('Correspondente usuario deleted', { usuarioId });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting correspondente usuario', { error });
      res.status(500).json({ error: 'Failed to delete correspondente usuario' });
    }
  }
};
