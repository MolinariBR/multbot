import type { FastifyPluginAsync } from 'fastify';
import { listTransactionsQuerySchema } from './transactions.schema.js';
import * as transactionsService from './transactions.service.js';

export const transactionsRoutes: FastifyPluginAsync = async (app) => {
    // GET /api/transactions
    app.get('/', {
        schema: {
            tags: ['Transactions'],
            summary: 'Listar transações',
            security: [{ bearerAuth: [] }],
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'string' },
                    limit: { type: 'string' },
                    status: { type: 'string', enum: ['processing', 'completed', 'failed'] },
                    botId: { type: 'string' },
                    search: { type: 'string' },
                    dateFrom: { type: 'string', format: 'date' },
                    dateTo: { type: 'string', format: 'date' },
                    sortBy: { type: 'string', enum: ['createdAt', 'amountBrl', 'status'] },
                    sortOrder: { type: 'string', enum: ['asc', 'desc'] },
                },
            },
        },
    }, async (request, reply) => {
        const query = listTransactionsQuerySchema.parse(request.query);
        const result = await transactionsService.listTransactions(query);
        return reply.send(result);
    });

    // GET /api/transactions/export
    app.get('/export', {
        schema: {
            tags: ['Transactions'],
            summary: 'Exportar transações CSV',
            security: [{ bearerAuth: [] }],
        },
    }, async (request, reply) => {
        const query = listTransactionsQuerySchema.parse(request.query);
        const csv = await transactionsService.exportTransactions(query);

        const date = new Date().toISOString().split('T')[0];
        return reply
            .header('Content-Type', 'text/csv')
            .header('Content-Disposition', `attachment; filename="transactions_${date}.csv"`)
            .send(csv);
    });

    // GET /api/transactions/:id
    app.get('/:id', {
        schema: {
            tags: ['Transactions'],
            summary: 'Detalhes de uma transação',
            security: [{ bearerAuth: [] }],
            params: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id'],
            },
        },
    }, async (request, reply) => {
        const { id } = request.params as { id: string };
        const transaction = await transactionsService.getTransaction(id);
        return reply.send(transaction);
    });
};
