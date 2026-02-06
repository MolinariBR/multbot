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

export type CreateBotInput = z.infer<typeof createBotSchema>;
export type UpdateBotInput = z.infer<typeof updateBotSchema>;
export type ListBotsQuery = z.infer<typeof listBotsQuerySchema>;
