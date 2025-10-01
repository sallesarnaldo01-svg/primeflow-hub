import Redis from 'ioredis';
import { env } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null
});

redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (error) => {
  logger.error('❌ Redis error', { error });
});
