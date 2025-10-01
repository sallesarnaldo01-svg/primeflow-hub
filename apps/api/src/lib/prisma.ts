import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
});

prisma.$on('query', (e: any) => {
  logger.debug('Prisma Query', {
    query: e.query,
    params: e.params,
    duration: e.duration
  });
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected');
  } catch (error) {
    logger.error('❌ Database connection failed', { error });
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}
