import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const knowledgeController = {
  // GET /ai/knowledge - Listar documentos
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { agentId, type } = req.query;

      const docs = await prisma.knowledgeDocument.findMany({
        where: {
          tenantId,
          ...(agentId && { agentId: agentId as string }),
          ...(type && { type: type as string })
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(docs);
    } catch (error) {
      logger.error('Erro ao listar documentos', { error });
      throw Boom.internal('Erro ao listar documentos');
    }
  },

  // POST /ai/knowledge - Criar documento
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { name, type, fileUrl, content, agentId, tags, metadata } = req.body;

      const doc = await prisma.knowledgeDocument.create({
        data: {
          tenantId,
          name,
          type,
          fileUrl,
          content,
          agentId,
          tags: tags || [],
          metadata
        }
      });

      logger.info('Documento de conhecimento criado', { docId: doc.id });
      res.status(201).json(doc);
    } catch (error) {
      logger.error('Erro ao criar documento', { error });
      throw error;
    }
  },

  // DELETE /ai/knowledge/:id - Deletar documento
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const doc = await prisma.knowledgeDocument.findFirst({
        where: { id, tenantId }
      });

      if (!doc) {
        throw Boom.notFound('Documento não encontrado');
      }

      await prisma.knowledgeDocument.delete({
        where: { id }
      });

      logger.info('Documento deletado', { docId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar documento', { error });
      throw error;
    }
  },

  // POST /ai/knowledge/search - Busca semântica (RAG)
  async search(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { query, agentId, limit = 5 } = req.body;

      // Por enquanto, busca simples por conteúdo
      // TODO: Implementar busca vetorial com embeddings
      const docs = await prisma.knowledgeDocument.findMany({
        where: {
          tenantId,
          ...(agentId && { agentId }),
          content: {
            contains: query,
            mode: 'insensitive'
          }
        },
        take: limit as number,
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        query,
        results: docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          content: doc.content?.substring(0, 500), // Preview
          relevance: 0.8 // Mock score
        }))
      });
    } catch (error) {
      logger.error('Erro na busca RAG', { error });
      throw error;
    }
  }
};
