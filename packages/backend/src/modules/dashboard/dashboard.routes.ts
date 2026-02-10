import type { FastifyPluginAsync } from 'fastify';
import * as dashboardService from './dashboard.service.js';

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
    app.get('/platform-status', {
        schema: {
            tags: ['Dashboard'],
            summary: 'Status da plataforma (infra/servicos)',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        apiOnline: { type: 'boolean' },
                        serverTime: { type: 'string' },
                        uptimeSec: { type: 'integer' },
                        nodeVersion: { type: 'string' },
                        bots: {
                            type: 'object',
                            properties: {
                                activeConfigured: { type: 'integer' },
                                running: { type: 'integer' },
                            },
                            required: ['activeConfigured', 'running'],
                        },
                        depix: {
                            type: 'object',
                            properties: {
                                configured: { type: 'boolean' },
                            },
                            required: ['configured'],
                        },
                    },
                    required: ['apiOnline', 'serverTime', 'uptimeSec', 'nodeVersion', 'bots', 'depix'],
                },
            },
        },
    }, async (request, reply) => {
        const status = await dashboardService.getPlatformStatus();
        return reply.send(status);
    });

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
