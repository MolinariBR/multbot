import { prisma } from '../../lib/prisma.js';
import { NotFoundError } from '../../lib/error.js';
import type { ListTransactionsQuery } from './transactions.schema.js';

export async function listTransactions(query: ListTransactionsQuery) {
    const { page, limit, status, botId, search, dateFrom, dateTo, sortBy, sortOrder } = query;

    const where: any = {};

    if (status) {
        where.status = status;
    }

    if (botId) {
        where.botId = botId;
    }

    if (search) {
        where.OR = [
            { id: { contains: search } },
            { customerName: { contains: search } },
            { bot: { name: { contains: search } } },
        ];
    }

    if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) {
            where.createdAt.gte = new Date(dateFrom);
        }
        if (dateTo) {
            where.createdAt.lte = new Date(dateTo + 'T23:59:59');
        }
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                bot: {
                    select: { name: true, telegramUsername: true },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    return {
        data: transactions.map(t => ({
            id: t.id,
            botId: t.botId,
            botName: t.bot.name,
            customerName: t.customerName,
            amountBrl: t.amountBrl,
            depixAmount: t.depixAmount,
            merchantSplit: t.merchantSplit,
            adminSplit: t.adminSplit,
            pixKey: t.pixKey ? t.pixKey.slice(0, 10) + '...' : null,
            status: t.status,
            createdAt: t.createdAt,
            completedAt: t.completedAt,
        })),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getTransaction(id: string) {
    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
            bot: true,
        },
    });

    if (!transaction) {
        throw new NotFoundError('Transação não encontrada');
    }

    return {
        ...transaction,
        bot: {
            ...transaction.bot,
            telegramToken: transaction.bot.telegramToken.slice(0, 10) + '***',
        },
    };
}

export async function exportTransactions(query: Omit<ListTransactionsQuery, 'page' | 'limit'>) {
    const where: any = {};

    if (query.status) {
        where.status = query.status;
    }

    if (query.botId) {
        where.botId = query.botId;
    }

    if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) {
            where.createdAt.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
            where.createdAt.lte = new Date(query.dateTo + 'T23:59:59');
        }
    }

    const transactions = await prisma.transaction.findMany({
        where,
        include: {
            bot: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Gerar CSV
    const headers = ['ID', 'Bot', 'Cliente', 'Valor (R$)', 'Merchant', 'Admin', 'Status', 'Data'];
    const rows = transactions.map(t => [
        t.id,
        t.bot.name,
        t.customerName || '',
        (t.amountBrl / 100).toFixed(2),
        (t.merchantSplit / 100).toFixed(2),
        (t.adminSplit / 100).toFixed(2),
        t.status,
        t.createdAt.toISOString(),
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
}
