import type { FastifyPluginAsync } from 'fastify';
import type { SafeParseReturnType } from 'zod';
import { ValidationError } from '../../lib/error.js';
import { mapDepixStatusToWebhookStatus } from './depix.mapper.js';
import {
    depixWebhookBodyJsonSchema,
    depixWebhookBodySchema,
    testPaymentBodyJsonSchema,
    testPaymentBodySchema,
    type DepixWebhookBodyInput,
} from './depix.schema.js';
import type { DepixWebhookPayload } from './depix.service.js';
import { depixService } from './depix.service.js';

const DEFAULT_TEST_PAYMENT_DESCRIPTION = 'Teste de pagamento';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

function parseSchemaOrThrow<T>(parsedResult: SafeParseReturnType<unknown, T>): T {
    if (parsedResult.success) {
        return parsedResult.data;
    }

    const fieldErrors = normalizeFieldErrors(parsedResult.error.flatten().fieldErrors);
    throw new ValidationError('Dados inválidos', fieldErrors);
}

function mapWebhookBodyToInternalPayload(
    depixWebhookBody: DepixWebhookBodyInput,
): DepixWebhookPayload {
    return {
        paymentId: depixWebhookBody.qrId,
        status: mapDepixStatusToWebhookStatus(depixWebhookBody.status),
        amount: depixWebhookBody.valueInCents,
        liquidAmount: 0,
        txId: depixWebhookBody.blockchainTxID,
        payerName: depixWebhookBody.payerName,
        payerTaxNumber: depixWebhookBody.payerTaxNumber,
        payerEUID: depixWebhookBody.payerEUID,
        bankTxId: depixWebhookBody.bankTxId,
        customerMessage: depixWebhookBody.customerMessage,
    };
}

export const depixRoutes: FastifyPluginAsync = async (app) => {
    app.post('/webhook', {
        schema: {
            tags: ['Depix'],
            summary: 'Webhook de notificações Depix',
            body: depixWebhookBodyJsonSchema,
        },
    }, async (request, reply) => {
        try {
            const depixWebhookBody = parseSchemaOrThrow(depixWebhookBodySchema.safeParse(request.body));
            const webhookPayload = mapWebhookBodyToInternalPayload(depixWebhookBody);

            await depixService.handleWebhook(webhookPayload);
            return reply.status(200).send({ received: true });
        } catch (error: unknown) {
            request.log.error({ error }, 'Erro ao processar webhook Depix');
            const message = error instanceof Error ? error.message : 'Erro interno do servidor';

            return reply.status(500).send({ error: message });
        }
    });

    app.post('/test-payment', {
        schema: {
            tags: ['Depix'],
            summary: 'Testar criação de pagamento Depix',
            security: [{ bearerAuth: [] }],
            body: testPaymentBodyJsonSchema,
        },
    }, async (request, reply) => {
        try {
            const testPaymentBody = parseSchemaOrThrow(testPaymentBodySchema.safeParse(request.body));
            const payment = await depixService.createPayment({
                amount: testPaymentBody.amount,
                description: testPaymentBody.description ?? DEFAULT_TEST_PAYMENT_DESCRIPTION,
            });

            return reply.send(payment);
        } catch (error: unknown) {
            request.log.error({ error }, 'Erro ao criar pagamento de teste na Depix');
            const message = error instanceof Error ? error.message : 'Erro interno do servidor';

            return reply.status(500).send({ error: message });
        }
    });
};
