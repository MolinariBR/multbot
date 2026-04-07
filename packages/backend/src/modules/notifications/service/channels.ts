import type { NotificationDelivery } from '@prisma/client';
import { adminTelegramBot } from '../admin-telegram-bot.service.js';
import { isEmailConfigured, sendEmail } from '../email.service.js';
import {
    DELIVERY_CHANNEL_EMAIL,
    DELIVERY_CHANNEL_TELEGRAM,
    normalizeEmailRecipients,
    normalizeTelegramChatIds,
} from './domain.js';
import type {
    AdminContact,
    NotificationText,
    RetryEmailGroup,
} from './domain.js';
import {
    markDeliveryFailed,
    markDeliverySent,
    markManyDeliveriesAsFailed,
    markManyDeliveriesAsSent,
    upsertDelivery,
} from './store.js';

async function collectPendingEmailDeliveries(
    eventId: string,
    recipients: string[],
): Promise<Array<{ id: string; target: string }>> {
    const pendingDeliveries: Array<{ id: string; target: string }> = [];

    for (const recipient of recipients) {
        const delivery = await upsertDelivery({
            eventId,
            channel: DELIVERY_CHANNEL_EMAIL,
            target: recipient,
        });

        if (delivery.status !== 'sent') {
            pendingDeliveries.push({ id: delivery.id, target: recipient });
        }
    }

    return pendingDeliveries;
}

export async function notifyAdminsByEmail(
    eventId: string,
    admins: AdminContact[],
    notificationText: NotificationText,
    isEmailEnabled: boolean,
): Promise<void> {
    if (!isEmailEnabled) {
        return;
    }

    const recipients = normalizeEmailRecipients(admins);
    if (recipients.length === 0) {
        return;
    }

    const pendingDeliveries = await collectPendingEmailDeliveries(eventId, recipients);
    if (pendingDeliveries.length === 0) {
        return;
    }

    try {
        await sendEmail({
            to: recipients,
            subject: notificationText.subject,
            text: notificationText.text,
        });
        await markManyDeliveriesAsSent(pendingDeliveries.map(({ id }) => id));
    } catch (error: unknown) {
        await markManyDeliveriesAsFailed(pendingDeliveries, DELIVERY_CHANNEL_EMAIL, error);
    }
}

export async function notifyAdminsByTelegram(
    eventId: string,
    admins: AdminContact[],
    text: string,
    isTelegramEnabled: boolean,
): Promise<void> {
    if (!isTelegramEnabled || !adminTelegramBot.isReady()) {
        return;
    }

    const chatIds = normalizeTelegramChatIds(admins);
    for (const chatId of chatIds) {
        const delivery = await upsertDelivery({
            eventId,
            channel: DELIVERY_CHANNEL_TELEGRAM,
            target: chatId,
        });

        if (delivery.status === 'sent') {
            continue;
        }

        try {
            await adminTelegramBot.sendMessage(chatId, text);
            await markDeliverySent(delivery.id);
        } catch (error: unknown) {
            await markDeliveryFailed(delivery.id, DELIVERY_CHANNEL_TELEGRAM, chatId, error);
        }
    }
}

export async function retryTelegramDelivery(
    delivery: NotificationDelivery,
    text: string,
): Promise<number> {
    if (!adminTelegramBot.isReady()) {
        return 0;
    }

    try {
        await adminTelegramBot.sendMessage(delivery.target, text);
        await markDeliverySent(delivery.id);
    } catch (error: unknown) {
        await markDeliveryFailed(
            delivery.id,
            DELIVERY_CHANNEL_TELEGRAM,
            delivery.target,
            error,
        );
    }

    return 1;
}

export function addDeliveryToEmailGroup(
    groupsByEventId: Map<string, RetryEmailGroup>,
    eventId: string,
    deliveryId: string,
    target: string,
    notificationText: NotificationText,
): void {
    const existingGroup = groupsByEventId.get(eventId);

    if (!existingGroup) {
        groupsByEventId.set(eventId, {
            deliveryIds: [deliveryId],
            recipients: [target],
            subject: notificationText.subject,
            text: notificationText.text,
        });
        return;
    }

    existingGroup.deliveryIds.push(deliveryId);
    existingGroup.recipients.push(target);
}

async function retryEmailGroup(group: RetryEmailGroup): Promise<number> {
    if (!isEmailConfigured()) {
        return 0;
    }

    const uniqueRecipients = Array.from(new Set(group.recipients));

    try {
        await sendEmail({
            to: uniqueRecipients,
            subject: group.subject,
            text: group.text,
        });
        await markManyDeliveriesAsSent(group.deliveryIds);
    } catch (error: unknown) {
        await markManyDeliveriesAsFailed(
            group.deliveryIds.map((deliveryId) => ({
                id: deliveryId,
                target: uniqueRecipients.join(', '),
            })),
            DELIVERY_CHANNEL_EMAIL,
            error,
        );
    }

    return group.deliveryIds.length;
}

export async function retryEmailGroups(
    groupsByEventId: Map<string, RetryEmailGroup>,
): Promise<number> {
    let processedEmailDeliveries = 0;

    for (const group of groupsByEventId.values()) {
        processedEmailDeliveries += await retryEmailGroup(group);
    }

    return processedEmailDeliveries;
}
