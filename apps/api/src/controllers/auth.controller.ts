import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { JWTPayload, AuthUser } from '@primeflow/shared/types';
import { AppError } from '../middleware/error.js';

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true }
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name
      }
    };

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: authUser,
        token
      }
    });
  },

  async register(req: Request, res: Response) {
    const { email, name, password, tenantName } = req.body;

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      throw new AppError('Email já cadastrado', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        users: {
          create: {
            email,
            name,
            passwordHash,
            role: 'ADMIN'
          }
        }
      },
      include: {
        users: true
      }
    });

    const user = tenant.users[0];

    const payload: JWTPayload = {
      userId: user.id,
      tenantId: tenant.id,
      role: user.role
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN
    });

    logger.info('New user registered', { userId: user.id, tenantId: tenant.id });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: tenant.id,
          tenant: {
            id: tenant.id,
            name: tenant.name
          }
        },
        token
      }
    });
  },

  async me(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { tenant: true }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name
      }
    };

    res.json({
      success: true,
      data: authUser
    });
  },

  async updateProfile(req: Request, res: Response) {
    const { name, timezone } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name }
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  },

  async resetPassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId }
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('Senha atual incorreta', 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    logger.info('Password reset', { userId: user.id });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  }
};
