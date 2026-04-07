import type { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env.js';

const isProductionEnvironment = env.NODE_ENV === 'production';
const productionAllowedOrigins = [
    'https://multbot.com',
    'https://mullttibot.duckdns.org',
];

const corsOrigin: FastifyCorsOptions['origin'] = isProductionEnvironment
    ? productionAllowedOrigins
    : true;

export const corsOptions: FastifyCorsOptions = {
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
