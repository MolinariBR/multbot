import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { mapDepixStatusToWebhookStatus } from './depix.mapper.js';

const SETTINGS_ID = 'settings';
const COMPLETED_STATUS = 'completed';
const FAILED_STATUS = 'failed';
const PROCESSING_STATUS = 'processing';
const DEFAULT_END_USER_NAME = 'Usuário Telegram';
const DEFAULT_PAYMENT_EXPIRATION_MINUTES = 30;

interface DepixDepositApiResponse {
    id?: string;
    qrCopyPaste?: string;
    qrImageUrl?: string;
    response?: {
        id?: string;
        qrCopyPaste?: string;
        qrImageUrl?: string;
    };
}

interface DepixStatusApiResponse {
    qrId: string;
    status: string;
    valueInCents: number;
    blockchainTxID?: string;
}

export interface DepixPaymentRequest {
    amount: number;
    description: string;
    customerName?: string;
    userId?: number;
}

export interface DepixPaymentResponse {
    paymentId: string;
    pixKey: string;
    qrCode: string;
    amount: number;
    expiresAt: string;
}

export interface DepixWebhookPayload {
    paymentId: string;
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    liquidAmount: number;
    txId?: string;
    payerName?: string;
    payerTaxNumber?: string;
    payerEUID?: string;
    bankTxId?: string;
    customerMessage?: string;
}

class DepixService {
    private depixApiUrl = '';
    private depixApiKey = '';

    private resolveDepixCredential(primaryValue: string | undefined, fallbackValue: string | undefined): string {
        return primaryValue || fallbackValue || '';
    }

    private mapWebhookStatusToTransactionStatus(status: DepixWebhookPayload['status']) {
        if (status === COMPLETED_STATUS) {
            return COMPLETED_STATUS;
        }

        if (status === FAILED_STATUS) {
            return FAILED_STATUS;
        }

        return PROCESSING_STATUS;
    }

    private async fetchDepixJson<T>(path: string, init?: RequestInit): Promise<T> {
        const requestHeaders = new Headers(init?.headers);
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('Authorization', `Bearer ${this.depixApiKey}`);

        const response = await fetch(`${this.depixApiUrl}${path}`, {
            ...init,
            headers: requestHeaders,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Depix API error ${response.status}: ${errorText}`);
        }

        return response.json() as Promise<T>;
    }

    private async findTransactionByPaymentId(paymentId: string) {
        return prisma.transaction.findFirst({
            where: { depixPaymentId: paymentId },
        });
    }

    private async updateTransactionFromWebhook(transactionId: string, payload: DepixWebhookPayload) {
        return prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: this.mapWebhookStatusToTransactionStatus(payload.status),
                depixAmount: payload.liquidAmount,
                completedAt: payload.status === COMPLETED_STATUS ? new Date() : null,
                payerName: payload.payerName,
                payerTaxNumber: payload.payerTaxNumber,
                payerEUID: payload.payerEUID,
                bankTxId: payload.bankTxId,
                blockchainTxId: payload.txId,
                customerMessage: payload.customerMessage,
            },
        });
    }

    private async notifyWebhookTransition(
        previousStatus: string,
        currentStatus: DepixWebhookPayload['status'],
        transactionId: string,
    ): Promise<void> {
        if (currentStatus === COMPLETED_STATUS && previousStatus !== COMPLETED_STATUS) {
            const { notifyTransactionCompleted } = await import('../notifications/notifications.service.js');
            await notifyTransactionCompleted(transactionId);
            return;
        }

        if (currentStatus === FAILED_STATUS && previousStatus !== FAILED_STATUS) {
            const { notifyTransactionFailed } = await import('../notifications/notifications.service.js');
            await notifyTransactionFailed(transactionId);
        }
    }

    private async handleTelegramConfirmation(
        botId: string,
        transactionId: string,
        payload: DepixWebhookPayload,
    ): Promise<void> {
        if (payload.status !== COMPLETED_STATUS) {
            return;
        }

        const { telegramBotManager } = await import('../telegram/telegram-bot.service.js');
        const botInstance = telegramBotManager.getBotInstance(botId);

        if (!botInstance) {
            return;
        }

        const { handlePaymentConfirmation } = await import('../telegram/handlers/payment.handler.js');
        await handlePaymentConfirmation(botInstance, transactionId, payload.liquidAmount, payload.txId);
    }

    async initialize(): Promise<void> {
        const settings = await prisma.settings.findUnique({
            where: { id: SETTINGS_ID },
            select: { depixApiUrl: true, depixApiKey: true },
        });

        const depixApiUrl = this.resolveDepixCredential(settings?.depixApiUrl, env.DEPIX_API_URL);
        const depixApiKey = this.resolveDepixCredential(settings?.depixApiKey, env.DEPIX_API_KEY);

        if (!depixApiUrl || !depixApiKey) {
            console.warn('⚠️  Depix não configurado. Configure em /api/settings (ou via .env)');
            return;
        }

        this.depixApiUrl = depixApiUrl;
        this.depixApiKey = depixApiKey;
        console.log('✅ Depix Service inicializado');
    }

    private async ensureConfigured(): Promise<void> {
        if (this.depixApiUrl && this.depixApiKey) {
            return;
        }

        await this.initialize();
        if (!this.depixApiUrl || !this.depixApiKey) {
            throw new Error('Depix não está configurado');
        }
    }

    async createPayment(paymentRequest: DepixPaymentRequest): Promise<DepixPaymentResponse> {
        await this.ensureConfigured();

        const depixPayload = {
            amountInCents: paymentRequest.amount,
            endUserFullName: paymentRequest.customerName || DEFAULT_END_USER_NAME,
        };

        const depixApiResponse = await this.fetchDepixJson<DepixDepositApiResponse>('/deposit', {
            method: 'POST',
            body: JSON.stringify(depixPayload),
        });

        const depositData = depixApiResponse.response ?? depixApiResponse;

        if (!depositData.id || !depositData.qrCopyPaste || !depositData.qrImageUrl) {
            throw new Error('Depix retornou um payload de criação de pagamento inválido');
        }

        return {
            paymentId: depositData.id,
            pixKey: depositData.qrCopyPaste,
            qrCode: depositData.qrImageUrl,
            amount: paymentRequest.amount,
            expiresAt: new Date(
                Date.now() + DEFAULT_PAYMENT_EXPIRATION_MINUTES * 60 * 1000,
            ).toISOString(),
        };
    }

    async getPaymentStatus(paymentId: string): Promise<DepixWebhookPayload> {
        await this.ensureConfigured();

        const depixStatusResponse = await this.fetchDepixJson<DepixStatusApiResponse>(
            `/deposit-status?id=${encodeURIComponent(paymentId)}`,
        );

        return {
            paymentId: depixStatusResponse.qrId,
            status: mapDepixStatusToWebhookStatus(depixStatusResponse.status),
            amount: depixStatusResponse.valueInCents,
            liquidAmount: 0,
            txId: depixStatusResponse.blockchainTxID,
        };
    }

    async handleWebhook(payload: DepixWebhookPayload): Promise<void> {
        const transaction = await this.findTransactionByPaymentId(payload.paymentId);

        if (!transaction) {
            console.warn(`⚠️  Transação não encontrada para payment ${payload.paymentId}`);
            return;
        }

        const previousStatus = transaction.status;
        const updatedTransaction = await this.updateTransactionFromWebhook(transaction.id, payload);

        await this.notifyWebhookTransition(previousStatus, payload.status, updatedTransaction.id);
        await this.handleTelegramConfirmation(transaction.botId, transaction.id, payload);
    }

    calculateSplit(amountBrl: number, splitRate: number): { merchantSplit: number; adminSplit: number } {
        const adminSplit = Math.round(amountBrl * splitRate);
        const merchantSplit = amountBrl - adminSplit;

        return { merchantSplit, adminSplit };
    }

    async sendToLiquidAddress(address: string, amountSats: number): Promise<string> {
        await this.ensureConfigured();
        console.log(`💸 Enviando ${amountSats} sats para ${address}`);

        return `liquid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
}

export const depixService = new DepixService();
