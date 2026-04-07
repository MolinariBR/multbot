import type { FastifyPluginAsync } from 'fastify';
import { ValidationError } from '../../lib/error.js';
import type { UpdateSettingsInput } from './settings.schema.js';
import { updateSettingsSchema } from './settings.schema.js';
import {
    getSettings,
    testDepixConnection,
    updateSettings,
} from './settings.service.js';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

function parseUpdateSettingsInputOrThrow(requestBody: unknown): UpdateSettingsInput {
    const parsedResult = updateSettingsSchema.safeParse(requestBody);
    if (parsedResult.success) {
        return parsedResult.data;
    }

    throw new ValidationError(
        'Dados inválidos',
        normalizeFieldErrors(parsedResult.error.flatten().fieldErrors),
    );
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'erro desconhecido';
}

async function reloadDepixRuntimeConfigurationOrThrow(): Promise<void> {
    try {
        const { depixService } = await import('../depix/depix.service.js');
        await depixService.initialize();
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        throw new Error(`Falha ao recarregar configuração Depix em runtime: ${errorMessage}`);
    }
}

export const settingsRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', {
        schema: {
            tags: ['Settings'],
            summary: 'Obter configurações',
            security: [{ bearerAuth: [] }],
        },
    }, async (_request, reply) => {
        const settings = await getSettings();
        return reply.send(settings);
    });

    app.put('/', {
        schema: {
            tags: ['Settings'],
            summary: 'Atualizar configurações',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const settingsInput = parseUpdateSettingsInputOrThrow(request.body);
        const settings = await updateSettings(settingsInput);
        await reloadDepixRuntimeConfigurationOrThrow();
        return reply.send(settings);
    });

    app.post('/test-depix', {
        schema: {
            tags: ['Settings'],
            summary: 'Testar conexão Depix',
            security: [{ bearerAuth: [] }],
        },
    }, async (_request, reply) => {
        const result = await testDepixConnection();
        return reply.send(result);
    });
};
