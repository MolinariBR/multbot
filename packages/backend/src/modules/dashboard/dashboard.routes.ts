import type { FastifyPluginAsync } from 'fastify';
import {
    dashboardStatsResponseJsonSchema,
    platformStatusResponseJsonSchema,
} from './dashboard.schema.js';
import { getPlatformStatus, getStats } from './dashboard.service.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
    app.get('/platform-status', {
        schema: {
            tags: ['Dashboard'],
            summary: 'Status da plataforma (infra/servicos)',
            security: [{ bearerAuth: [] }],
            response: {
                200: platformStatusResponseJsonSchema,
            },
        },
    }, async (_request, reply) => {
        const status = await getPlatformStatus();
        return reply.send(status);
    });

    app.get('/stats', {
        schema: {
            tags: ['Dashboard'],
            summary: 'Estatísticas do dashboard',
            security: [{ bearerAuth: [] }],
            response: {
                200: dashboardStatsResponseJsonSchema,
            },
        },
    }, async (_request, reply) => {
        const stats = await getStats();
        return reply.send(stats);
    });
};
