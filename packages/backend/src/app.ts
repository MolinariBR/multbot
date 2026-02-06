import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import scalarPlugin from '@scalar/fastify-api-reference';
import { corsOptions } from './config/cors.js';
import { swaggerOptions, scalarOptions } from './config/swagger.js';
import { AppError } from './lib/error.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { botsRoutes } from './modules/bots/bots.routes.js';
import { transactionsRoutes } from './modules/transactions/transactions.routes.js';
import { settingsRoutes } from './modules/settings/settings.routes.js';
import { authHook } from './lib/auth-hook.js';
import { depixRoutes } from './modules/depix/depix.routes.js';

export async function buildApp() {
    const app = Fastify({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                },
            },
        },
    });

    // Plugins
    await app.register(cors, corsOptions);
    await app.register(swagger, swaggerOptions);
    await app.register(scalarPlugin, scalarOptions);

    // Auth hook (protege rotas)
    app.addHook('onRequest', authHook);

    // Error handler global
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                error: error.message,
                ...(error instanceof Error && 'details' in error && { details: (error as any).details }),
            });
        }

        // Erros de validação do Fastify
        if (error.validation) {
            return reply.status(400).send({
                error: 'Dados inválidos',
                details: error.validation,
            });
        }

        // Erro genérico
        request.log.error(error);
        return reply.status(500).send({
            error: 'Erro interno do servidor',
        });
    });

    // Rotas
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(dashboardRoutes, { prefix: '/api/dashboard' });
    await app.register(botsRoutes, { prefix: '/api/bots' });
    await app.register(transactionsRoutes, { prefix: '/api/transactions' });
    await app.register(settingsRoutes, { prefix: '/api/settings' });
    await app.register(depixRoutes, { prefix: '/api/depix' });

    // Health check
    app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

    return app;
}
