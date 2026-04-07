import type { NotificationDelivery } from '@prisma/client';
import {
    MAX_DELIVERY_ATTEMPTS,
    buildNotificationText,
    normalizeRetryLimit,
    parseEventPayload,
    shouldRetryDelivery,
} from './domain.js';
import type {
    NotificationEventMap,
    RetryProcessingContext,
} from './domain.js';
import {
    addDeliveryToEmailGroup,
    retryEmailGroups,
    retryTelegramDelivery,
} from './channels.js';
import { loadEventMapByDelivery, listRetryCandidates } from './store.js';

async function processRetryableDeliveries(
    deliveries: NotificationDelivery[],
    eventMap: NotificationEventMap,
): Promise<RetryProcessingContext> {
    const processingContext: RetryProcessingContext = {
        processedTelegramDeliveries: 0,
        emailGroupsByEventId: new Map(),
    };

    for (const delivery of deliveries) {
        const event = eventMap.get(delivery.eventId);
        if (!event) {
            continue;
        }

        const payload = parseEventPayload(event.payload);
        const notificationText = buildNotificationText(event.type, payload);

        if (delivery.channel === 'email') {
            addDeliveryToEmailGroup(
                processingContext.emailGroupsByEventId,
                event.id,
                delivery.id,
                delivery.target,
                notificationText,
            );
            continue;
        }

        if (delivery.channel !== 'telegram') {
            continue;
        }

        processingContext.processedTelegramDeliveries += await retryTelegramDelivery(
            delivery,
            notificationText.text,
        );
    }

    return processingContext;
}

function filterRetryableDeliveries(
    candidates: NotificationDelivery[],
    nowTimestamp: number,
): NotificationDelivery[] {
    return candidates
        .filter((delivery) => delivery.attempts < MAX_DELIVERY_ATTEMPTS)
        .filter((delivery) => shouldRetryDelivery(delivery, nowTimestamp));
}

export async function retryPendingDeliveries(
    params?: { limit?: number },
): Promise<{ processed: number }> {
    const limit = normalizeRetryLimit(params?.limit);
    const nowTimestamp = Date.now();

    const retryCandidates = await listRetryCandidates(limit);
    if (retryCandidates.length === 0) {
        return { processed: 0 };
    }

    const retryableDeliveries = filterRetryableDeliveries(retryCandidates, nowTimestamp);
    if (retryableDeliveries.length === 0) {
        return { processed: 0 };
    }

    const eventMap = await loadEventMapByDelivery(retryableDeliveries);
    const retryProcessingContext = await processRetryableDeliveries(retryableDeliveries, eventMap);
    const processedEmailDeliveries = await retryEmailGroups(retryProcessingContext.emailGroupsByEventId);

    return {
        processed: retryProcessingContext.processedTelegramDeliveries + processedEmailDeliveries,
    };
}
