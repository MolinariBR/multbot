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
                    paymentId: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
                    amount: { type: 'number' },
                    liquidAmount: { type: 'number' },
                    txId: { type: 'string' },
                },
                required: ['paymentId', 'status', 'amount', 'liquidAmount'],
            },
        },
    }, async (request, reply) => {
        try {
            // TODO: Validar assinatura do webhook com DEPIX_WEBHOOK_SECRET

            const payload = request.body as any;
            await depixService.handleWebhook(payload);

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
