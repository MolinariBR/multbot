import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../lib/prisma.js';
import { registerTelegramBotHandlers } from './telegram-bot.handlers.js';
import type { TelegramBotConfig } from './telegram-bot.types.js';

const ACTIVE_BOT_STATUS = 'active';
const INVALID_TOKEN_MARKER = 'EXAMPLE';
const MIN_TELEGRAM_TOKEN_LENGTH = 30;

type BotDatabaseRecord = {
    id: string;
    name: string;
    ownerName: string;
    depixAddress: string;
    splitRate: number;
    telegramToken: string;
    status: string;
};

interface BotInstance {
    botId: string;
    bot: TelegramBot;
    config: TelegramBotConfig;
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

function isValidTelegramToken(telegramToken: string): boolean {
    const normalizedToken = telegramToken.trim();

    return (
        normalizedToken.length >= MIN_TELEGRAM_TOKEN_LENGTH
        && !normalizedToken.includes(INVALID_TOKEN_MARKER)
    );
}

class TelegramBotManager {
    private readonly botInstances = new Map<string, BotInstance>();

    async initializeBot(botId: string): Promise<void> {
        try {
            const botRecord = await this.loadBotRecordOrThrow(botId);
            if (!this.shouldInitializeBot(botRecord)) {
                return;
            }

            const botInstance = this.createBotInstance(botRecord);
            this.botInstances.set(botId, botInstance);

            registerTelegramBotHandlers({
                botId,
                bot: botInstance.bot,
                botConfig: botInstance.config,
            });

            await this.persistTelegramUsername(botRecord.id, botRecord.name, botInstance.bot);
        } catch (error: unknown) {
            this.logInitializationError(botId, error);
        }
    }

    async initializeAllBots(): Promise<void> {
        try {
            const activeBots = await prisma.bot.findMany({
                where: { status: ACTIVE_BOT_STATUS },
                select: { id: true },
            });

            console.log(`🤖 Inicializando ${activeBots.length} bot(s)...`);

            for (const activeBot of activeBots) {
                await this.initializeBot(activeBot.id);
            }

            console.log('✅ Todos os bots foram inicializados');
        } catch (error: unknown) {
            console.error('Erro ao inicializar bots ativos', {
                error: getErrorMessage(error),
            });
        }
    }

    async stopBot(botId: string): Promise<void> {
        const botInstance = this.botInstances.get(botId);
        if (!botInstance) {
            return;
        }

        await botInstance.bot.stopPolling();
        this.botInstances.delete(botId);
        console.log(`🛑 Bot ${botInstance.config.name} parado`);
    }

    async stopAllBots(): Promise<void> {
        console.log('🛑 Parando todos os bots...');

        for (const botId of this.botInstances.keys()) {
            await this.stopBot(botId);
        }
    }

    getBotInstance(botId: string): TelegramBot | undefined {
        return this.botInstances.get(botId)?.bot;
    }

    getAllBots(): Map<string, BotInstance> {
        return this.botInstances;
    }

    private async loadBotRecordOrThrow(botId: string): Promise<BotDatabaseRecord> {
        const botRecord = await prisma.bot.findUnique({
            where: { id: botId },
            select: {
                id: true,
                name: true,
                ownerName: true,
                depixAddress: true,
                splitRate: true,
                telegramToken: true,
                status: true,
            },
        });

        if (!botRecord) {
            throw new Error(`Bot com id ${botId} não foi encontrado`);
        }

        return botRecord;
    }

    private shouldInitializeBot(botRecord: BotDatabaseRecord): boolean {
        if (botRecord.status !== ACTIVE_BOT_STATUS) {
            console.log(`Bot ${botRecord.name} está inativo e não será inicializado`);
            return false;
        }

        if (!isValidTelegramToken(botRecord.telegramToken)) {
            console.warn(`Bot ${botRecord.name} possui token inválido e não será inicializado`);
            return false;
        }

        return true;
    }

    private createBotInstance(botRecord: BotDatabaseRecord): BotInstance {
        return {
            botId: botRecord.id,
            bot: new TelegramBot(botRecord.telegramToken, { polling: true }),
            config: {
                name: botRecord.name,
                ownerName: botRecord.ownerName,
                depixAddress: botRecord.depixAddress,
                splitRate: botRecord.splitRate,
            },
        };
    }

    private async persistTelegramUsername(
        botId: string,
        botName: string,
        telegramBot: TelegramBot,
    ): Promise<void> {
        const botProfile = await telegramBot.getMe();
        const telegramUsername = botProfile.username ? `@${botProfile.username}` : null;

        await prisma.bot.update({
            where: { id: botId },
            data: { telegramUsername },
        });

        const usernameLabel = telegramUsername ?? 'sem username público';
        console.log(`✅ Bot ${botName} (${usernameLabel}) inicializado`);
    }

    private logInitializationError(botId: string, error: unknown): void {
        console.error('Erro ao inicializar bot', {
            botId,
            error: getErrorMessage(error),
        });
    }
}

export const telegramBotManager = new TelegramBotManager();
