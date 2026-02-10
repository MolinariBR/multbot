import type { FastifyPluginAsync } from 'fastify';
import { ValidationError } from '../../lib/error.js';
import { prisma } from '../../lib/prisma.js';
import { adminTelegramBot } from './admin-telegram-bot.service.js';
import * as notificationsService from './notifications.service.js';

export const notificationsRoutes: FastifyPluginAsync = async (app) => {
    // POST /api/notifications/telegram/pairing-code
    app.post('/telegram/pairing-code', {
        schema: {
            tags: ['Notifications'],
            summary: 'Gerar código para vincular Telegram (admin)',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                        expiresAt: { type: 'string' },
                    },
                },
            },
        },
    }, async (request, reply) => {
        const adminId = (request as any).user?.sub as string | undefined;
        if (!adminId) throw new ValidationError('Admin inválido');

        const { code, expiresAt } = await notificationsService.createTelegramPairingCode(adminId);
        return reply.send({ code, expiresAt: expiresAt.toISOString() });
    });

    // GET /api/notifications/admins
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
            admins: admins.map(a => ({
                id: a.id,
                email: a.email,
                name: a.name,
                telegramLinked: Boolean(a.telegramChatId),
                telegramLinkedAt: a.telegramLinkedAt,
            })),
        });
    });

    // POST /api/notifications/test-email
    app.post('/test-email', {
        schema: {
            tags: ['Notifications'],
            summary: 'Enviar email de teste (somente para o admin logado)',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const adminId = (request as any).user?.sub as string | undefined;
        if (!adminId) throw new ValidationError('Admin inválido');

        try {
            await notificationsService.sendTestEmail(adminId);
            return reply.send({ success: true });
        } catch (err: any) {
            throw new ValidationError(err?.message || 'Falha ao enviar email de teste');
        }
    });

    // POST /api/notifications/test-telegram
    app.post('/test-telegram', {
        schema: {
            tags: ['Notifications'],
            summary: 'Enviar Telegram de teste (somente para o admin logado)',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const adminId = (request as any).user?.sub as string | undefined;
        if (!adminId) throw new ValidationError('Admin inválido');

        try {
            await notificationsService.sendTestTelegram(adminId);
            return reply.send({ success: true });
        } catch (err: any) {
            throw new ValidationError(err?.message || 'Falha ao enviar Telegram de teste');
        }
    });

    // GET /api/notifications/events
    app.get('/events', {
        schema: {
            tags: ['Notifications'],
            summary: 'Listar eventos de notificação (auditoria)',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const limitStr = (request.query as any)?.limit;
        const limit = Math.min(Math.max(Number(limitStr || 50), 1), 200);

        const events = await prisma.notificationEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return reply.send(events);
    });

    // GET /api/notifications/deliveries
    app.get('/deliveries', {
        schema: {
            tags: ['Notifications'],
            summary: 'Listar entregas de notificação (auditoria)',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    limit: { type: 'string' },
                },
            },
        },
    }, async (request, reply) => {
        const limitStr = (request.query as any)?.limit;
        const limit = Math.min(Math.max(Number(limitStr || 50), 1), 200);

        const deliveries = await prisma.notificationDelivery.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return reply.send(deliveries);
    });
};
