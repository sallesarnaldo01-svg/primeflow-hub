import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const correspondentesController = {
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { tipo, ativo } = req.query;

      let query = `
        SELECT c.*, 
          (SELECT COUNT(*) FROM public.correspondentes_usuarios WHERE correspondente_id = c.id) as total_usuarios
        FROM public.correspondentes c
        WHERE c.tenant_id = $1
      `;

      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (tipo) {
        query += ` AND c.tipo = $${paramIndex++}`;
        params.push(tipo);
      }

      if (ativo !== undefined) {
        query += ` AND c.ativo = $${paramIndex++}`;
        params.push(ativo === 'true');
      }

      query += ' ORDER BY c.razao_social ASC';

      const correspondentes = await prisma.$queryRawUnsafe(query, ...params);

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

      const correspondente = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.correspondentes
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      if (!correspondente || correspondente.length === 0) {
        return res.status(404).json({ error: 'Correspondente not found' });
      }

      // Buscar usuários
      const usuarios = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.correspondentes_usuarios
        WHERE correspondente_id = $1
        ORDER BY nome ASC
      `, id);

      res.json({ data: correspondente[0], usuarios });
    } catch (error) {
      logger.error('Error fetching correspondente', { error });
      res.status(500).json({ error: 'Failed to fetch correspondente' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const data = req.body;

      const correspondente = await prisma.$queryRawUnsafe(`
        INSERT INTO public.correspondentes (
          tenant_id, tipo, razao_social, nome_fantasia, cnpj, email, telefone,
          endereco, contato_principal, banco_parceiro, comissao_padrao, ativo, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `,
        tenantId,
        data.tipo,
        data.razao_social,
        data.nome_fantasia || null,
        data.cnpj || null,
        data.email || null,
        data.telefone || null,
        data.endereco || null,
        data.contato_principal || null,
        data.banco_parceiro || null,
        data.comissao_padrao || null,
        data.ativo !== undefined ? data.ativo : true,
        JSON.stringify(data.metadata || {})
      );

      logger.info('Correspondente created', { id: correspondente[0].id });
      res.status(201).json({ data: correspondente[0] });
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
        'tipo', 'razao_social', 'nome_fantasia', 'cnpj', 'email', 'telefone',
        'endereco', 'contato_principal', 'banco_parceiro', 'comissao_padrao', 'ativo'
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

  // Gerenciar usuários
  async createUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      const usuario = await prisma.$queryRawUnsafe(`
        INSERT INTO public.correspondentes_usuarios (
          correspondente_id, nome, email, telefone, cargo, ativo
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, id, data.nome, data.email, data.telefone || null, data.cargo || null, data.ativo !== undefined ? data.ativo : true);

      logger.info('Correspondente usuario created', { id: usuario[0].id });
      res.status(201).json({ data: usuario[0] });
    } catch (error) {
      logger.error('Error creating correspondente usuario', { error });
      res.status(500).json({ error: 'Failed to create correspondente usuario' });
    }
  },

  async updateUsuario(req: Request, res: Response) {
    try {
      const { id, usuarioId } = req.params;
      const data = req.body;

      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = ['nome', 'email', 'telefone', 'cargo', 'ativo'];

      fields.forEach(field => {
        if (data[field] !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          values.push(data[field]);
        }
      });

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(usuarioId, id);

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.correspondentes_usuarios
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND correspondente_id = $${paramIndex + 1}
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

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.correspondentes_usuarios
        WHERE id = $1 AND correspondente_id = $2
      `, usuarioId, id);

      logger.info('Correspondente usuario deleted', { usuarioId });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting correspondente usuario', { error });
      res.status(500).json({ error: 'Failed to delete correspondente usuario' });
    }
  }
};
