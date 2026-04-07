import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { NotFoundError, ConflictError } from '../../lib/error.js';
import type { CreateBotInput, UpdateBotInput, ListBotsQuery } from './bots.schema.js';

const BOT_NOT_FOUND_ERROR_MESSAGE = 'Bot não encontrado';
const TELEGRAM_TOKEN_IN_USE_ERROR_MESSAGE = 'Token do Telegram já está em uso';
const TOKEN_VISIBLE_PREFIX_LENGTH = 10;
const TOKEN_MASK_SUFFIX = '***';
const COMPLETED_TRANSACTION_STATUS = 'completed';
const INACTIVE_BOT_STATUS = 'inactive';

type RevenueTransaction = {
    amountBrl: number;
    createdAt: Date;
};

type RevenueStats = {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    totalRevenue: number;
    avgTicket: number;
};

function maskTelegramToken(telegramToken: string): string {
    return `${telegramToken.slice(0, TOKEN_VISIBLE_PREFIX_LENGTH)}${TOKEN_MASK_SUFFIX}`;
}

function sumTransactionAmounts(transactions: Array<{ amountBrl: number }>): number {
    return transactions.reduce((sum, transaction) => sum + transaction.amountBrl, 0);
}

function buildListBotsFilters(query: ListBotsQuery): Prisma.BotWhereInput {
    const where: Prisma.BotWhereInput = {};
    const searchTerm = query.search?.trim();

    if (query.status) {
        where.status = query.status;
    }

    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm } },
            { ownerName: { contains: searchTerm } },
            { telegramUsername: { contains: searchTerm } },
        ];
    }

    return where;
}

function calculateRevenueStats(transactions: RevenueTransaction[]): RevenueStats {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRevenue = sumTransactionAmounts(transactions.filter((transaction) => transaction.createdAt >= todayStart));
    const weekRevenue = sumTransactionAmounts(transactions.filter((transaction) => transaction.createdAt >= weekStart));
    const monthRevenue = sumTransactionAmounts(transactions.filter((transaction) => transaction.createdAt >= monthStart));
    const totalRevenue = sumTransactionAmounts(transactions);
    const avgTicket = transactions.length > 0
        ? Math.round(totalRevenue / transactions.length)
        : 0;

    return { todayRevenue, weekRevenue, monthRevenue, totalRevenue, avgTicket };
}

async function ensureTelegramTokenIsAvailable(telegramToken: string): Promise<void> {
    const existingBotWithSameToken = await prisma.bot.findUnique({
        where: { telegramToken },
    });

    if (existingBotWithSameToken) {
        throw new ConflictError(TELEGRAM_TOKEN_IN_USE_ERROR_MESSAGE);
    }
}

async function findBotByIdOrThrow(botId: string) {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
    });

    if (!bot) {
        throw new NotFoundError(BOT_NOT_FOUND_ERROR_MESSAGE);
    }

    return bot;
}

async function findBotWithRecentTransactionsOrThrow(botId: string) {
    const bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: {
            transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
            },
        },
    });

    if (!bot) {
        throw new NotFoundError(BOT_NOT_FOUND_ERROR_MESSAGE);
    }

    return bot;
}

async function getCompletedTransactions(botId: string): Promise<RevenueTransaction[]> {
    return prisma.transaction.findMany({
        where: { botId, status: COMPLETED_TRANSACTION_STATUS },
        select: { amountBrl: true, createdAt: true },
    });
}

export async function listBots(query: ListBotsQuery) {
    const where = buildListBotsFilters(query);
    const bots = await prisma.bot.findMany({
        where,
        include: {
            transactions: {
                where: { status: COMPLETED_TRANSACTION_STATUS },
                select: { amountBrl: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return bots.map((bot) => ({
        id: bot.id,
        name: bot.name,
        telegramToken: maskTelegramToken(bot.telegramToken),
        telegramUsername: bot.telegramUsername,
        ownerName: bot.ownerName,
        depixAddress: bot.depixAddress,
        splitRate: bot.splitRate,
        status: bot.status,
        totalRevenue: sumTransactionAmounts(bot.transactions),
        transactionsCount: bot.transactions.length,
        createdAt: bot.createdAt,
        updatedAt: bot.updatedAt,
    }));
}

export async function getBot(botId: string) {
    const bot = await findBotWithRecentTransactionsOrThrow(botId);
    const completedTransactions = await getCompletedTransactions(botId);
    const revenueStats = calculateRevenueStats(completedTransactions);

    return {
        ...bot,
        telegramToken: maskTelegramToken(bot.telegramToken),
        totalRevenue: revenueStats.totalRevenue,
        transactionsCount: completedTransactions.length,
        stats: {
            todayRevenue: revenueStats.todayRevenue,
            weekRevenue: revenueStats.weekRevenue,
            monthRevenue: revenueStats.monthRevenue,
            avgTicket: revenueStats.avgTicket,
        },
    };
}

export async function createBot(input: CreateBotInput) {
    await ensureTelegramTokenIsAvailable(input.telegramToken);

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
        telegramToken: maskTelegramToken(bot.telegramToken),
        totalRevenue: 0,
        transactionsCount: 0,
    };
}

export async function updateBot(botId: string, input: UpdateBotInput) {
    await findBotByIdOrThrow(botId);
    const bot = await prisma.bot.update({
        where: { id: botId },
        data: input,
    });

    return {
        ...bot,
        telegramToken: maskTelegramToken(bot.telegramToken),
    };
}

export async function deleteBot(botId: string) {
    await findBotByIdOrThrow(botId);
    await prisma.bot.update({
        where: { id: botId },
        data: { status: INACTIVE_BOT_STATUS },
    });
}
