import type TelegramBot from 'node-telegram-bot-api';

export type TelegramBotConfig = {
    name: string;
    ownerName: string;
    depixAddress: string;
    splitRate: number;
};

export type TelegramBotHandlerContext = {
    botId: string;
    bot: TelegramBot;
    botConfig: TelegramBotConfig;
};
