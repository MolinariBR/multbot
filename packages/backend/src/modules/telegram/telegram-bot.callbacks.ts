import type TelegramBot from 'node-telegram-bot-api';
import { processPayment } from './handlers/payment.handler.js';
import { sendUnknownUserMessage } from './telegram-bot.status.js';
import type { TelegramBotHandlerContext } from './telegram-bot.types.js';
import { messages } from './utils/messages.js';

const MARKDOWN_PARSE_MODE = 'Markdown';

const CALLBACK_PREFIX_PAY = 'pay_';
const CALLBACK_PAY_CUSTOM = 'pay_custom';
const CALLBACK_CANCEL_PAYMENT = 'cancel_payment';
const CALLBACK_BACK_TO_MENU = 'back_to_menu';

const CALLBACK_GENERIC_ERROR_MESSAGE = '❌ Erro ao processar ação. Tente novamente.';

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

function parseAmountFromPayCallback(callbackData: string): number | null {
    if (!callbackData.startsWith(CALLBACK_PREFIX_PAY)) {
        return null;
    }

    const rawAmount = callbackData.slice(CALLBACK_PREFIX_PAY.length);
    const parsedAmount = Number.parseInt(rawAmount, 10);

    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) {
        return null;
    }

    return parsedAmount;
}

function isCustomAmountCallback(callbackData: string): boolean {
    return callbackData === CALLBACK_PAY_CUSTOM || callbackData === `${CALLBACK_PREFIX_PAY}custom`;
}

async function sendMarkdownMessage(
    telegramBot: TelegramBot,
    chatId: number,
    text: string,
): Promise<void> {
    await telegramBot.sendMessage(chatId, text, {
        parse_mode: MARKDOWN_PARSE_MODE,
    });
}

async function handlePayCallback(
    context: TelegramBotHandlerContext,
    callbackQuery: TelegramBot.CallbackQuery,
    chatId: number,
    callbackData: string,
): Promise<void> {
    if (isCustomAmountCallback(callbackData)) {
        await sendMarkdownMessage(context.bot, chatId, messages.customAmount());
        return;
    }

    const amountInCents = parseAmountFromPayCallback(callbackData);
    if (!amountInCents) {
        await sendMarkdownMessage(context.bot, chatId, messages.invalidAmount());
        return;
    }

    const userId = callbackQuery.from?.id;
    if (!userId) {
        await sendUnknownUserMessage(context.bot, chatId);
        return;
    }

    await processPayment(context.bot, {
        botId: context.botId,
        chatId,
        userId,
        amountInCents,
        botConfig: {
            name: context.botConfig.name,
            splitRate: context.botConfig.splitRate,
        },
    });
}

async function answerCallbackQuerySafely(
    telegramBot: TelegramBot,
    callbackQueryId: string,
): Promise<void> {
    try {
        await telegramBot.answerCallbackQuery(callbackQueryId);
    } catch (error: unknown) {
        console.warn('Falha ao responder callback query', {
            callbackQueryId,
            error: getErrorMessage(error),
        });
    }
}

export function registerCallbackQueryHandler(
    context: TelegramBotHandlerContext,
    sendMainMenu: (chatId: number) => Promise<void>,
): void {
    context.bot.on('callback_query', async (callbackQuery) => {
        const chatId = callbackQuery.message?.chat.id;
        const callbackData = callbackQuery.data;

        if (!chatId || !callbackData) {
            return;
        }

        await answerCallbackQuerySafely(context.bot, callbackQuery.id);

        try {
            if (callbackData.startsWith(CALLBACK_PREFIX_PAY)) {
                await handlePayCallback(context, callbackQuery, chatId, callbackData);
                return;
            }

            if (callbackData === CALLBACK_CANCEL_PAYMENT) {
                await sendMarkdownMessage(context.bot, chatId, messages.paymentCancelled());
                return;
            }

            if (callbackData === CALLBACK_BACK_TO_MENU) {
                await sendMainMenu(chatId);
            }
        } catch (error: unknown) {
            console.error('Erro ao processar callback query', {
                botId: context.botId,
                chatId,
                callbackData,
                error: getErrorMessage(error),
            });
            await sendMarkdownMessage(context.bot, chatId, CALLBACK_GENERIC_ERROR_MESSAGE);
        }
    });
}
