import { z } from 'zod';

export const createBotSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
    telegramToken: z.string().min(10, 'Token inválido'),
    ownerName: z.string().min(3, 'Nome do proprietário deve ter pelo menos 3 caracteres').max(100),
    depixAddress: z.string().min(10, 'Endereço Depix inválido'),
    splitRate: z.number().min(0).max(1).optional().default(0.10),
});

export const updateBotSchema = z.object({
    name: z.string().min(3).max(100).optional(),
    ownerName: z.string().min(3).max(100).optional(),
    depixAddress: z.string().min(10).optional(),
    splitRate: z.number().min(0).max(1).optional(),
    status: z.enum(['active', 'inactive']).optional(),
});

export const listBotsQuerySchema = z.object({
    status: z.enum(['active', 'inactive']).optional(),
    search: z.string().optional(),
});

export const botIdParamsSchema = z.object({
    id: z.string().min(1, 'ID do bot é obrigatório'),
});

export const listBotsQueryJsonSchema = {
    type: 'object',
    properties: {
        status: { type: 'string', enum: ['active', 'inactive'] },
        search: { type: 'string' },
    },
} as const;

export const botIdParamsJsonSchema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'string' },
    },
} as const;

export const createBotBodyJsonSchema = {
    type: 'object',
    required: ['name', 'telegramToken', 'ownerName', 'depixAddress'],
    properties: {
        name: { type: 'string' },
        telegramToken: { type: 'string' },
        ownerName: { type: 'string' },
        depixAddress: { type: 'string' },
        splitRate: { type: 'number' },
    },
} as const;

export const updateBotBodyJsonSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        ownerName: { type: 'string' },
        depixAddress: { type: 'string' },
        splitRate: { type: 'number' },
        status: { type: 'string', enum: ['active', 'inactive'] },
    },
} as const;

export type CreateBotInput = z.infer<typeof createBotSchema>;
export type UpdateBotInput = z.infer<typeof updateBotSchema>;
export type ListBotsQuery = z.infer<typeof listBotsQuerySchema>;
export type BotIdParams = z.infer<typeof botIdParamsSchema>;
