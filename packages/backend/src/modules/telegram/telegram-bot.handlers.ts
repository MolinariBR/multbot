import type TelegramBot from 'node-telegram-bot-api';
import { processPayment } from './handlers/payment.handler.js';
import { mainKeyboard } from './keyboards/main.keyboard.js';
import { parsePrice, priceKeyboard } from './keyboards/price.keyboard.js';
import { registerCallbackQueryHandler } from './telegram-bot.callbacks.js';
import { sendUnknownUserMessage, sendUserPaymentStatus } from './telegram-bot.status.js';
import type { TelegramBotHandlerContext } from './telegram-bot.types.js';
import { messages } from './utils/messages.js';

const MARKDOWN_PARSE_MODE = 'Markdown';

const MENU_ACTION_START_PAYMENT = '💰 Fazer Pagamento';
const MENU_ACTION_PAYMENT_HISTORY = '📊 Meus Pagamentos';
const MENU_ACTION_HELP = '❓ Ajuda';
const MENU_ACTION_ABOUT = 'ℹ️ Sobre';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

async function sendMarkdownMessage(
    telegramBot: TelegramBot,
    chatId: number,
    text: string,
    options: TelegramBot.SendMessageOptions = {},
): Promise<void> {
    await telegramBot.sendMessage(chatId, text, {
        ...options,
        parse_mode: MARKDOWN_PARSE_MODE,
    });
}

async function startPaymentFlow(telegramBot: TelegramBot, chatId: number): Promise<void> {
    await sendMarkdownMessage(telegramBot, chatId, messages.paymentInitiated(), {
        reply_markup: priceKeyboard,
    });
}

async function sendHelpMessage(context: TelegramBotHandlerContext, chatId: number): Promise<void> {
    await sendMarkdownMessage(
        context.bot,
        chatId,
        messages.help(context.botConfig.name, context.botConfig.ownerName),
    );
}

async function sendAboutMessage(context: TelegramBotHandlerContext, chatId: number): Promise<void> {
    await sendMarkdownMessage(
        context.bot,
        chatId,
        messages.about(context.botConfig.name, context.botConfig.ownerName),
    );
}

async function sendMainMenu(context: TelegramBotHandlerContext, chatId: number): Promise<void> {
    await sendMarkdownMessage(context.bot, chatId, messages.mainMenu(), {
        reply_markup: mainKeyboard,
    });
}

async function processCustomAmountIfValid(
    context: TelegramBotHandlerContext,
    message: TelegramBot.Message,
): Promise<void> {
    const text = message.text ?? '';
    const amountInCents = parsePrice(text);

    if (!amountInCents || amountInCents <= 0) {
        return;
    }

    const userId = message.from?.id;
    if (!userId) {
        await sendUnknownUserMessage(context.bot, message.chat.id);
        return;
    }

    await processPayment(context.bot, {
        botId: context.botId,
        chatId: message.chat.id,
        userId,
        amountInCents,
        botConfig: {
            name: context.botConfig.name,
            splitRate: context.botConfig.splitRate,
        },
    });
}

async function handleMenuAction(
    context: TelegramBotHandlerContext,
    message: TelegramBot.Message,
): Promise<boolean> {
    const text = message.text;
    const chatId = message.chat.id;

    if (!text) {
        return false;
    }

    if (text === MENU_ACTION_START_PAYMENT) {
        await startPaymentFlow(context.bot, chatId);
        return true;
    }

    if (text === MENU_ACTION_PAYMENT_HISTORY) {
        await sendUserPaymentStatus({
            botId: context.botId,
            bot: context.bot,
            message,
        });
        return true;
    }

    if (text === MENU_ACTION_HELP) {
        await sendHelpMessage(context, chatId);
        return true;
    }

    if (text === MENU_ACTION_ABOUT) {
        await sendAboutMessage(context, chatId);
        return true;
    }

    return false;
}

function registerStartCommand(context: TelegramBotHandlerContext): void {
    context.bot.onText(/\/start/, async (message) => {
        await sendMarkdownMessage(context.bot, message.chat.id, messages.welcome(context.botConfig.name), {
            reply_markup: mainKeyboard,
        });
    });
}

function registerHelpCommand(context: TelegramBotHandlerContext): void {
    context.bot.onText(/\/ajuda/, async (message) => {
        await sendHelpMessage(context, message.chat.id);
    });
}

function registerPayCommand(context: TelegramBotHandlerContext): void {
    context.bot.onText(/\/pagar/, async (message) => {
        await startPaymentFlow(context.bot, message.chat.id);
    });
}

function registerStatusCommand(context: TelegramBotHandlerContext): void {
    context.bot.onText(/\/status/, async (message) => {
        await sendUserPaymentStatus({
            botId: context.botId,
            bot: context.bot,
            message,
        });
    });
}

function registerMenuMessageHandler(context: TelegramBotHandlerContext): void {
    context.bot.on('message', async (message) => {
        if (message.text?.startsWith('/')) {
            return;
        }

        const menuActionWasHandled = await handleMenuAction(context, message);
        if (menuActionWasHandled) {
            return;
        }

        await processCustomAmountIfValid(context, message);
    });
}

function registerPollingErrorHandler(context: TelegramBotHandlerContext): void {
    context.bot.on('polling_error', (error) => {
        console.error('Erro de polling do Telegram Bot', {
            botId: context.botId,
            botName: context.botConfig.name,
            error: getErrorMessage(error),
        });
    });
}

export function registerTelegramBotHandlers(context: TelegramBotHandlerContext): void {
    registerStartCommand(context);
    registerHelpCommand(context);
    registerPayCommand(context);
    registerStatusCommand(context);
    registerMenuMessageHandler(context);
    registerCallbackQueryHandler(context, (chatId) => sendMainMenu(context, chatId));
    registerPollingErrorHandler(context);
}
