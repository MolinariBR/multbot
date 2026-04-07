import { Prisma } from '@prisma/client';
import type {
    ExportTransactionsQuery,
    ListTransactionsQuery,
} from './transactions.schema.js';

type TransactionFilters = Pick<
    ExportTransactionsQuery,
    'status' | 'botId' | 'search' | 'dateFrom' | 'dateTo'
>;

function buildDateFilter(dateFrom?: string, dateTo?: string): Prisma.DateTimeFilter | undefined {
    if (!dateFrom && !dateTo) {
        return undefined;
    }

    const dateFilter: Prisma.DateTimeFilter = {};

    if (dateFrom) {
        dateFilter.gte = new Date(`${dateFrom}T00:00:00.000`);
    }

    if (dateTo) {
        dateFilter.lte = new Date(`${dateTo}T23:59:59.999`);
    }

    return dateFilter;
}

export function buildTransactionsWhereClause(
    filters: TransactionFilters,
): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = {};

    if (filters.status) {
        where.status = filters.status;
    }

    if (filters.botId) {
        where.botId = filters.botId;
    }

    if (filters.search) {
        where.OR = [
            { id: { contains: filters.search } },
            { customerName: { contains: filters.search } },
            { bot: { name: { contains: filters.search } } },
        ];
    }

    const createdAtFilter = buildDateFilter(filters.dateFrom, filters.dateTo);
    if (createdAtFilter) {
        where.createdAt = createdAtFilter;
    }

    return where;
}

export function buildTransactionsOrderBy(
    sortBy: ListTransactionsQuery['sortBy'],
    sortOrder: ListTransactionsQuery['sortOrder'],
): Prisma.TransactionOrderByWithRelationInput {
    if (sortBy === 'amountBrl') {
        return { amountBrl: sortOrder };
    }

    if (sortBy === 'status') {
        return { status: sortOrder };
    }

    return { createdAt: sortOrder };
}
