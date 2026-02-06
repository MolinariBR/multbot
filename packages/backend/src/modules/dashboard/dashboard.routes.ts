import type { FastifyPluginAsync } from 'fastify';
import * as dashboardService from './dashboard.service.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
    app.get('/stats', {
        schema: {
            tags: ['Dashboard'],
            summary: 'Estatísticas do dashboard',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        botsCount: { type: 'integer' },
                        transactionsCount: { type: 'integer' },
                        totalRevenue: { type: 'integer' },
                        successRate: { type: 'number' },
                        topBots: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    revenue: { type: 'integer' },
                                },
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const stats = await dashboardService.getStats();
        return reply.send(stats);
    });
};
