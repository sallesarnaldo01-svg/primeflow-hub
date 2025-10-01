import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { JWTPayload } from '@primeflow/shared/types';

export let io: Server;

export function initializeSocket(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_ORIGIN,
      credentials: true
    },
    transports: ['websocket']
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JWTPayload;
    logger.info('Socket connected', { userId: user.userId, tenantId: user.tenantId });

    socket.join(`tenant:${user.tenantId}`);

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { userId: user.userId });
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

export function emitToTenant(tenantId: string, event: string, data: any) {
  if (!io) return;
  io.to(`tenant:${tenantId}`).emit(event, data);
}

export function emitToUser(userId: string, event: string, data: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
