import { z } from 'zod';

export const listTransactionsQuerySchema = z.object({
    page: z.string().optional().default('1').transform(Number),
    limit: z.string().optional().default('20').transform(Number),
    status: z.enum(['processing', 'completed', 'failed']).optional(),
    botId: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z.enum(['createdAt', 'amountBrl', 'status']).optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
