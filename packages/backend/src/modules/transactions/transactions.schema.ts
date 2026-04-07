import { z } from 'zod';

const transactionStatusValues = ['processing', 'completed', 'failed'] as const;
const transactionSortFieldValues = ['createdAt', 'amountBrl', 'status'] as const;
const sortOrderValues = ['asc', 'desc'] as const;

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD');

export const listTransactionsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(20),
    status: z.enum(transactionStatusValues).optional(),
    botId: z.string().optional(),
    search: z.string().trim().optional().transform((value) => (value ? value : undefined)),
    dateFrom: dateOnlySchema.optional(),
    dateTo: dateOnlySchema.optional(),
    sortBy: z.enum(transactionSortFieldValues).default('createdAt'),
    sortOrder: z.enum(sortOrderValues).default('desc'),
}).superRefine((data, context) => {
    if (data.dateFrom && data.dateTo && data.dateFrom > data.dateTo) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dateFrom'],
            message: 'dateFrom não pode ser maior que dateTo',
        });
    }
});

export const transactionIdParamsSchema = z.object({
    id: z.string().min(1),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
export type ExportTransactionsQuery = Pick<
    ListTransactionsQuery,
    'status' | 'botId' | 'search' | 'dateFrom' | 'dateTo' | 'sortBy' | 'sortOrder'
>;

export function toExportTransactionsQuery(query: ListTransactionsQuery): ExportTransactionsQuery {
    const {
        status,
        botId,
        search,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
    } = query;

    return {
        status,
        botId,
        search,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
    };
}

export const listTransactionsQueryJsonSchema = {
    type: 'object',
    properties: {
        page: { type: 'string' },
        limit: { type: 'string' },
        status: { type: 'string', enum: transactionStatusValues },
        botId: { type: 'string' },
        search: { type: 'string' },
        dateFrom: { type: 'string', format: 'date' },
        dateTo: { type: 'string', format: 'date' },
        sortBy: { type: 'string', enum: transactionSortFieldValues },
        sortOrder: { type: 'string', enum: sortOrderValues },
    },
} as const;

export const transactionIdParamsJsonSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
    },
    required: ['id'],
} as const;
