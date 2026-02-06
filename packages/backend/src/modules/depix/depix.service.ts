import { prisma } from '../../lib/prisma.js';

interface DepixPaymentRequest {
    amount: number; // em centavos
    description: string;
    customerName?: string;
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
            // TODO: Implementar chamada real à API Depix
            // Por enquanto, retornamos dados mockados para desenvolvimento

            const mockResponse: DepixPaymentResponse = {
                paymentId: `depix_${Date.now()}`,
                pixKey: '00020126580014br.gov.bcb.pix0136' + Math.random().toString(36).substring(7),
                qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=mock',
                amount: request.amount,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
            };

            console.log(`💳 Pagamento Depix criado: ${mockResponse.paymentId}`);
            return mockResponse;

            /* Implementação real:
            const response = await fetch(`${this.apiUrl}/payments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
              },
              body: JSON.stringify({
                amount: request.amount,
                currency: 'BRL',
                description: request.description,
                customer_name: request.customerName,
              }),
            });
      
            if (!response.ok) {
              throw new Error(`Depix API error: ${response.status}`);
            }
      
            return await response.json();
            */
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
            // TODO: Implementar chamada real à API Depix
            const mockResponse: DepixWebhookPayload = {
                paymentId,
                status: 'pending',
                amount: 10000, // R$ 100,00
                liquidAmount: 30000, // 30000 sats
            };

            return mockResponse;

            /* Implementação real:
            const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
              },
            });
      
            if (!response.ok) {
              throw new Error(`Depix API error: ${response.status}`);
            }
      
            return await response.json();
            */
        } catch (error) {
            console.error('❌ Erro ao consultar pagamento Depix:', error);
            throw error;
        }
    }

    async handleWebhook(payload: DepixWebhookPayload): Promise<void> {
        try {
            console.log('📥 Webhook Depix recebido:', payload);

            // Buscar transação pelo paymentId
            // TODO: Adicionar campo depixPaymentId na tabela Transaction
            const transaction = await prisma.transaction.findFirst({
                where: {
                    // depixPaymentId: payload.paymentId,
                    id: payload.paymentId, // Temporário
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
