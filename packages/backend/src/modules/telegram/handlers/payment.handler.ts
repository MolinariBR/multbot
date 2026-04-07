import type TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../../lib/prisma.js';
import { depixService } from '../../depix/depix.service.js';
import { messages, formatBRL, formatExpiration } from '../utils/messages.js';
import { generateQRCodeBuffer } from '../utils/qrcode.js';

const TRANSACTION_STATUS_PROCESSING = 'processing';
const TRANSACTION_STATUS_COMPLETED = 'completed';
const TRANSACTION_STATUS_FAILED = 'failed';
const MARKDOWN_PARSE_MODE = 'Markdown';

interface PaymentContext {
    botId: string;
    chatId: number;
    userId: number;
    amountInCents: number;
    botConfig: {
        name: string;
        splitRate: number;
    };
}

interface ExpirationCheckInput {
    telegramBot: TelegramBot;
    chatId: number;
    transactionId: string;
    expiresAt: Date;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
    return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function parseTelegramChatId(telegramUserId: string | null): number | null {
    if (!telegramUserId) {
        return null;
    }

    const chatId = Number(telegramUserId);
    return Number.isInteger(chatId) ? chatId : null;
}

async function createDepixPayment(context: PaymentContext) {
    return depixService.createPayment({
        amount: context.amountInCents,
        description: `Pagamento via ${context.botConfig.name}`,
        customerName: `Telegram User ${context.userId}`,
        userId: context.userId,
    });
}

async function createProcessingTransaction(
    context: PaymentContext,
    depixPaymentId: string,
    pixKey: string,
    splitRate: number,
): Promise<{ id: string }> {
    const paymentSplit = depixService.calculateSplit(context.amountInCents, splitRate);

    return prisma.transaction.create({
        data: {
            botId: context.botId,
            telegramUserId: String(context.userId),
            depixPaymentId,
            amountBrl: context.amountInCents,
            depixAmount: 0,
            merchantSplit: paymentSplit.merchantSplit,
            adminSplit: paymentSplit.adminSplit,
            pixKey,
            status: TRANSACTION_STATUS_PROCESSING,
        },
        select: { id: true },
    });
}

async function sendPaymentQrCode(
    telegramBot: TelegramBot,
    chatId: number,
    amountInCents: number,
    pixKey: string,
    expiresAt: string,
): Promise<void> {
    const qrCodeBuffer = await generateQRCodeBuffer(pixKey);

    await telegramBot.sendPhoto(chatId, qrCodeBuffer, {
        caption: messages.paymentGenerated(
            formatBRL(amountInCents),
            pixKey,
            formatExpiration(expiresAt),
        ),
        parse_mode: MARKDOWN_PARSE_MODE,
    });
}

async function markTransactionAsCompleted(
    transactionId: string,
    depixAmount: number,
    blockchainTransactionId?: string,
): Promise<void> {
    await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            status: TRANSACTION_STATUS_COMPLETED,
            depixAmount,
            completedAt: new Date(),
            blockchainTxId: blockchainTransactionId,
        },
    });
}

async function notifyPaymentConfirmation(
    telegramBot: TelegramBot,
    transaction: {
        id: string;
        amountBrl: number;
        telegramUserId: string | null;
    },
): Promise<void> {
    const chatId = parseTelegramChatId(transaction.telegramUserId);
    if (!chatId) {
        return;
    }

    await telegramBot.sendMessage(
        chatId,
        messages.paymentConfirmed(formatBRL(transaction.amountBrl), transaction.id),
        { parse_mode: MARKDOWN_PARSE_MODE },
    );
}

async function expireProcessingTransaction(
    telegramBot: TelegramBot,
    chatId: number,
    transactionId: string,
): Promise<void> {
    const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        select: { status: true },
    });

    if (!transaction || transaction.status !== TRANSACTION_STATUS_PROCESSING) {
        return;
    }

    await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: TRANSACTION_STATUS_FAILED },
    });

    await telegramBot.sendMessage(chatId, messages.paymentExpired(), {
        parse_mode: MARKDOWN_PARSE_MODE,
    });
}

function scheduleExpirationCheck(input: ExpirationCheckInput): void {
    const millisecondsUntilExpiration = input.expiresAt.getTime() - Date.now();
    if (millisecondsUntilExpiration <= 0) {
        return;
    }

    const timer = setTimeout(async () => {
        try {
            await expireProcessingTransaction(input.telegramBot, input.chatId, input.transactionId);
        } catch (error: unknown) {
            const errorMessage = getErrorMessage(error, 'erro desconhecido');
            console.error('Erro ao verificar expiração do pagamento', {
                transactionId: input.transactionId,
                chatId: input.chatId,
                error: errorMessage,
            });
        }
    }, millisecondsUntilExpiration);

    timer.unref?.();
}

export async function processPayment(
    telegramBot: TelegramBot,
    context: PaymentContext,
): Promise<void> {
    try {
        await telegramBot.sendMessage(context.chatId, messages.processing(), {
            parse_mode: MARKDOWN_PARSE_MODE,
        });

        const depixPayment = await createDepixPayment(context);
        const transaction = await createProcessingTransaction(
            context,
            depixPayment.paymentId,
            depixPayment.pixKey,
            context.botConfig.splitRate,
        );

        await sendPaymentQrCode(
            telegramBot,
            context.chatId,
            context.amountInCents,
            depixPayment.pixKey,
            depixPayment.expiresAt,
        );

        console.log(`✅ Pagamento criado: ${transaction.id} - ${formatBRL(context.amountInCents)}`);

        scheduleExpirationCheck({
            telegramBot,
            chatId: context.chatId,
            transactionId: transaction.id,
            expiresAt: new Date(depixPayment.expiresAt),
        });
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, 'Erro ao gerar pagamento. Tente novamente.');
        console.error('Erro ao processar pagamento', {
            botId: context.botId,
            chatId: context.chatId,
            userId: context.userId,
            error: errorMessage,
        });

        await telegramBot.sendMessage(context.chatId, messages.error(errorMessage), {
            parse_mode: MARKDOWN_PARSE_MODE,
        });
    }
}

export async function handlePaymentConfirmation(
    telegramBot: TelegramBot,
    transactionId: string,
    depixAmount: number,
    blockchainTransactionId?: string,
): Promise<void> {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            select: {
                id: true,
                amountBrl: true,
                status: true,
                depixAmount: true,
                blockchainTxId: true,
                telegramUserId: true,
            },
        });

        if (!transaction) {
            console.warn(`Transação ${transactionId} não encontrada ao confirmar pagamento`);
            return;
        }

        const shouldUpdateTransaction = (
            transaction.status !== TRANSACTION_STATUS_COMPLETED
            || transaction.depixAmount !== depixAmount
            || (Boolean(blockchainTransactionId) && !transaction.blockchainTxId)
        );

        if (shouldUpdateTransaction) {
            await markTransactionAsCompleted(transaction.id, depixAmount, blockchainTransactionId);
        }

        await notifyPaymentConfirmation(telegramBot, transaction);
        console.log(`✅ Pagamento confirmado: ${transactionId}`);
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, 'erro desconhecido');
        console.error('Erro ao processar confirmação de pagamento', {
            transactionId,
            depixAmount,
            blockchainTransactionId,
            error: errorMessage,
        });
    }
}

export async function cancelPayment(
    telegramBot: TelegramBot,
    chatId: number,
    transactionId: string,
): Promise<void> {
    try {
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: TRANSACTION_STATUS_FAILED },
        });

        await telegramBot.sendMessage(chatId, messages.paymentCancelled(), {
            parse_mode: MARKDOWN_PARSE_MODE,
        });

        console.log(`❌ Pagamento cancelado: ${transactionId}`);
    } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, 'erro desconhecido');
        console.error('Erro ao cancelar pagamento', {
            transactionId,
            chatId,
            error: errorMessage,
        });
    }
}
