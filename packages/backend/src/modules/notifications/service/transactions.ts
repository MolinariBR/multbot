import {
    buildNotificationText,
    buildTransactionPayload,
} from './domain.js';
import type { TransactionEventType } from './domain.js';
import { notifyAdminsByEmail, notifyAdminsByTelegram } from './channels.js';
import { ensureEvent, loadTransactionNotificationContext } from './store.js';

async function notifyTransactionByEventType(
    eventType: TransactionEventType,
    transactionId: string,
): Promise<void> {
    const context = await loadTransactionNotificationContext(transactionId);
    if (!context) {
        return;
    }

    const payload = buildTransactionPayload(context.transaction);
    const dedupeKey = `${eventType}:${context.transaction.id}`;
    const { id: eventId } = await ensureEvent({
        type: eventType,
        dedupeKey,
        payload,
    });

    const notificationText = buildNotificationText(eventType, payload);

    await Promise.all([
        notifyAdminsByEmail(
            eventId,
            context.admins,
            notificationText,
            context.settings.notifyEmail,
        ),
        notifyAdminsByTelegram(
            eventId,
            context.admins,
            notificationText.text,
            context.settings.notifyTelegram,
        ),
    ]);
}

export async function notifyTransactionCompleted(transactionId: string): Promise<void> {
    await notifyTransactionByEventType('transaction.completed', transactionId);
}

export async function notifyTransactionFailed(transactionId: string): Promise<void> {
    await notifyTransactionByEventType('transaction.failed', transactionId);
}
