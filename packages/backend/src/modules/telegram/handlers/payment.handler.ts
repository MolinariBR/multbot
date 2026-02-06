import type TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../../lib/prisma.js';
import { depixService } from '../../depix/depix.service.js';
import { generateQRCodeBuffer } from '../utils/qrcode.js';
import { messages, formatBRL, formatExpiration } from '../utils/messages.js';

interface PaymentContext {
    botId: string;
    chatId: number;
    userId: number;
    amountInCents: number;
    botConfig: {
        name: string;
        ownerName: string;
        depixAddress: string;
        splitRate: number;
    };
}

/**
 * Processa pagamento completo
 */
export async function processPayment(
    bot: TelegramBot,
    context: PaymentContext
): Promise<void> {
    const { botId, chatId, userId, amountInCents, botConfig } = context;

    try {
        // 1. Enviar mensagem de processamento
        await bot.sendMessage(chatId, messages.processing());

        // 2. Criar pagamento na Depix
        const depixPayment = await depixService.createPayment({
            amount: amountInCents,
            description: `Pagamento via ${botConfig.name}`,
            customerName: `Telegram User ${userId}`,
            userId: userId,
        });

        // 3. Calcular split
        const split = await depixService.calculateSplit(amountInCents, botConfig.splitRate);

        // 4. Criar transação no banco
        const transaction = await prisma.transaction.create({
            data: {
                botId,
                telegramUserId: userId.toString(),
                depixPaymentId: depixPayment.paymentId,
                amountBrl: amountInCents,
                depixAmount: 0, // Será atualizado quando o pagamento for confirmado
                merchantSplit: split.merchantSplit,
                adminSplit: split.adminSplit,
                pixKey: depixPayment.pixKey,
                status: 'processing',
            },
        });

        // 5. Gerar QR Code
        const qrCodeBuffer = await generateQRCodeBuffer(depixPayment.pixKey);

        // 6. Enviar QR Code para o usuário
        await bot.sendPhoto(chatId, qrCodeBuffer, {
            caption: messages.paymentGenerated(
                formatBRL(amountInCents),
                depixPayment.pixKey,
                formatExpiration(depixPayment.expiresAt)
            ),
            parse_mode: 'Markdown',
        });

        console.log(`✅ Pagamento criado: ${transaction.id} - ${formatBRL(amountInCents)}`);

        // 7. Iniciar monitoramento de expiração (opcional)
        scheduleExpirationCheck(bot, chatId, transaction.id, new Date(depixPayment.expiresAt));

    } catch (error: any) {
        console.error('❌ Erro ao processar pagamento:', error);

        // Enviar mensagem de erro ao usuário
        await bot.sendMessage(
            chatId,
            messages.error(error.message || 'Erro ao gerar pagamento. Tente novamente.')
        );
    }
}

/**
 * Agenda verificação de expiração do pagamento
 */
function scheduleExpirationCheck(
    bot: TelegramBot,
    chatId: number,
    transactionId: string,
    expiresAt: Date
): void {
    const now = new Date();
    const timeUntilExpiration = expiresAt.getTime() - now.getTime();

    // Se já expirou, não agendar
    if (timeUntilExpiration <= 0) return;

    // Agendar notificação de expiração
    setTimeout(async () => {
        try {
            // Verificar se o pagamento ainda está pendente
            const transaction = await prisma.transaction.findUnique({
                where: { id: transactionId },
            });

            if (transaction && transaction.status === 'processing') {
                // Atualizar status para failed
                await prisma.transaction.update({
                    where: { id: transactionId },
                    data: { status: 'failed' },
                });

                // Notificar usuário
                await bot.sendMessage(chatId, messages.paymentExpired());
            }
        } catch (error) {
            console.error('Erro ao verificar expiração:', error);
        }
    }, timeUntilExpiration);
}

/**
 * Processa confirmação de pagamento (chamado pelo webhook)
 */
export async function handlePaymentConfirmation(
    bot: TelegramBot,
    transactionId: string,
    depixAmount: number,
    txId?: string
): Promise<void> {
    try {
        // 1. Buscar transação
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { bot: true },
        });

        if (!transaction) {
            console.error(`Transação ${transactionId} não encontrada`);
            return;
        }

        // 2. Atualizar transação
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'completed',
                depixAmount,
                completedAt: new Date(),
            },
        });

        // 3. Processar split e enviar para merchant
        // TODO: Implementar envio de L-BTC para o endereço do merchant
        // await depixService.sendToLiquidAddress(
        //     transaction.bot.depixAddress,
        //     transaction.merchantSplit
        // );

        // 4. Notificar usuário via Telegram
        // TODO: Recuperar chatId do usuário (precisa salvar no banco)
        // await bot.sendMessage(
        //     chatId,
        //     messages.paymentConfirmed(
        //         formatBRL(transaction.amountBrl),
        //         transaction.id
        //     )
        // );

        console.log(`✅ Pagamento confirmado: ${transactionId}`);

    } catch (error) {
        console.error('❌ Erro ao processar confirmação:', error);
    }
}

/**
 * Cancela pagamento
 */
export async function cancelPayment(
    bot: TelegramBot,
    chatId: number,
    transactionId: string
): Promise<void> {
    try {
        // Atualizar status
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'failed' },
        });

        // Notificar usuário
        await bot.sendMessage(chatId, messages.paymentCancelled());

        console.log(`❌ Pagamento cancelado: ${transactionId}`);

    } catch (error) {
        console.error('Erro ao cancelar pagamento:', error);
    }
}
