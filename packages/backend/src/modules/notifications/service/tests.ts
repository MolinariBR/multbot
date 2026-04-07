import { adminTelegramBot } from '../admin-telegram-bot.service.js';
import { sendEmail } from '../email.service.js';
import {
    DELIVERY_CHANNEL_EMAIL,
    DELIVERY_CHANNEL_TELEGRAM,
} from './domain.js';
import {
    ensureEvent,
    findAdminEmail,
    findAdminTelegramChatId,
    markDeliveryFailed,
    markDeliverySent,
    upsertDelivery,
} from './store.js';

export async function sendTestEmail(adminId: string): Promise<void> {
    const email = await findAdminEmail(adminId);
    if (!email) {
        throw new Error('Admin sem email');
    }

    const { id: eventId } = await ensureEvent({
        type: 'test.email',
        payload: { adminId },
    });

    const delivery = await upsertDelivery({
        eventId,
        channel: DELIVERY_CHANNEL_EMAIL,
        target: email,
    });

    try {
        await sendEmail({
            to: [email],
            subject: 'Teste de Email (Zydra)',
            text: '✅ Teste de envio de email OK.',
        });
        await markDeliverySent(delivery.id);
    } catch (error: unknown) {
        await markDeliveryFailed(delivery.id, DELIVERY_CHANNEL_EMAIL, email, error);
        throw error;
    }
}

export async function sendTestTelegram(adminId: string): Promise<void> {
    const telegramChatId = await findAdminTelegramChatId(adminId);
    if (!telegramChatId) {
        throw new Error('Admin não vinculado ao Telegram');
    }

    const { id: eventId } = await ensureEvent({
        type: 'test.telegram',
        payload: { adminId },
    });

    const delivery = await upsertDelivery({
        eventId,
        channel: DELIVERY_CHANNEL_TELEGRAM,
        target: telegramChatId,
    });

    try {
        await adminTelegramBot.sendMessage(telegramChatId, '✅ Teste de notificação Telegram OK.');
        await markDeliverySent(delivery.id);
    } catch (error: unknown) {
        await markDeliveryFailed(
            delivery.id,
            DELIVERY_CHANNEL_TELEGRAM,
            telegramChatId,
            error,
        );
        throw error;
    }
}
