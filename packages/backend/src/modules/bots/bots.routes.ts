import type { FastifyPluginAsync } from 'fastify';
import type { SafeParseReturnType } from 'zod';
import {
    botIdParamsJsonSchema,
    botIdParamsSchema,
    createBotBodyJsonSchema,
    createBotSchema,
    listBotsQueryJsonSchema,
    listBotsQuerySchema,
    updateBotBodyJsonSchema,
    updateBotSchema,
} from './bots.schema.js';
import {
    createBot,
    deleteBot,
    getBot,
    listBots,
    updateBot,
} from './bots.service.js';
import { ValidationError } from '../../lib/error.js';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

function parseSchemaOrThrow<T>(
    parsedResult: SafeParseReturnType<unknown, T>,
): T {
    if (parsedResult.success) {
        return parsedResult.data;
    }

    const fieldErrors = normalizeFieldErrors(parsedResult.error.flatten().fieldErrors);
    throw new ValidationError('Dados inválidos', fieldErrors);
}

export const botsRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', {
        schema: {
            tags: ['Bots'],
            summary: 'Listar todos os bots',
            security: [{ bearerAuth: [] }],
            querystring: listBotsQueryJsonSchema,
        },
    }, async (request, reply) => {
        const query = parseSchemaOrThrow(listBotsQuerySchema.safeParse(request.query));
        const bots = await listBots(query);
        return reply.send(bots);
    });

    app.get('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Detalhes de um bot',
            security: [{ bearerAuth: [] }],
            params: botIdParamsJsonSchema,
        },
    }, async (request, reply) => {
        const { id } = parseSchemaOrThrow(botIdParamsSchema.safeParse(request.params));
        const bot = await getBot(id);
        return reply.send(bot);
    });

    app.post('/', {
        schema: {
            tags: ['Bots'],
            summary: 'Criar novo bot',
            security: [{ bearerAuth: [] }],
            body: createBotBodyJsonSchema,
        },
    }, async (request, reply) => {
        const createBotInput = parseSchemaOrThrow(createBotSchema.safeParse(request.body));
        const bot = await createBot(createBotInput);
        return reply.status(201).send(bot);
    });

    app.patch('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Atualizar bot',
            security: [{ bearerAuth: [] }],
            params: botIdParamsJsonSchema,
            body: updateBotBodyJsonSchema,
        },
    }, async (request, reply) => {
        const { id } = parseSchemaOrThrow(botIdParamsSchema.safeParse(request.params));
        const updateBotInput = parseSchemaOrThrow(updateBotSchema.safeParse(request.body));
        const bot = await updateBot(id, updateBotInput);
        return reply.send(bot);
    });

    app.delete('/:id', {
        schema: {
            tags: ['Bots'],
            summary: 'Remover bot',
            security: [{ bearerAuth: [] }],
            params: botIdParamsJsonSchema,
        },
    }, async (request, reply) => {
        const { id } = parseSchemaOrThrow(botIdParamsSchema.safeParse(request.params));
        await deleteBot(id);
        return reply.status(204).send();
    });
};
