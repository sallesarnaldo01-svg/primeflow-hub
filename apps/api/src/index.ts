import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { connectDatabase } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { initializeSocket } from './lib/socket.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import flowsRoutes from './routes/flows.routes.js';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
import connectionsRoutes from './routes/connections.routes.js';
import queuesRoutes from './routes/queues.routes.js';
import broadcastsRoutes from './routes/broadcasts.routes.js';
import campaignsRoutes from './routes/campaigns.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/flows', flowsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/queues', queuesRoutes);
app.use('/api/broadcasts', broadcastsRoutes);
app.use('/api/campaigns', campaignsRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Initialize
async function start() {
  try {
    await connectDatabase();
    await redis.ping();
    initializeSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 API Server running on port ${env.PORT}`);
      logger.info(`📝 Environment: ${env.NODE_ENV}`);
      logger.info(`🌐 CORS enabled for: ${env.FRONTEND_ORIGIN}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

start();
