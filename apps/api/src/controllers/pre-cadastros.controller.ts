import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const preCadastrosController = {
  async getAll(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { status, correspondente_id, empreendimento_id, search, dateFrom, dateTo } = req.query;

      const where: any = { tenant_id: tenantId };

      if (status) where.status = status;
      if (correspondente_id) where.correspondente_id = correspondente_id;
      if (empreendimento_id) where.empreendimento_id = empreendimento_id;
      if (search) {
        where.OR = [
          { numero: { contains: search as string, mode: 'insensitive' } },
          { corretor_nome: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      if (dateFrom || dateTo) {
        where.data_cadastro = {};
        if (dateFrom) where.data_cadastro.gte = new Date(dateFrom as string);
        if (dateTo) where.data_cadastro.lte = new Date(dateTo as string);
      }

      const preCadastros = await prisma.$queryRawUnsafe(`
        SELECT 
          pc.*,
          e.nome as empreendimento_nome,
          c.razao_social as correspondente_nome,
          l.name as lead_nome,
          cnt.name as contact_nome
        FROM public.pre_cadastros pc
        LEFT JOIN public.empreendimentos e ON e.id = pc.empreendimento_id
        LEFT JOIN public.correspondentes c ON c.id = pc.correspondente_id
        LEFT JOIN public.leads l ON l.id = pc.lead_id
        LEFT JOIN public.contacts cnt ON cnt.id = pc.contact_id
        WHERE pc.tenant_id = $1
        ${status ? `AND pc.status = '${status}'` : ''}
        ${correspondente_id ? `AND pc.correspondente_id = '${correspondente_id}'` : ''}
        ORDER BY pc.created_at DESC
      `, tenantId);

      // Contar por status
      const counts = await prisma.$queryRawUnsafe(`
        SELECT 
          status,
          COUNT(*) as count
        FROM public.pre_cadastros
        WHERE tenant_id = $1
        GROUP BY status
      `, tenantId);

      res.json({ data: preCadastros, counts });
    } catch (error) {
      logger.error('Error fetching pré-cadastros', { error });
      res.status(500).json({ error: 'Failed to fetch pré-cadastros' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const preCadastro = await prisma.$queryRawUnsafe(`
        SELECT 
          pc.*,
          e.nome as empreendimento_nome,
          e.endereco as empreendimento_endereco,
          c.razao_social as correspondente_nome,
          c.email as correspondente_email,
          cu.nome as correspondente_usuario_nome,
          l.name as lead_nome,
          l.phone as lead_phone,
          cnt.name as contact_nome,
          cnt.email as contact_email,
          cnt.phone as contact_phone
        FROM public.pre_cadastros pc
        LEFT JOIN public.empreendimentos e ON e.id = pc.empreendimento_id
        LEFT JOIN public.correspondentes c ON c.id = pc.correspondente_id
        LEFT JOIN public.correspondentes_usuarios cu ON cu.id = pc.correspondente_usuario_id
        LEFT JOIN public.leads l ON l.id = pc.lead_id
        LEFT JOIN public.contacts cnt ON cnt.id = pc.contact_id
        WHERE pc.id = $1 AND pc.tenant_id = $2
      `, id, tenantId);

      if (!preCadastro || preCadastro.length === 0) {
        return res.status(404).json({ error: 'Pré-cadastro not found' });
      }

      // Buscar documentos
      const documentos = await prisma.$queryRawUnsafe(`
        SELECT * FROM public.documentos_pre_cadastro
        WHERE pre_cadastro_id = $1
        ORDER BY created_at DESC
      `, id);

      // Calcular percentual de documentos
      const percentualDocs = await prisma.$queryRawUnsafe(`
        SELECT public.calcular_percentual_documentos($1) as percentual
      `, id);

      res.json({
        data: preCadastro[0],
        documentos,
        percentual_documentos: percentualDocs[0]?.percentual || 0
      });
    } catch (error) {
      logger.error('Error fetching pré-cadastro', { error });
      res.status(500).json({ error: 'Failed to fetch pré-cadastro' });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;
      const data = req.body;

      // Gerar número automático
      const numero = await prisma.$queryRawUnsafe(`
        SELECT public.generate_pre_cadastro_numero($1) as numero
      `, tenantId);

      const preCadastro = await prisma.$queryRawUnsafe(`
        INSERT INTO public.pre_cadastros (
          tenant_id, numero, lead_id, deal_id, contact_id,
          empreendimento_id, correspondente_id, correspondente_usuario_id,
          bloco, unidade,
          valor_avaliacao, valor_aprovado, valor_subsidio, valor_fgts, valor_entrada, valor_total,
          renda_mensal_bruta, renda_familiar_bruta,
          prazo_meses, valor_prestacao, taxa_juros, sistema_amortizacao,
          status, data_vencimento_aprovacao,
          owner_id, corretor_nome, imobiliaria_nome,
          observacoes, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
        ) RETURNING *
      `,
        tenantId,
        numero[0].numero,
        data.lead_id || null,
        data.deal_id || null,
        data.contact_id || null,
        data.empreendimento_id || null,
        data.correspondente_id || null,
        data.correspondente_usuario_id || null,
        data.bloco || null,
        data.unidade || null,
        data.valor_avaliacao,
        data.valor_aprovado || null,
        data.valor_subsidio || 0,
        data.valor_fgts || 0,
        data.valor_entrada || 0,
        data.valor_total || data.valor_avaliacao,
        data.renda_mensal_bruta || null,
        data.renda_familiar_bruta || null,
        data.prazo_meses || null,
        data.valor_prestacao || null,
        data.taxa_juros || null,
        data.sistema_amortizacao || 'SAC',
        data.status || 'NOVA_AVALIACAO',
        data.data_vencimento_aprovacao || null,
        userId,
        data.corretor_nome || null,
        data.imobiliaria_nome || null,
        data.observacoes || null,
        JSON.stringify(data.metadata || {})
      );

      logger.info('Pré-cadastro created', { id: preCadastro[0].id });
      res.status(201).json({ data: preCadastro[0] });
    } catch (error) {
      logger.error('Error creating pré-cadastro', { error });
      res.status(500).json({ error: 'Failed to create pré-cadastro' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const data = req.body;

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const fields = [
        'empreendimento_id', 'correspondente_id', 'correspondente_usuario_id',
        'bloco', 'unidade', 'valor_avaliacao', 'valor_aprovado', 'valor_subsidio',
        'valor_fgts', 'valor_entrada', 'valor_total', 'renda_mensal_bruta',
        'renda_familiar_bruta', 'prazo_meses', 'valor_prestacao', 'taxa_juros',
        'sistema_amortizacao', 'status', 'data_vencimento_aprovacao', 'data_aprovacao',
        'corretor_nome', 'imobiliaria_nome', 'observacoes'
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
        UPDATE public.pre_cadastros
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
        RETURNING *
      `, ...values);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Pré-cadastro not found' });
      }

      logger.info('Pré-cadastro updated', { id });
      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error updating pré-cadastro', { error });
      res.status(500).json({ error: 'Failed to update pré-cadastro' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      await prisma.$queryRawUnsafe(`
        DELETE FROM public.pre_cadastros
        WHERE id = $1 AND tenant_id = $2
      `, id, tenantId);

      logger.info('Pré-cadastro deleted', { id });
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting pré-cadastro', { error });
      res.status(500).json({ error: 'Failed to delete pré-cadastro' });
    }
  },

  // Gerenciar documentos
  async uploadDocumento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const userId = req.user?.id;
      const { nome, tipo, categoria, pessoa, obrigatorio, storage_path, file_size, mime_type } = req.body;

      const documento = await prisma.$queryRawUnsafe(`
        INSERT INTO public.documentos_pre_cadastro (
          tenant_id, pre_cadastro_id, nome, tipo, categoria, pessoa, obrigatorio,
          storage_path, file_size, mime_type, uploaded_by, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'AGUARDANDO_APROVACAO')
        RETURNING *
      `, tenantId, id, nome, tipo, categoria, pessoa, obrigatorio, storage_path, file_size, mime_type, userId);

      logger.info('Document uploaded', { preCadastroId: id, documentoId: documento[0].id });
      res.status(201).json({ data: documento[0] });
    } catch (error) {
      logger.error('Error uploading document', { error });
      res.status(500).json({ error: 'Failed to upload document' });
    }
  },

  async aprovarDocumento(req: Request, res: Response) {
    try {
      const { id, documentoId } = req.params;
      const userId = req.user?.id;

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.documentos_pre_cadastro
        SET status = 'APROVADO', aprovado_por = $1, data_aprovacao = NOW(), updated_at = NOW()
        WHERE id = $2 AND pre_cadastro_id = $3
        RETURNING *
      `, userId, documentoId, id);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error approving document', { error });
      res.status(500).json({ error: 'Failed to approve document' });
    }
  },

  async rejeitarDocumento(req: Request, res: Response) {
    try {
      const { id, documentoId } = req.params;
      const { motivo } = req.body;

      const result = await prisma.$queryRawUnsafe(`
        UPDATE public.documentos_pre_cadastro
        SET status = 'REJEITADO', motivo_rejeicao = $1, updated_at = NOW()
        WHERE id = $2 AND pre_cadastro_id = $3
        RETURNING *
      `, motivo, documentoId, id);

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ data: result[0] });
    } catch (error) {
      logger.error('Error rejecting document', { error });
      res.status(500).json({ error: 'Failed to reject document' });
    }
  }
};
