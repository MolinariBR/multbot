import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

type AdminTelegramPairingWithAdmin = {
    id: string;
    adminId: string;
    usedAt: Date | null;
    expiresAt: Date;
    admin: {
        email: string;
    };
};

class AdminTelegramBotService {
    private bot: TelegramBot | null = null;

    private getBotOrThrow(): TelegramBot {
        if (!this.bot) {
            throw new Error('Bot admin Telegram não inicializado');
        }

        return this.bot;
    }

    private getAdminBotToken(): string {
        return env.TELEGRAM_ADMIN_BOT_TOKEN || '';
    }

    private registerStartCommandHandler(): void {
        this.getBotOrThrow().onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;

            await this.getBotOrThrow().sendMessage(
                chatId,
                [
                    '🤖 Bot Admin (Zydra)',
                    '',
                    'Para vincular este chat a um admin:',
                    '1) No painel, gere um código em Configurações',
                    '2) Aqui, envie: /link SEU_CODIGO',
                    '',
                    `Seu chatId: ${chatId}`,
                ].join('\n'),
            );
        });
    }

    private async getPairingWithAdmin(code: string): Promise<AdminTelegramPairingWithAdmin | null> {
        const pairing = await prisma.adminTelegramPairing.findUnique({
            where: { code },
            include: { admin: true },
        });

        return pairing as AdminTelegramPairingWithAdmin | null;
    }

    private async sendInvalidPairingMessage(chatId: number, pairing: AdminTelegramPairingWithAdmin | null): Promise<boolean> {
        if (!pairing) {
            await this.getBotOrThrow().sendMessage(chatId, '❌ Código inválido.');
            return true;
        }

        if (pairing.usedAt) {
            await this.getBotOrThrow().sendMessage(chatId, '❌ Este código já foi usado. Gere um novo no painel.');
            return true;
        }

        if (pairing.expiresAt.getTime() < Date.now()) {
            await this.getBotOrThrow().sendMessage(chatId, '❌ Código expirado. Gere um novo no painel.');
            return true;
        }

        return false;
    }

    private async linkAdminChat(pairing: AdminTelegramPairingWithAdmin, chatId: number): Promise<void> {
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
    }

    private registerLinkCommandHandler(): void {
        this.getBotOrThrow().onText(/\/link\s+([A-Z0-9]{6,12})/i, async (msg, match) => {
            const chatId = msg.chat.id;
            const code = (match?.[1] || '').toUpperCase();

            try {
                const pairing = await this.getPairingWithAdmin(code);
                const hasInvalidPairing = await this.sendInvalidPairingMessage(chatId, pairing);

                if (hasInvalidPairing || !pairing) {
                    return;
                }

                await this.linkAdminChat(pairing, chatId);
                await this.getBotOrThrow().sendMessage(
                    chatId,
                    `✅ Vinculado com sucesso ao admin: ${pairing.admin.email}`,
                );
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
                console.error('Erro ao vincular Telegram admin', { error: errorMessage, chatId, code });
                await this.getBotOrThrow().sendMessage(chatId, '❌ Erro interno ao vincular. Tente novamente.');
            }
        });
    }

    private registerPollingErrorHandler(): void {
        this.getBotOrThrow().on('polling_error', (error) => {
            console.error('❌ Erro de polling no bot admin:', error);
        });
    }

    initialize(): void {
        const adminBotToken = this.getAdminBotToken();

        if (!adminBotToken) {
            console.warn(
                '⚠️ TELEGRAM_ADMIN_BOT_TOKEN não configurado. ' +
                'Notificações por Telegram (admin) desativadas.',
            );
            return;
        }

        if (this.bot) {
            return;
        }

        this.bot = new TelegramBot(adminBotToken, { polling: true });
        this.registerStartCommandHandler();
        this.registerLinkCommandHandler();
        this.registerPollingErrorHandler();

        console.log('✅ Bot Admin Telegram inicializado');
    }

    isReady(): boolean {
        return Boolean(this.bot);
    }

    async sendMessage(chatId: string, text: string): Promise<void> {
        const chatIdNumber = Number(chatId);
        if (!Number.isInteger(chatIdNumber)) {
            throw new Error(`chatId inválido para Telegram: ${chatId}`);
        }

        await this.getBotOrThrow().sendMessage(chatIdNumber, text, {
            disable_web_page_preview: true,
        });
    }
}

export const adminTelegramBot = new AdminTelegramBotService();
