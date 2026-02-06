import type { FastifyPluginAsync } from 'fastify';
import { depixService } from './depix.service.js';
import { prisma } from '../../lib/prisma.js';

export const depixRoutes: FastifyPluginAsync = async (app) => {
    // Webhook do Depix (não requer autenticação JWT)
    app.post('/webhook', {
        schema: {
            tags: ['Depix'],
            summary: 'Webhook de notificações Depix',
            body: {
                type: 'object',
                properties: {
                    webhookType: { type: 'string' },
                    qrId: { type: 'string' },
                    status: { type: 'string' },
                    valueInCents: { type: 'number' },
                    pixKey: { type: 'string' },
                    payerName: { type: 'string' },
                    payerTaxNumber: { type: 'string' },
                    payerEUID: { type: 'string' },
                    bankTxId: { type: 'string' },
                    blockchainTxID: { type: 'string' },
                    customerMessage: { type: 'string' },
                    expiration: { type: 'string' },
                },
                required: ['webhookType', 'qrId', 'status', 'valueInCents'],
            },
        },
    }, async (request, reply) => {
        try {
            // TODO: Validar assinatura do webhook com DEPIX_WEBHOOK_SECRET

            const payload = request.body as any;

            // Mapear payload da Depix para o formato interno
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

            const internalPayload = {
                paymentId: payload.qrId,
                status: statusMap[payload.status] || 'pending',
                amount: payload.valueInCents,
                liquidAmount: 0, // Depix não envia isso no webhook
                txId: payload.blockchainTxID,

                // Informações do Pagador
                payerName: payload.payerName,
                payerTaxNumber: payload.payerTaxNumber,
                payerEUID: payload.payerEUID,
                bankTxId: payload.bankTxId,
                customerMessage: payload.customerMessage,
            };

            await depixService.handleWebhook(internalPayload);

            return reply.status(200).send({ received: true });
        } catch (error) {
            console.error('Erro ao processar webhook Depix:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // Endpoint para testar criação de pagamento (protegido)
    app.post('/test-payment', {
        schema: {
            tags: ['Depix'],
            summary: 'Testar criação de pagamento Depix',
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    amount: { type: 'number' },
                    description: { type: 'string' },
                },
                required: ['amount'],
            },
        },
    }, async (request, reply) => {
        try {
            const { amount, description } = request.body as any;

            const payment = await depixService.createPayment({
                amount,
                description: description || 'Teste de pagamento',
            });

            return reply.send(payment);
        } catch (error: any) {
            return reply.status(500).send({ error: error.message });
        }
    });
};
