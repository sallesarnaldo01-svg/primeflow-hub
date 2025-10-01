import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';

export const prisma = new PrismaClient({
  log: [
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
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
