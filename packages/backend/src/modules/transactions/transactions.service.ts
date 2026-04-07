import { Prisma } from '@prisma/client';
import { NotFoundError } from '../../lib/error.js';
import { prisma } from '../../lib/prisma.js';
import { buildTransactionsCsv } from './transactions.csv.js';
import { mapTransactionDetails, mapTransactionSummary } from './transactions.mapper.js';
import { buildTransactionsOrderBy, buildTransactionsWhereClause } from './transactions.query.js';
import type {
    ExportTransactionsQuery,
    ListTransactionsQuery,
} from './transactions.schema.js';

const transactionListInclude = Prisma.validator<Prisma.TransactionInclude>()({
    bot: {
        select: {
            name: true,
            telegramUsername: true,
        },
    },
});

const transactionDetailsInclude = Prisma.validator<Prisma.TransactionInclude>()({
    bot: true,
});

const transactionExportInclude = Prisma.validator<Prisma.TransactionInclude>()({
    bot: {
        select: {
            name: true,
        },
    },
});

export async function listTransactions(query: ListTransactionsQuery) {
    const where = buildTransactionsWhereClause(query);
    const orderBy = buildTransactionsOrderBy(query.sortBy, query.sortOrder);
    const skip = (query.page - 1) * query.limit;

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: transactionListInclude,
            orderBy,
            skip,
            take: query.limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    return {
        data: transactions.map(mapTransactionSummary),
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
        },
    };
}

export async function getTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: transactionDetailsInclude,
    });

    if (!transaction) {
        throw new NotFoundError('Transação não encontrada');
    }

    return mapTransactionDetails(transaction);
}

export async function exportTransactions(query: ExportTransactionsQuery): Promise<string> {
    const where = buildTransactionsWhereClause(query);
    const orderBy = buildTransactionsOrderBy(query.sortBy, query.sortOrder);

    const transactions = await prisma.transaction.findMany({
        where,
        include: transactionExportInclude,
        orderBy,
    });

    return buildTransactionsCsv(transactions);
}
