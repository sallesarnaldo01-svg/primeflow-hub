import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { logger } from './logger.js';
import { JWTPayload } from '@primeflow/shared/types';
import { redis } from './redis.js';

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

  // Subscribe to Redis pub/sub for workflow events
  const subscriber = redis.duplicate();
  subscriber.subscribe('workflow:completed', (err) => {
    if (err) {
      logger.error('Failed to subscribe to workflow:completed', { err });
    } else {
      logger.info('Subscribed to workflow:completed channel');
    }
  });

  subscriber.on('message', (channel, message) => {
    if (channel === 'workflow:completed') {
      try {
        const data = JSON.parse(message);
        logger.info('Received workflow:completed event', data);
        emitWorkflowCompleted(data.tenantId, data);
      } catch (error) {
        logger.error('Error processing workflow:completed message', { error });
      }
    }
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

// New realtime event helpers
export function emitMessageReceived(tenantId: string, data: any) {
  emitToTenant(tenantId, 'message:received', data);
}

export function emitConversationUpdated(tenantId: string, data: any) {
  emitToTenant(tenantId, 'conversation:updated', data);
}

export function emitDealMoved(tenantId: string, data: any) {
  emitToTenant(tenantId, 'deal:moved', data);
}

export function emitAgentAssigned(tenantId: string, data: any) {
  emitToTenant(tenantId, 'agent:assigned', data);
}

export function emitWorkflowCompleted(tenantId: string, data: any) {
  emitToTenant(tenantId, 'workflow:completed', data);
}

export function emitWorkflowProgress(tenantId: string, data: any) {
  emitToTenant(tenantId, 'workflow:progress', data);
}
