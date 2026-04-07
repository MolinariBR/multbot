import type {
    NotificationDelivery,
    NotificationEvent,
    Settings,
} from '@prisma/client';

export const DEFAULT_NOTIFY_MIN_AMOUNT = 10_000;
export const DEFAULT_RETRY_LIMIT = 50;
export const MAX_RETRY_LIMIT = 200;
export const MAX_DELIVERY_ATTEMPTS = 3;

export const DELIVERY_CHANNEL_EMAIL = 'email';
export const DELIVERY_CHANNEL_TELEGRAM = 'telegram';

export type DeliveryChannel = typeof DELIVERY_CHANNEL_EMAIL | typeof DELIVERY_CHANNEL_TELEGRAM;
export type TransactionEventType = 'transaction.completed' | 'transaction.failed';

export type AdminContact = {
    email: string;
    telegramChatId: string | null;
};

export type TransactionWithBot = {
    id: string;
    botId: string;
    bot: {
        name: string;
    };
    amountBrl: number;
    payerName: string | null;
    createdAt: Date;
    completedAt: Date | null;
};

export type TransactionNotificationPayload = {
    transactionId: string;
    botId: string;
    botName: string;
    amountBrl: number;
    payerName: string | null;
    createdAt: Date;
    completedAt: Date | null;
};

export type NotificationText = {
    subject: string;
    text: string;
};

export type EnsureEventInput = {
    type: string;
    dedupeKey?: string;
    payload: unknown;
};

export type DeliveryUpsertInput = {
    eventId: string;
    channel: DeliveryChannel;
    target: string;
};

export type RetryEmailGroup = {
    deliveryIds: string[];
    recipients: string[];
    subject: string;
    text: string;
};

export type NotificationEventRecord = Pick<NotificationEvent, 'id' | 'type' | 'payload'>;
export type NotificationEventMap = Map<string, NotificationEventRecord>;
export type NotificationSettings = Pick<Settings, 'notifyEmail' | 'notifyTelegram' | 'notifyMinAmount'>;

export type TransactionNotificationContext = {
    settings: NotificationSettings;
    transaction: TransactionWithBot;
    admins: AdminContact[];
};

export type RetryProcessingContext = {
    processedTelegramDeliveries: number;
    emailGroupsByEventId: Map<string, RetryEmailGroup>;
};

export function formatBRL(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2)}`.replace('.', ',');
}

export function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

export function safeJsonStringify(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch (error: unknown) {
        return JSON.stringify({ serializationError: toErrorMessage(error) });
    }
}

export function parseEventPayload(payload: string): Record<string, unknown> {
    try {
        const parsedPayload = JSON.parse(payload);
        if (parsedPayload && typeof parsedPayload === 'object') {
            return parsedPayload as Record<string, unknown>;
        }

        return { value: parsedPayload };
    } catch (error: unknown) {
        return {
            rawPayload: payload,
            parseError: toErrorMessage(error),
        };
    }
}

function parseStringValue(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseNumberValue(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function buildNotificationText(type: string, payload: Record<string, unknown>): NotificationText {
    const botDisplayName = parseStringValue(payload.botName) || parseStringValue(payload.botId) || 'N/A';
    const amountBrl = parseNumberValue(payload.amountBrl) ?? 0;
    const payerName = parseStringValue(payload.payerName);
    const transactionId = parseStringValue(payload.transactionId) || 'N/A';

    if (type === 'transaction.completed') {
        const text = [
            '✅ Venda confirmada',
            `Bot: ${botDisplayName}`,
            `Valor: ${formatBRL(amountBrl)}`,
            payerName ? `Pagador: ${payerName}` : null,
            `Transação: ${transactionId}`,
        ].filter(Boolean).join('\n');

        return { subject: `Venda confirmada (${formatBRL(amountBrl)})`, text };
    }

    if (type === 'transaction.failed') {
        const text = [
            '❌ Pagamento falhou/expirou',
            `Bot: ${botDisplayName}`,
            `Valor: ${formatBRL(amountBrl)}`,
            payerName ? `Pagador: ${payerName}` : null,
            `Transação: ${transactionId}`,
        ].filter(Boolean).join('\n');

        return { subject: `Pagamento falhou (${formatBRL(amountBrl)})`, text };
    }

    return { subject: `Notificação (${type})`, text: safeJsonStringify(payload) };
}

export function buildTransactionPayload(
    transaction: TransactionWithBot,
): TransactionNotificationPayload {
    return {
        transactionId: transaction.id,
        botId: transaction.botId,
        botName: transaction.bot.name,
        amountBrl: transaction.amountBrl,
        payerName: transaction.payerName,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
    };
}

export function getMinimumAmountToNotify(settings: NotificationSettings | null): number {
    return settings?.notifyMinAmount ?? DEFAULT_NOTIFY_MIN_AMOUNT;
}

export function normalizeRetryLimit(limit?: number): number {
    return Math.min(Math.max(limit ?? DEFAULT_RETRY_LIMIT, 1), MAX_RETRY_LIMIT);
}

function getRetryBackoffMs(attempts: number): number {
    if (attempts <= 0) return 0;
    if (attempts === 1) return 60_000;
    if (attempts === 2) return 5 * 60_000;
    return 30 * 60_000;
}

export function shouldRetryDelivery(
    delivery: NotificationDelivery,
    nowTimestamp: number,
): boolean {
    const waitTimeMs = getRetryBackoffMs(delivery.attempts);
    return delivery.updatedAt.getTime() <= (nowTimestamp - waitTimeMs);
}

export function normalizeEmailRecipients(admins: AdminContact[]): string[] {
    return Array.from(
        new Set(
            admins
                .map((admin) => admin.email.trim())
                .filter((emailAddress) => emailAddress.length > 0),
        ),
    );
}

export function normalizeTelegramChatIds(admins: AdminContact[]): string[] {
    return Array.from(
        new Set(
            admins
                .map((admin) => admin.telegramChatId)
                .filter((chatId): chatId is string => Boolean(chatId)),
        ),
    );
}

export function createDeliveryStatusErrorContext(
    channel: DeliveryChannel,
    target: string,
    error: unknown,
): string {
    return `[${channel}] ${target}: ${toErrorMessage(error)}`;
}
