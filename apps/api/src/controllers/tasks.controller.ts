import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.js';

export const tasksController = {
  async list(req: Request, res: Response) {
    const { status, assignee_id } = req.query;

    const where: any = {
      tenantId: req.user!.tenantId
    };

    if (status) where.status = status;
    if (assignee_id) where.assigneeId = assignee_id;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { position: 'asc' }
      ],
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: tasks
    });
  },

  async get(req: Request, res: Response) {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    res.json({
      success: true,
      data: task
    });
  },

  async create(req: Request, res: Response) {
    const data = {
      ...req.body,
      tenantId: req.user!.tenantId,
      createdById: req.user!.userId
    };

    const task = await prisma.task.create({
      data,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'task.create',
        entity: 'task',
        entityId: task.id,
        newValue: task,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.status(201).json({
      success: true,
      data: task
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existing) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const task = await prisma.task.update({
      where: { id },
      data: req.body,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'task.update',
        entity: 'task',
        entityId: task.id,
        oldValue: existing,
        newValue: task,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      data: task
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    await prisma.task.delete({
      where: { id }
    });

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'task.delete',
        entity: 'task',
        entityId: id,
        oldValue: task,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    res.json({
      success: true,
      message: 'Tarefa deletada com sucesso'
    });
  },

  async move(req: Request, res: Response) {
    const { id } = req.params;
    const { status, position } = req.body;

    const task = await prisma.task.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!task) {
      throw new AppError('Tarefa não encontrada', 404);
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status, position }
    });

    res.json({
      success: true,
      data: updated
    });
  },

  // Comments
  async listComments(req: Request, res: Response) {
    const { taskId } = req.params;

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: comments
    });
  },

  async createComment(req: Request, res: Response) {
    const { taskId } = req.params;
    const { comment, mentions } = req.body;

    const taskComment = await prisma.taskComment.create({
      data: {
        taskId,
        userId: req.user!.userId,
        comment,
        mentions
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: taskComment
    });
  },

  async updateComment(req: Request, res: Response) {
    const { taskId, commentId } = req.params;
    const { comment } = req.body;

    const existing = await prisma.taskComment.findUnique({
      where: { id: commentId }
    });

    if (!existing || existing.taskId !== taskId || existing.userId !== req.user!.userId) {
      throw new AppError('Comentário não encontrado ou sem permissão', 404);
    }

    const updated = await prisma.taskComment.update({
      where: { id: commentId },
      data: { comment }
    });

    res.json({
      success: true,
      data: updated
    });
  },

  async deleteComment(req: Request, res: Response) {
    const { taskId, commentId } = req.params;

    const comment = await prisma.taskComment.findUnique({
      where: { id: commentId }
    });

    if (!comment || comment.taskId !== taskId) {
      throw new AppError('Comentário não encontrado', 404);
    }

    // Permitir deletar se for o autor ou admin
    // Verificação de admin deve ser implementada no middleware

    await prisma.taskComment.delete({
      where: { id: commentId }
    });

    res.json({
      success: true,
      message: 'Comentário deletado'
    });
  }
};
