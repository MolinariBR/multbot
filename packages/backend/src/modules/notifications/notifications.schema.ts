import { z } from 'zod';

export const limitQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const pairingCodeResponseJsonSchema = {
    type: 'object',
    properties: {
        code: { type: 'string' },
        expiresAt: { type: 'string' },
    },
    required: ['code', 'expiresAt'],
} as const;

export const successResponseJsonSchema = {
    type: 'object',
    properties: {
        success: { type: 'boolean' },
    },
    required: ['success'],
} as const;

export const limitQueryJsonSchema = {
    type: 'object',
    properties: {
        limit: { type: 'string' },
    },
} as const;
