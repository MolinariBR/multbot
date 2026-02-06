import type { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env.js';

export const corsOptions: FastifyCorsOptions = {
    origin: env.NODE_ENV === 'production'
        ? ['https://multbot.com'] // Adicionar domínios de produção
        : true, // Permite qualquer origem em dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
