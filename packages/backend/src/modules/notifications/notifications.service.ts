import { randomBytes } from 'crypto';
import { prisma } from '../../lib/prisma.js';
import { adminTelegramBot } from './admin-telegram-bot.service.js';
import * as emailService from './email.service.js';

function formatBRL(cents: number): string {
    return `R$ ${(cents / 100).toFixed(2)}`.replace('.', ',');
}

function safeJsonStringify(obj: any): string {
    try {
        return JSON.stringify(obj);
    } catch {
        return JSON.stringify({ error: 'payload_unserializable' });
    }
}

export async function createTelegramPairingCode(adminId: string): Promise<{ code: string; expiresAt: Date }> {
    // Invalidate old unused codes for this admin (best-effort).
    await prisma.adminTelegramPairing.updateMany({
        where: { adminId, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
    });

    const code = randomBytes(4).toString('hex').toUpperCase(); // 8 chars
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.adminTelegramPairing.create({
        data: { adminId, code, expiresAt },
    });

    return { code, expiresAt };
}

async function ensureEvent(params: {
    type: string;
    dedupeKey?: string;
    payload: any;
}): Promise<{ id: string; created: boolean }> {
    const payloadStr = safeJsonStringify(params.payload);

    if (params.dedupeKey) {
        try {
            const event = await prisma.notificationEvent.upsert({
                where: { dedupeKey: params.dedupeKey },
                update: {},
                create: {
                    type: params.type,
                    dedupeKey: params.dedupeKey,
                    payload: payloadStr,
                },
            });
            // If it existed, payload won't update; that's fine for dedupe.
            const created = event.createdAt.getTime() > (Date.now() - 1000); // heuristic; not perfect but ok
            return { id: event.id, created };
        } catch {
            // If upsert fails for any reason, fallback to plain create.
        }
    }

    const event = await prisma.notificationEvent.create({
        data: { type: params.type, dedupeKey: params.dedupeKey, payload: payloadStr },
    });

    return { id: event.id, created: true };
}

async function upsertDelivery(params: {
    eventId: string;
    channel: 'email' | 'telegram';
    target: string;
}): Promise<{ id: string; status: string; attempts: number }> {
    const delivery = await prisma.notificationDelivery.upsert({
        where: {
            eventId_channel_target: {
                eventId: params.eventId,
                channel: params.channel,
                target: params.target,
            },
        },
        update: {},
        create: {
            eventId: params.eventId,
            channel: params.channel,
            target: params.target,
            status: 'pending',
            attempts: 0,
        },
    });

    return { id: delivery.id, status: delivery.status, attempts: delivery.attempts };
}

async function markDeliverySent(id: string) {
    await prisma.notificationDelivery.update({
        where: { id },
        data: { status: 'sent', sentAt: new Date() },
    });
}

async function markDeliveryFailed(id: string, err: any) {
    await prisma.notificationDelivery.update({
        where: { id },
        data: {
            status: 'failed',
            attempts: { increment: 1 },
            lastError: String(err?.message || err),
        },
    });
}

export async function notifyTransactionCompleted(transactionId: string): Promise<void> {
    const [settings, tx, admins] = await Promise.all([
        prisma.settings.findUnique({ where: { id: 'settings' } }),
        prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { bot: true },
        }),
        prisma.admin.findMany({
            select: { email: true, telegramChatId: true, name: true },
        }),
    ]);

    if (!tx) return;

    const notifyMinAmount = settings?.notifyMinAmount ?? 10000;
    if (tx.amountBrl < notifyMinAmount) return;

    const dedupeKey = `transaction.completed:${tx.id}`;
    const payload = {
        transactionId: tx.id,
        botId: tx.botId,
        botName: tx.bot.name,
        amountBrl: tx.amountBrl,
        payerName: tx.payerName || null,
        createdAt: tx.createdAt,
        completedAt: tx.completedAt,
    };

    const { id: eventId } = await ensureEvent({
        type: 'transaction.completed',
        dedupeKey,
        payload,
    });

    const text = [
        '✅ Venda confirmada',
        `Bot: ${tx.bot.name}`,
        `Valor: ${formatBRL(tx.amountBrl)}`,
        tx.payerName ? `Pagador: ${tx.payerName}` : null,
        `Transação: ${tx.id}`,
    ].filter(Boolean).join('\n');

    // Email
    if (settings?.notifyEmail) {
        const emails = admins.map(a => a.email).filter(Boolean);
        const pendingDeliveries: string[] = [];
        for (const email of emails) {
            const delivery = await upsertDelivery({ eventId, channel: 'email', target: email });
            if (delivery.status !== 'sent') pendingDeliveries.push(delivery.id);
        }

        if (pendingDeliveries.length > 0) {
            try {
                await emailService.sendEmail({
                    to: emails,
                    subject: `Venda confirmada (${formatBRL(tx.amountBrl)})`,
                    text,
                });
                for (const id of pendingDeliveries) {
                    await markDeliverySent(id);
                }
            } catch (err) {
                for (const id of pendingDeliveries) {
                    await markDeliveryFailed(id, err);
                }
            }
        }
    }

    // Telegram
    if (settings?.notifyTelegram && adminTelegramBot.isReady()) {
        const chatIds = admins.map(a => a.telegramChatId).filter(Boolean) as string[];
        for (const chatId of chatIds) {
            const delivery = await upsertDelivery({ eventId, channel: 'telegram', target: chatId });
            if (delivery.status === 'sent') continue;
            try {
                await adminTelegramBot.sendMessage(chatId, text);
                await markDeliverySent(delivery.id);
            } catch (err) {
                await markDeliveryFailed(delivery.id, err);
            }
        }
    }
}

export async function sendTestEmail(adminId: string): Promise<void> {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin?.email) throw new Error('Admin sem email');

    const { id: eventId } = await ensureEvent({
        type: 'test.email',
        payload: { adminId },
    });

    const delivery = await upsertDelivery({ eventId, channel: 'email', target: admin.email });
    try {
        await emailService.sendEmail({
            to: [admin.email],
            subject: 'Teste de Email (Zydra)',
            text: '✅ Teste de envio de email OK.',
        });
        await markDeliverySent(delivery.id);
    } catch (err) {
        await markDeliveryFailed(delivery.id, err);
        throw err;
    }
}

export async function sendTestTelegram(adminId: string): Promise<void> {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin?.telegramChatId) throw new Error('Admin não vinculado ao Telegram');

    const { id: eventId } = await ensureEvent({
        type: 'test.telegram',
        payload: { adminId },
    });

    const delivery = await upsertDelivery({ eventId, channel: 'telegram', target: admin.telegramChatId });
    try {
        await adminTelegramBot.sendMessage(admin.telegramChatId, '✅ Teste de notificação Telegram OK.');
        await markDeliverySent(delivery.id);
    } catch (err) {
        await markDeliveryFailed(delivery.id, err);
        throw err;
    }
}
