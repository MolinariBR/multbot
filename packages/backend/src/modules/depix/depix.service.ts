import { prisma } from '../../lib/prisma.js';

interface DepixPaymentRequest {
    amount: number; // em centavos
    description: string;
    customerName?: string;
    userId?: number; // Telegram user ID para gerar EUID
}

interface DepixPaymentResponse {
    paymentId: string;
    pixKey: string;
    qrCode: string;
    amount: number;
    expiresAt: string;
}

interface DepixWebhookPayload {
    paymentId: string;
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    liquidAmount: number; // em satoshis
    txId?: string;
}

class DepixService {
    private apiUrl: string = '';
    private apiKey: string = '';

    async initialize(): Promise<void> {
        const settings = await prisma.settings.findUnique({
            where: { id: 'settings' },
        });

        if (!settings?.depixApiUrl || !settings?.depixApiKey) {
            console.warn('⚠️  Depix não configurado. Configure em /api/settings');
            return;
        }

        this.apiUrl = settings.depixApiUrl;
        this.apiKey = settings.depixApiKey;

        console.log('✅ Depix Service inicializado');
    }

    async createPayment(request: DepixPaymentRequest): Promise<DepixPaymentResponse> {
        if (!this.apiUrl || !this.apiKey) {
            throw new Error('Depix não está configurado');
        }

        try {
            const payload = {
                amountInCents: request.amount,
                endUserFullName: request.customerName || 'Usuário Telegram',
                // Não enviar EUID - deixar a Depix gerar automaticamente
            };

            console.log('📤 Enviando para Depix:', JSON.stringify(payload, null, 2));

            // Criar depósito na API Depix
            const response = await fetch(`${this.apiUrl}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Depix API error ${response.status}: ${errorText}`);
            }

            const data = await response.json() as any;

            console.log('📥 Resposta da Depix:', JSON.stringify(data, null, 2));

            // A resposta vem dentro de data.response
            const depositData = data.response || data;

            // Mapear resposta da Depix para o formato esperado
            const depixResponse: DepixPaymentResponse = {
                paymentId: depositData.id,
                pixKey: depositData.qrCopyPaste,
                qrCode: depositData.qrImageUrl,
                amount: request.amount,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min padrão
            };

            console.log(`💳 Pagamento Depix criado: ${depixResponse.paymentId}`);
            return depixResponse;

        } catch (error) {
            console.error('❌ Erro ao criar pagamento Depix:', error);
            throw error;
        }
    }

    async getPaymentStatus(paymentId: string): Promise<DepixWebhookPayload> {
        if (!this.apiUrl || !this.apiKey) {
            throw new Error('Depix não está configurado');
        }

        try {
            const response = await fetch(`${this.apiUrl}/deposit-status?id=${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Depix API error ${response.status}: ${errorText}`);
            }

            const data = await response.json() as any;

            // Mapear status da Depix para o formato esperado
            const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
                'pending': 'pending',
                'pending_pix2fa': 'pending',
                'depix_sent': 'completed',
                'under_review': 'pending',
                'canceled': 'failed',
                'error': 'failed',
                'refunded': 'failed',
                'expired': 'failed',
                'delayed': 'pending',
            };

            return {
                paymentId: data.qrId,
                status: statusMap[data.status] || 'pending',
                amount: data.valueInCents,
                liquidAmount: 0, // Será preenchido quando disponível
                txId: data.blockchainTxID,
            };

        } catch (error) {
            console.error('❌ Erro ao consultar pagamento Depix:', error);
            throw error;
        }
    }

    async handleWebhook(payload: DepixWebhookPayload): Promise<void> {
        try {
            console.log('📥 Webhook Depix recebido:', payload);

            // Buscar transação pelo depixPaymentId
            const transaction = await prisma.transaction.findFirst({
                where: {
                    depixPaymentId: payload.paymentId,
                },
                include: {
                    bot: true,
                },
            });

            if (!transaction) {
                console.warn(`⚠️  Transação não encontrada para payment ${payload.paymentId}`);
                return;
            }

            // Atualizar status da transação
            const updatedTransaction = await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: payload.status === 'completed' ? 'completed' :
                        payload.status === 'failed' ? 'failed' : 'processing',
                    depixAmount: payload.liquidAmount,
                    completedAt: payload.status === 'completed' ? new Date() : null,
                },
            });

            console.log(`✅ Transação ${transaction.id} atualizada: ${payload.status}`);

            // Se pagamento foi confirmado, processar confirmação
            if (payload.status === 'completed') {
                const { telegramBotManager } = await import('../telegram/telegram-bot.service.js');
                const { handlePaymentConfirmation } = await import('../telegram/handlers/payment.handler.js');

                const botInstance = telegramBotManager.getBotInstance(transaction.botId);

                if (botInstance) {
                    await handlePaymentConfirmation(
                        botInstance,
                        transaction.id,
                        payload.liquidAmount,
                        payload.txId
                    );
                }
            }

            // TODO: Processar split de pagamento
            // TODO: Enviar para endereço Liquid do merchant

        } catch (error) {
            console.error('❌ Erro ao processar webhook Depix:', error);
            throw error;
        }
    }

    async calculateSplit(amountBrl: number, splitRate: number): Promise<{
        merchantSplit: number;
        adminSplit: number;
    }> {
        const adminSplit = Math.round(amountBrl * splitRate);
        const merchantSplit = amountBrl - adminSplit;

        return {
            merchantSplit,
            adminSplit,
        };
    }

    async sendToLiquidAddress(address: string, amountSats: number): Promise<string> {
        if (!this.apiUrl || !this.apiKey) {
            throw new Error('Depix não está configurado');
        }

        try {
            // TODO: Implementar envio real via Depix
            console.log(`💸 Enviando ${amountSats} sats para ${address}`);

            const mockTxId = `liquid_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            return mockTxId;

            /* Implementação real:
            const response = await fetch(`${this.apiUrl}/transfers`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
              },
              body: JSON.stringify({
                address,
                amount: amountSats,
                asset: 'L-BTC',
              }),
            });
      
            if (!response.ok) {
              throw new Error(`Depix API error: ${response.status}`);
            }
      
            const data = await response.json();
            return data.txId;
            */
        } catch (error) {
            console.error('❌ Erro ao enviar para Liquid:', error);
            throw error;
        }
    }
}

export const depixService = new DepixService();
