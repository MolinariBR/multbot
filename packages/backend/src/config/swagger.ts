import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger';
import type { FastifyApiReferenceOptions } from '@scalar/fastify-api-reference';
import { env } from './env.js';

const swaggerServerHost = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST;
const swaggerServerUrl = `http://${swaggerServerHost}:${env.PORT}`;
const swaggerServerDescription = env.NODE_ENV === 'production'
    ? 'Servidor de produção'
    : 'Servidor de desenvolvimento';

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
                url: swaggerServerUrl,
                description: swaggerServerDescription,
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

export const scalarApiReferenceOptions: FastifyApiReferenceOptions = {
    routePrefix: '/docs',
    openApiDocumentEndpoints: {
        json: '/json',
    },
    configuration: {
        theme: 'purple',
    },
};
