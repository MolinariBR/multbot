import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

class AdminTelegramBotService {
    private bot: TelegramBot | null = null;

    initialize(): void {
        const token = env.TELEGRAM_ADMIN_BOT_TOKEN || '';
        if (!token) {
            console.warn('⚠️  TELEGRAM_ADMIN_BOT_TOKEN não configurado. Notificações por Telegram (admin) desativadas.');
            return;
        }

        if (this.bot) return;

        this.bot = new TelegramBot(token, { polling: true });

        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            await this.bot!.sendMessage(
                chatId,
                [
                    '🤖 Bot Admin (Zydra)',
                    '',
                    'Para vincular este chat a um admin:',
                    '1) No painel, gere um código em Configurações',
                    '2) Aqui, envie: /link SEU_CODIGO',
                    '',
                    `Seu chatId: ${chatId}`,
                ].join('\n')
            );
        });

        this.bot.onText(/\/link\s+([A-Z0-9]{6,12})/i, async (msg, match) => {
            const chatId = msg.chat.id;
            const code = (match?.[1] || '').toUpperCase();

            try {
                const pairing = await prisma.adminTelegramPairing.findUnique({
                    where: { code },
                    include: { admin: true },
                });

                if (!pairing) {
                    await this.bot!.sendMessage(chatId, '❌ Código inválido.');
                    return;
                }
                if (pairing.usedAt) {
                    await this.bot!.sendMessage(chatId, '❌ Este código já foi usado. Gere um novo no painel.');
                    return;
                }
                if (pairing.expiresAt.getTime() < Date.now()) {
                    await this.bot!.sendMessage(chatId, '❌ Código expirado. Gere um novo no painel.');
                    return;
                }

                await prisma.$transaction([
                    prisma.admin.update({
                        where: { id: pairing.adminId },
                        data: {
                            telegramChatId: String(chatId),
                            telegramLinkedAt: new Date(),
                        },
                    }),
                    prisma.adminTelegramPairing.update({
                        where: { id: pairing.id },
                        data: { usedAt: new Date() },
                    }),
                ]);

                await this.bot!.sendMessage(
                    chatId,
                    `✅ Vinculado com sucesso ao admin: ${pairing.admin.email}`
                );
            } catch (err: any) {
                console.error('Erro ao vincular Telegram admin:', err?.message || err);
                await this.bot!.sendMessage(chatId, '❌ Erro interno ao vincular. Tente novamente.');
            }
        });

        this.bot.on('polling_error', (error) => {
            console.error('❌ Erro de polling no bot admin:', error);
        });

        console.log('✅ Bot Admin Telegram inicializado');
    }

    isReady(): boolean {
        return Boolean(this.bot);
    }

    async sendMessage(chatId: string, text: string): Promise<void> {
        if (!this.bot) {
            throw new Error('Bot admin Telegram não inicializado');
        }
        await this.bot.sendMessage(Number(chatId), text, { disable_web_page_preview: true });
    }
}

export const adminTelegramBot = new AdminTelegramBotService();

