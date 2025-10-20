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
import whatsappRoutes from './routes/whatsapp.routes.js';

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
import scrumRoutes from './routes/scrum.routes.js';
import videoCallRoutes from './routes/video-call.routes.js';
import facebookRoutes from './routes/facebook.routes.js';
import instagramRoutes from './routes/instagram.routes.js';
import aiProvidersRoutes from './routes/ai-providers.routes.js';
import aiToolsRoutes from './routes/ai-tools.routes.js';
import aiSettingsRoutes from './routes/ai-settings.routes.js';
import aiAgentsRoutes from './routes/ai-agents.routes.js';
import knowledgeRoutes from './routes/knowledge.routes.js';
import productsRoutes from './routes/products.routes.js';
import followupCadenceRoutes from './routes/followup-cadence.routes.js';
import customFieldsRoutes from './routes/custom-fields.routes.js';
import aiUsageRoutes from './routes/ai-usage.routes.js';
import aiAssistRoutes from './routes/ai-assist.routes.js';
import conversationEventsRoutes from './routes/conversation-events.routes.js';
import leadsRoutes from './routes/leads.routes.js';
import contactListsRoutes from './routes/contact-lists.routes.js';
import workflowsRoutes from './routes/workflows.routes.js';
import facebookAdsRoutes from './routes/facebook-ads.routes.js';
import webhooksRoutes from './routes/webhooks.routes.js';
import conversationsRoutes from './routes/conversations.routes.js';
import contactsRoutes from './routes/contacts.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import propertiesRoutes from './routes/properties.routes.js';
import dealsRoutes from './routes/deals.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/flows', flowsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/queues', queuesRoutes);
app.use('/api/broadcasts', broadcastsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/scrum', scrumRoutes);
app.use('/api/video-call', videoCallRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/ai', aiProvidersRoutes);
app.use('/api/ai/tools', aiToolsRoutes);
app.use('/api/ai-agents', aiSettingsRoutes);
app.use('/api/ai-agents', aiAgentsRoutes);
app.use('/api/ai/knowledge', knowledgeRoutes);
app.use('/api/ai/cadences', followupCadenceRoutes);
app.use('/api/ai/usage', aiUsageRoutes);
app.use('/api/ai/assist', aiAssistRoutes);
app.use('/api/conversation-events', conversationEventsRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/contact-lists', contactListsRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/facebook-ads', facebookAdsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/deals', dealsRoutes);

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
