import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file from project root
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../../../.env') : null,
  typeof __dirname !== 'undefined' ? path.resolve(__dirname, '../../.env') : null,
].filter(Boolean) as string[];

for (const envCandidate of envCandidates) {
  dotenv.config({ path: envCandidate });
}

const envSchema = z.object({
  PORT: z.string().default('4000').transform(val => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/smartspend?schema=public'),
  DIRECT_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().default('smartspend_jwt_access_super_secret_key_min32chars'),
  JWT_REFRESH_SECRET: z.string().default('smartspend_jwt_refresh_super_secret_key_min32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(val => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform(val => parseInt(val, 10)),
  AI_PROVIDER: z.enum(['gemini', 'openai', 'none']).default('none'),
  GEMINI_API_KEY: z.string().optional().default(''),
  OPENAI_API_KEY: z.string().optional().default(''),
  BCRYPT_SALT_ROUNDS: z.string().default('12').transform(val => parseInt(val, 10))
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed');
}

export const config = parsed.data;
process.env.DATABASE_URL = config.DATABASE_URL;
export type Config = typeof config;
