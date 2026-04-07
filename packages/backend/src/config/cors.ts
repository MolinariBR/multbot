import type { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env.js';

const isProductionEnvironment = env.NODE_ENV === 'production';
const vercelPreviewOriginPattern = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

const productionAllowedOrigins: Array<string | RegExp> = [
  'https://multbot.com',
  'https://mullttibot.duckdns.org',
  vercelPreviewOriginPattern,
];

if (env.FRONTEND_URL) {
  productionAllowedOrigins.push(env.FRONTEND_URL);
}

const corsOrigin: FastifyCorsOptions['origin'] = isProductionEnvironment ? productionAllowedOrigins : true;

export const corsOptions: FastifyCorsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
