import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  WHATSAPP_PROVIDER: z.enum(['baileys', 'official']).default('baileys'),
  FB_APP_ID: z.string().optional(),
  FB_APP_SECRET: z.string().optional(),
  IG_APP_ID: z.string().optional(),
  IG_APP_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  UPLOADS_DIR: z.string().default('./uploads')
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Invalid environment variables:', error);
  process.exit(1);
}

export { env };
