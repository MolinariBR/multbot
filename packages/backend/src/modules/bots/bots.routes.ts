import type { FastifyPluginAsync } from 'fastify';
import { createBotSchema, updateBotSchema, listBotsQuerySchema } from './bots.schema.js';
import * as botsService from './bots.service.js';
import { ValidationError } from '../../lib/error.js';

export const botsRoutes: FastifyPluginAsync = async (app) => {
    // GET /api/bots
    app.get('/', {
        schema: {
            tags: ['Bots'],
            summary: 'Listar todos os bots',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['active', 'inactive'] },
                    search: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const query = listBotsQuerySchema.parse(request.query);
        const bots = await botsService.listBots(query);
        return reply.send(bots);
    });

    // GET /api/bots/:id
    app.get('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Detalhes de um bot',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const bot = await botsService.getBot(id);
        return reply.send(bot);
    });

    // POST /api/bots
    app.post('/', {
        schema: {
            tags: ['Bots'],
            summary: 'Criar novo bot',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                required: ['name', 'telegramToken', 'ownerName', 'depixAddress'],
                properties: {
                    name: { type: 'string' },
                    telegramToken: { type: 'string' },
                    ownerName: { type: 'string' },
                    depixAddress: { type: 'string' },
                    splitRate: { type: 'number' },
                },
            },
        },
    }, async (request, reply) => {
        const parsed = createBotSchema.safeParse(request.body);

        if (!parsed.success) {
            throw new ValidationError('Dados inválidos', parsed.error.flatten().fieldErrors as any);
        }

        const bot = await botsService.createBot(parsed.data);
        return reply.status(201).send(bot);
    });

    // PATCH /api/bots/:id
    app.patch('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Atualizar bot',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const parsed = updateBotSchema.safeParse(request.body);

        if (!parsed.success) {
            throw new ValidationError('Dados inválidos', parsed.error.flatten().fieldErrors as any);
        }

        const bot = await botsService.updateBot(id, parsed.data);
        return reply.send(bot);
    });

    // DELETE /api/bots/:id
    app.delete('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Remover bot',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        await botsService.deleteBot(id);
        return reply.status(204).send();
    });
};
