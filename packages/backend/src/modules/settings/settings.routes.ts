import type { FastifyPluginAsync } from 'fastify';
import { updateSettingsSchema } from './settings.schema.js';
import * as settingsService from './settings.service.js';
import { ValidationError } from '../../lib/error.js';

export const settingsRoutes: FastifyPluginAsync = async (app) => {
    // GET /api/settings
    app.get('/', {
        schema: {
            tags: ['Settings'],
            summary: 'Obter configurações',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const settings = await settingsService.getSettings();
        return reply.send(settings);
    });

    // PUT /api/settings
    app.put('/', {
        schema: {
            tags: ['Settings'],
            summary: 'Atualizar configurações',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const parsed = updateSettingsSchema.safeParse(request.body);

        if (!parsed.success) {
            throw new ValidationError('Dados inválidos', parsed.error.flatten().fieldErrors as any);
        }

        const settings = await settingsService.updateSettings(parsed.data);
        return reply.send(settings);
    });

    // POST /api/settings/test-depix
    app.post('/test-depix', {
        schema: {
            tags: ['Settings'],
            summary: 'Testar conexão Depix',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const result = await settingsService.testDepixConnection();
        return reply.send(result);
    });
};
