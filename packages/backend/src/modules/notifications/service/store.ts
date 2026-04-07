import type { NotificationDelivery } from '@prisma/client';
import { prisma } from '../../../lib/prisma.js';
import {
    createDeliveryStatusErrorContext,
    getMinimumAmountToNotify,
    MAX_DELIVERY_ATTEMPTS,
    safeJsonStringify,
} from './domain.js';
import type {
    DeliveryChannel,
    DeliveryUpsertInput,
    EnsureEventInput,
    NotificationEventMap,
    TransactionNotificationContext,
} from './domain.js';

export async function ensureEvent(input: EnsureEventInput): Promise<{ id: string }> {
    const payload = safeJsonStringify(input.payload);

    if (input.dedupeKey) {
        const event = await prisma.notificationEvent.upsert({
            where: { dedupeKey: input.dedupeKey },
            update: {},
            create: {
                type: input.type,
                dedupeKey: input.dedupeKey,
                payload,
            },
        });

        return { id: event.id };
    }

    const event = await prisma.notificationEvent.create({
        data: {
            type: input.type,
            dedupeKey: input.dedupeKey,
            payload,
        },
    });

    return { id: event.id };
}

export async function upsertDelivery(
    input: DeliveryUpsertInput,
): Promise<Pick<NotificationDelivery, 'id' | 'status'>> {
    return prisma.notificationDelivery.upsert({
        where: {
            eventId_channel_target: {
                eventId: input.eventId,
                channel: input.channel,
                target: input.target,
            },
        },
        update: {},
        create: {
            eventId: input.eventId,
            channel: input.channel,
            target: input.target,
            status: 'pending',
            attempts: 0,
        },
        select: {
            id: true,
            status: true,
        },
    });
}

export async function markDeliverySent(deliveryId: string): Promise<void> {
    await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
            status: 'sent',
            sentAt: new Date(),
        },
    });
}

export async function markDeliveryFailed(
    deliveryId: string,
    channel: DeliveryChannel,
    target: string,
    error: unknown,
): Promise<void> {
    await prisma.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
            status: 'failed',
            attempts: { increment: 1 },
            lastError: createDeliveryStatusErrorContext(channel, target, error),
        },
    });
}

export async function markManyDeliveriesAsSent(deliveryIds: string[]): Promise<void> {
    for (const deliveryId of deliveryIds) {
        await markDeliverySent(deliveryId);
    }
}

export async function markManyDeliveriesAsFailed(
    deliveryTargets: Array<{ id: string; target: string }>,
    channel: DeliveryChannel,
    error: unknown,
): Promise<void> {
    for (const deliveryTarget of deliveryTargets) {
        await markDeliveryFailed(deliveryTarget.id, channel, deliveryTarget.target, error);
    }
}

export async function loadTransactionNotificationContext(
    transactionId: string,
): Promise<TransactionNotificationContext | null> {
    const [settingsRecord, transaction, admins] = await Promise.all([
        prisma.settings.findUnique({
            where: { id: 'settings' },
            select: {
                notifyEmail: true,
                notifyTelegram: true,
                notifyMinAmount: true,
            },
        }),
        prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                bot: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.admin.findMany({
            select: {
                email: true,
                telegramChatId: true,
            },
        }),
    ]);

    if (!transaction) {
        return null;
    }

    const minimumAmountToNotify = getMinimumAmountToNotify(settingsRecord);
    if (transaction.amountBrl < minimumAmountToNotify) {
        return null;
    }

    return {
        settings: {
            notifyEmail: settingsRecord?.notifyEmail ?? false,
            notifyTelegram: settingsRecord?.notifyTelegram ?? false,
            notifyMinAmount: minimumAmountToNotify,
        },
        transaction,
        admins,
    };
}

export async function loadEventMapByDelivery(
    deliveries: NotificationDelivery[],
): Promise<NotificationEventMap> {
    const eventIds = Array.from(new Set(deliveries.map((delivery) => delivery.eventId)));
    if (eventIds.length === 0) {
        return new Map();
    }

    const events = await prisma.notificationEvent.findMany({
        where: {
            id: {
                in: eventIds,
            },
        },
        select: {
            id: true,
            type: true,
            payload: true,
        },
    });

    return new Map(events.map((event) => [event.id, event]));
}

export async function listRetryCandidates(limit: number): Promise<NotificationDelivery[]> {
    return prisma.notificationDelivery.findMany({
        where: {
            status: {
                in: ['pending', 'failed'],
            },
            attempts: {
                lt: MAX_DELIVERY_ATTEMPTS,
            },
        },
        orderBy: {
            updatedAt: 'asc',
        },
        take: limit,
    });
}

export async function findAdminEmail(adminId: string): Promise<string | null> {
    const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { email: true },
    });

    return admin?.email ?? null;
}

export async function findAdminTelegramChatId(adminId: string): Promise<string | null> {
    const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { telegramChatId: true },
    });

    return admin?.telegramChatId ?? null;
}
