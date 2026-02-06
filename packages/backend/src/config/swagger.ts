import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerOptions: FastifyDynamicSwaggerOptions = {
    openapi: {
        openapi: '3.0.3',
        info: {
            title: 'MultBot API',
            description: 'API para gerenciamento de bots Telegram com integração Depix',
            version: '1.0.0',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor de desenvolvimento',
            },
        ],
        tags: [
            { name: 'Auth', description: 'Autenticação e autorização' },
            { name: 'Dashboard', description: 'KPIs e estatísticas' },
            { name: 'Bots', description: 'Gerenciamento de bots' },
            { name: 'Transactions', description: 'Histórico de transações' },
            { name: 'Settings', description: 'Configurações da plataforma' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
};

export const scalarOptions = {
    routePrefix: '/docs',
    configuration: {
        theme: 'purple',
        spec: {
            url: '/docs/json',
        },
    },
};
