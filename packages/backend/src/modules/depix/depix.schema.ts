import { z } from 'zod';

export const depixWebhookBodySchema = z.object({
    webhookType: z.string(),
    qrId: z.string(),
    status: z.string(),
    valueInCents: z.number().int().nonnegative(),
    pixKey: z.string().optional(),
    payerName: z.string().optional(),
    payerTaxNumber: z.string().optional(),
    payerEUID: z.string().optional(),
    bankTxId: z.string().optional(),
    blockchainTxID: z.string().optional(),
    customerMessage: z.string().optional(),
    expiration: z.string().optional(),
});

export const testPaymentBodySchema = z.object({
    amount: z.number().int().positive(),
    description: z.string().min(1).optional(),
});

export const depixWebhookBodyJsonSchema = {
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
} as const;

export const testPaymentBodyJsonSchema = {
    type: 'object',
    properties: {
        amount: { type: 'number' },
        description: { type: 'string' },
    },
    required: ['amount'],
} as const;

export type DepixWebhookBodyInput = z.infer<typeof depixWebhookBodySchema>;
export type TestPaymentBodyInput = z.infer<typeof testPaymentBodySchema>;
