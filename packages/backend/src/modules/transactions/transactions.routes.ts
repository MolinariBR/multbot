import type { FastifyPluginAsync } from 'fastify';
import { ValidationError } from '../../lib/error.js';
import {
    exportTransactions,
    getTransaction,
    listTransactions,
} from './transactions.service.js';
import {
    listTransactionsQueryJsonSchema,
    listTransactionsQuerySchema,
    toExportTransactionsQuery,
    transactionIdParamsJsonSchema,
    transactionIdParamsSchema,
} from './transactions.schema.js';

function normalizeFieldErrors(
    fieldErrors: Record<string, string[] | undefined>,
): Record<string, string[]> {
    return Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors ?? []]),
    );
}

function parseQueryOrThrow(query: unknown) {
    const parsedQuery = listTransactionsQuerySchema.safeParse(query);
    if (parsedQuery.success) {
        return parsedQuery.data;
    }

    throw new ValidationError(
        'Dados inválidos',
        normalizeFieldErrors(parsedQuery.error.flatten().fieldErrors),
    );
}

function parseTransactionParamsOrThrow(params: unknown): { id: string } {
    const parsedParams = transactionIdParamsSchema.safeParse(params);
    if (parsedParams.success) {
        return parsedParams.data;
    }

    throw new ValidationError(
        'Parâmetros inválidos',
        normalizeFieldErrors(parsedParams.error.flatten().fieldErrors),
    );
}

function buildExportFileName(date: Date): string {
    const dateString = date.toISOString().split('T')[0];
    return `transactions_${dateString}.csv`;
}

export const transactionsRoutes: FastifyPluginAsync = async (app) => {
    app.get('/', {
        schema: {
            tags: ['Transactions'],
            summary: 'Listar transações',
            security: [{ bearerAuth: [] }],
            querystring: listTransactionsQueryJsonSchema,
        },
    }, async (request, reply) => {
        const query = parseQueryOrThrow(request.query);
        const result = await listTransactions(query);
        return reply.send(result);
    });

    app.get('/export', {
        schema: {
            tags: ['Transactions'],
            summary: 'Exportar transações CSV',
            security: [{ bearerAuth: [] }],
            querystring: listTransactionsQueryJsonSchema,
        },
    }, async (request, reply) => {
        const listQuery = parseQueryOrThrow(request.query);
        const exportQuery = toExportTransactionsQuery(listQuery);
        const csv = await exportTransactions(exportQuery);
        const filename = buildExportFileName(new Date());

        return reply
            .header('Content-Type', 'text/csv')
            .header('Content-Disposition', `attachment; filename="${filename}"`)
            .send(csv);
    });

    app.get('/:id', {
        schema: {
            tags: ['Transactions'],
            summary: 'Detalhes de uma transação',
            security: [{ bearerAuth: [] }],
            params: transactionIdParamsJsonSchema,
        },
    }, async (request, reply) => {
        const { id } = parseTransactionParamsOrThrow(request.params);
        const transaction = await getTransaction(id);
        return reply.send(transaction);
    });
};
