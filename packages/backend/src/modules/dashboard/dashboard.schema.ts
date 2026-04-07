export const platformStatusResponseJsonSchema = {
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
} as const;

export const dashboardStatsResponseJsonSchema = {
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
                required: ['id', 'name', 'revenue'],
            },
        },
    },
    required: ['botsCount', 'transactionsCount', 'totalRevenue', 'successRate', 'topBots'],
} as const;
