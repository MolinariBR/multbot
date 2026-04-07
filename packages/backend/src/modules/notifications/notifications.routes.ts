import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import type { SafeParseReturnType } from 'zod';
import { ValidationError } from '../../lib/error.js';
import { prisma } from '../../lib/prisma.js';
import { adminTelegramBot } from './admin-telegram-bot.service.js';
import {
    limitQueryJsonSchema,
    limitQuerySchema,
    pairingCodeResponseJsonSchema,
    successResponseJsonSchema,
} from './notifications.schema.js';
import {
    createTelegramPairingCode,
    sendTestEmail,
    sendTestTelegram,
} from './notifications.service.js';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

function parseSchemaOrThrow<T>(parsedResult: SafeParseReturnType<unknown, T>): T {
    if (parsedResult.success) {
        return parsedResult.data;
    }

    const fieldErrors = normalizeFieldErrors(parsedResult.error.flatten().fieldErrors);
    throw new ValidationError('Dados inválidos', fieldErrors);
}

function getAuthenticatedAdminIdOrThrow(request: FastifyRequest): string {
    const adminId = request.user?.sub;

    if (!adminId) {
        throw new ValidationError('Admin inválido');
    }

    return adminId;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
}

export const notificationsRoutes: FastifyPluginAsync = async (app) => {
    app.post('/telegram/pairing-code', {
        schema: {
            tags: ['Notifications'],
            summary: 'Gerar código para vincular Telegram (admin)',
            security: [{ bearerAuth: [] }],
            response: {
                200: pairingCodeResponseJsonSchema,
            },
        },
    }, async (request, reply) => {
        const adminId = getAuthenticatedAdminIdOrThrow(request);
        const { code, expiresAt } = await createTelegramPairingCode(adminId);

        return reply.send({ code, expiresAt: expiresAt.toISOString() });
    });

    app.get('/admins', {
        schema: {
            tags: ['Notifications'],
            summary: 'Listar admins e status de vinculação Telegram',
            security: [{ bearerAuth: [] }],
        },
    }, async (_request, reply) => {
        const admins = await prisma.admin.findMany({
            select: { id: true, email: true, name: true, telegramChatId: true, telegramLinkedAt: true },
            orderBy: { createdAt: 'asc' },
        });

        return reply.send({
            telegramBotReady: adminTelegramBot.isReady(),
            admins: admins.map((admin) => ({
                id: admin.id,
                email: admin.email,
                name: admin.name,
                telegramLinked: Boolean(admin.telegramChatId),
                telegramLinkedAt: admin.telegramLinkedAt,
            })),
        });
    });

    app.post('/test-email', {
        schema: {
            tags: ['Notifications'],
            summary: 'Enviar email de teste (somente para o admin logado)',
            security: [{ bearerAuth: [] }],
            response: {
                200: successResponseJsonSchema,
            },
        },
    }, async (request, reply) => {
        const adminId = getAuthenticatedAdminIdOrThrow(request);

        try {
            await sendTestEmail(adminId);
            return reply.send({ success: true });
        } catch (error: unknown) {
            throw new ValidationError(getErrorMessage(error, 'Falha ao enviar email de teste'));
        }
    });

    app.post('/test-telegram', {
        schema: {
            tags: ['Notifications'],
            summary: 'Enviar Telegram de teste (somente para o admin logado)',
            security: [{ bearerAuth: [] }],
            response: {
                200: successResponseJsonSchema,
            },
        },
    }, async (request, reply) => {
        const adminId = getAuthenticatedAdminIdOrThrow(request);

        try {
            await sendTestTelegram(adminId);
            return reply.send({ success: true });
        } catch (error: unknown) {
            throw new ValidationError(getErrorMessage(error, 'Falha ao enviar Telegram de teste'));
        }
    });

    app.get('/events', {
        schema: {
            tags: ['Notifications'],
            summary: 'Listar eventos de notificação (auditoria)',
            security: [{ bearerAuth: [] }],
            querystring: limitQueryJsonSchema,
        },
    }, async (request, reply) => {
        const query = parseSchemaOrThrow(limitQuerySchema.safeParse(request.query));
        const events = await prisma.notificationEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: query.limit,
        });

        return reply.send(events);
    });

    app.get('/deliveries', {
        schema: {
            tags: ['Notifications'],
            summary: 'Listar entregas de notificação (auditoria)',
            security: [{ bearerAuth: [] }],
            querystring: limitQueryJsonSchema,
        },
    }, async (request, reply) => {
        const query = parseSchemaOrThrow(limitQuerySchema.safeParse(request.query));
        const deliveries = await prisma.notificationDelivery.findMany({
            orderBy: { createdAt: 'desc' },
            take: query.limit,
        });

        return reply.send(deliveries);
    });
};
