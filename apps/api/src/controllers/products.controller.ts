import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import Boom from '@hapi/boom';

export const productsController = {
  // GET /products - Listar produtos
  async list(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { category, active } = req.query;

      const products = await prisma.product.findMany({
        where: {
          tenantId,
          ...(category && { category: category as string }),
          ...(active !== undefined && { active: active === 'true' })
        },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(products);
    } catch (error) {
      logger.error('Erro ao listar produtos', { error });
      throw Boom.internal('Erro ao listar produtos');
    }
  },

  // GET /products/:id - Obter produto
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const product = await prisma.product.findFirst({
        where: { id, tenantId },
        include: {
          images: {
            orderBy: { order: 'asc' }
          }
        }
      });

      if (!product) {
        throw Boom.notFound('Produto não encontrado');
      }

      res.json(product);
    } catch (error) {
      logger.error('Erro ao obter produto', { error });
      throw error;
    }
  },

  // POST /products - Criar produto
  async create(req: Request, res: Response) {
    try {
      const tenantId = req.user?.tenantId;
      const { name, description, price, category, sku, stock, metadata, images } = req.body;

      const product = await prisma.product.create({
        data: {
          tenantId,
          name,
          description,
          price,
          category,
          sku,
          stock: stock || 0,
          metadata,
          active: true,
          images: images ? {
            create: images.map((img: any, index: number) => ({
              url: img.url,
              tags: img.tags || [],
              order: img.order || index
            }))
          } : undefined
        },
        include: {
          images: true
        }
      });

      logger.info('Produto criado', { productId: product.id });
      res.status(201).json(product);
    } catch (error) {
      logger.error('Erro ao criar produto', { error });
      throw error;
    }
  },

  // PUT /products/:id - Atualizar produto
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { name, description, price, category, sku, stock, metadata, active } = req.body;

      const product = await prisma.product.findFirst({
        where: { id, tenantId }
      });

      if (!product) {
        throw Boom.notFound('Produto não encontrado');
      }

      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(price !== undefined && { price }),
          ...(category && { category }),
          ...(sku && { sku }),
          ...(stock !== undefined && { stock }),
          ...(metadata && { metadata }),
          ...(active !== undefined && { active })
        },
        include: {
          images: true
        }
      });

      logger.info('Produto atualizado', { productId: id });
      res.json(updated);
    } catch (error) {
      logger.error('Erro ao atualizar produto', { error });
      throw error;
    }
  },

  // DELETE /products/:id - Deletar produto
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      const product = await prisma.product.findFirst({
        where: { id, tenantId }
      });

      if (!product) {
        throw Boom.notFound('Produto não encontrado');
      }

      await prisma.product.delete({
        where: { id }
      });

      logger.info('Produto deletado', { productId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar produto', { error });
      throw error;
    }
  },

  // POST /products/:id/images - Adicionar imagem
  async addImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const { url, tags, order } = req.body;

      const product = await prisma.product.findFirst({
        where: { id, tenantId }
      });

      if (!product) {
        throw Boom.notFound('Produto não encontrado');
      }

      const image = await prisma.productImage.create({
        data: {
          productId: id,
          url,
          tags: tags || [],
          order: order || 0
        }
      });

      logger.info('Imagem adicionada ao produto', { productId: id, imageId: image.id });
      res.status(201).json(image);
    } catch (error) {
      logger.error('Erro ao adicionar imagem', { error });
      throw error;
    }
  }
};
