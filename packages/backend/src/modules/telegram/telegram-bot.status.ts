import type TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../lib/prisma.js';
import { formatBRL, formatDate, messages, type PaymentStatusItem } from './utils/messages.js';

const MARKDOWN_PARSE_MODE = 'Markdown';
const MAX_RECENT_TRANSACTIONS = 10;

const UNKNOWN_USER_MESSAGE = '❌ Não foi possível identificar o usuário.';
const STATUS_FETCH_ERROR_MESSAGE = '❌ Erro ao buscar histórico de pagamentos. Tente novamente mais tarde.';

type TransactionStatus = 'processing' | 'completed' | 'failed';

const transactionStatusLabelByStatus: Record<TransactionStatus, string> = {
    processing: 'Processando',
    completed: 'Concluído',
    failed: 'Falhou',
};

type RecentTransaction = {
    id: string;
    amountBrl: number;
    status: string;
    createdAt: Date;
};

function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return String(error);
}

function mapStatusLabel(status: string): string {
    if (status in transactionStatusLabelByStatus) {
        return transactionStatusLabelByStatus[status as TransactionStatus];
    }

    return status;
}

function mapTransactionToPaymentStatusItem(transaction: RecentTransaction): PaymentStatusItem {
    return {
        id: transaction.id,
        amount: formatBRL(transaction.amountBrl),
        status: transaction.status,
        statusLabel: mapStatusLabel(transaction.status),
        date: formatDate(transaction.createdAt),
    };
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

async function fetchRecentTransactions(telegramUserId: string): Promise<RecentTransaction[]> {
    return prisma.transaction.findMany({
        where: {
            telegramUserId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        select: {
            id: true,
            amountBrl: true,
            status: true,
            createdAt: true,
        },
        take: MAX_RECENT_TRANSACTIONS,
    });
}

export async function sendUnknownUserMessage(
    telegramBot: TelegramBot,
    chatId: number,
): Promise<void> {
    await sendMarkdownMessage(telegramBot, chatId, UNKNOWN_USER_MESSAGE);
}

export async function sendUserPaymentStatus(params: {
    botId: string;
    bot: TelegramBot;
    message: TelegramBot.Message;
}): Promise<void> {
    const { botId, bot, message } = params;
    const chatId = message.chat.id;
    const telegramUserId = message.from?.id ? String(message.from.id) : null;

    if (!telegramUserId) {
        await sendUnknownUserMessage(bot, chatId);
        return;
    }

    try {
        const recentTransactions = await fetchRecentTransactions(telegramUserId);
        const paymentStatusItems = recentTransactions.map(mapTransactionToPaymentStatusItem);
        const paymentStatusMessage = messages.paymentStatus(paymentStatusItems);

        await sendMarkdownMessage(bot, chatId, paymentStatusMessage);
    } catch (error: unknown) {
        console.error('Erro ao buscar histórico de pagamentos', {
            botId,
            chatId,
            telegramUserId,
            error: getErrorMessage(error),
        });

        await sendMarkdownMessage(bot, chatId, STATUS_FETCH_ERROR_MESSAGE);
    }
}
