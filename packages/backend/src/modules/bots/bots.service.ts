import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/error.js';
import type { CreateBotInput, UpdateBotInput, ListBotsQuery } from './bots.schema.js';

export async function listBots(query: ListBotsQuery) {
    const where: any = {};

    if (query.status) {
        where.status = query.status;
    }

    if (query.search) {
        where.OR = [
            { name: { contains: query.search } },
            { ownerName: { contains: query.search } },
            { telegramUsername: { contains: query.search } },
        ];
    }

    const bots = await prisma.bot.findMany({
        where,
        include: {
            transactions: {
                where: { status: 'completed' },
                select: { amountBrl: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return bots.map(bot => ({
        id: bot.id,
        name: bot.name,
        telegramToken: bot.telegramToken.slice(0, 10) + '***', // Ocultar token
        telegramUsername: bot.telegramUsername,
        ownerName: bot.ownerName,
        depixAddress: bot.depixAddress,
        splitRate: bot.splitRate,
        status: bot.status,
        totalRevenue: bot.transactions.reduce((sum, t) => sum + t.amountBrl, 0),
        transactionsCount: bot.transactions.length,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt,
    }));
}

export async function getBot(id: string) {
    const bot = await prisma.bot.findUnique({
        where: { id },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!bot) {
        throw new NotFoundError('Bot não encontrado');
    }

    // Calcular stats
    const allTransactions = await prisma.transaction.findMany({
        where: { botId: id, status: 'completed' },
        select: { amountBrl: true, createdAt: true },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRevenue = allTransactions
        .filter(t => t.createdAt >= todayStart)
        .reduce((sum, t) => sum + t.amountBrl, 0);

    const weekRevenue = allTransactions
        .filter(t => t.createdAt >= weekStart)
        .reduce((sum, t) => sum + t.amountBrl, 0);

    const monthRevenue = allTransactions
        .filter(t => t.createdAt >= monthStart)
        .reduce((sum, t) => sum + t.amountBrl, 0);

    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amountBrl, 0);
    const avgTicket = allTransactions.length > 0
        ? Math.round(totalRevenue / allTransactions.length)
        : 0;

    return {
        ...bot,
        telegramToken: bot.telegramToken.slice(0, 10) + '***',
        totalRevenue,
        transactionsCount: allTransactions.length,
        stats: {
            todayRevenue,
            weekRevenue,
            monthRevenue,
            avgTicket,
        },
    };
}

export async function createBot(input: CreateBotInput) {
    // Verificar se token já existe
    const existing = await prisma.bot.findUnique({
        where: { telegramToken: input.telegramToken },
    });

    if (existing) {
        throw new ConflictError('Token do Telegram já está em uso');
    }

    // TODO: Validar token com Telegram API (getMe)

    const bot = await prisma.bot.create({
        data: {
            name: input.name,
            telegramToken: input.telegramToken,
            ownerName: input.ownerName,
            depixAddress: input.depixAddress,
            splitRate: input.splitRate,
        },
    });

    return {
        ...bot,
        telegramToken: bot.telegramToken.slice(0, 10) + '***',
        totalRevenue: 0,
        transactionsCount: 0,
    };
}

export async function updateBot(id: string, input: UpdateBotInput) {
    const existing = await prisma.bot.findUnique({ where: { id } });

    if (!existing) {
        throw new NotFoundError('Bot não encontrado');
    }

    const bot = await prisma.bot.update({
        where: { id },
        data: input,
    });

    return {
        ...bot,
        telegramToken: bot.telegramToken.slice(0, 10) + '***',
    };
}

export async function deleteBot(id: string) {
    const existing = await prisma.bot.findUnique({ where: { id } });

    if (!existing) {
        throw new NotFoundError('Bot não encontrado');
    }

    // Soft delete: apenas marca como inativo
    await prisma.bot.update({
        where: { id },
        data: { status: 'inactive' },
    });
}
