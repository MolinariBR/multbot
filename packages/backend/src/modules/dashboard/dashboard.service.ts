import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { telegramBotManager } from '../telegram/telegram-bot.service.js';

const ACTIVE_BOT_STATUS = 'active';
const COMPLETED_TRANSACTION_STATUS = 'completed';
const TOP_BOTS_LIMIT = 5;

type RevenueByBot = {
    id: string;
    name: string;
    revenue: number;
};

type TransactionsSummary = {
    transactionsCount: number;
    completedTransactionsCount: number;
    totalRevenue: number;
};

function resolveDepixConfigurationValue(
    primaryValue: string | undefined,
    fallbackValue: string | undefined,
): string {
    return primaryValue || fallbackValue || '';
}

function isDepixConfigured(platformSettings: { depixApiUrl: string; depixApiKey: string } | null): boolean {
    const depixApiUrl = resolveDepixConfigurationValue(platformSettings?.depixApiUrl, env.DEPIX_API_URL);
    const depixApiKey = resolveDepixConfigurationValue(platformSettings?.depixApiKey, env.DEPIX_API_KEY);

    return Boolean(depixApiUrl && depixApiKey);
}

function calculateSuccessRate(totalTransactions: number, completedTransactions: number): number {
    if (totalTransactions === 0) {
        return 0;
    }

    return Math.round((completedTransactions / totalTransactions) * 100 * 10) / 10;
}

async function getTransactionsSummary(): Promise<TransactionsSummary> {
    const [transactionsCount, completedTransactionsCount, completedRevenueAggregate] = await Promise.all([
        prisma.transaction.count(),
        prisma.transaction.count({
            where: { status: COMPLETED_TRANSACTION_STATUS },
        }),
        prisma.transaction.aggregate({
            where: { status: COMPLETED_TRANSACTION_STATUS },
            _sum: { amountBrl: true },
        }),
    ]);

    return {
        transactionsCount,
        completedTransactionsCount,
        totalRevenue: completedRevenueAggregate._sum.amountBrl || 0,
    };
}

async function getTopBotsByRevenue(limit: number = TOP_BOTS_LIMIT): Promise<RevenueByBot[]> {
    const revenueByBot = await prisma.transaction.groupBy({
        by: ['botId'],
        where: { status: COMPLETED_TRANSACTION_STATUS },
        _sum: { amountBrl: true },
        orderBy: { _sum: { amountBrl: 'desc' } },
        take: limit,
    });

    if (revenueByBot.length === 0) {
        return [];
    }

    const botIds = revenueByBot.map((item) => item.botId);
    const bots = await prisma.bot.findMany({
        where: { id: { in: botIds } },
        select: { id: true, name: true },
    });
    const botNameById = new Map(bots.map((bot) => [bot.id, bot.name]));

    return revenueByBot.map((item) => ({
        id: item.botId,
        name: botNameById.get(item.botId) ?? 'Bot sem nome',
        revenue: item._sum.amountBrl || 0,
    }));
}

export async function getPlatformStatus() {
    const [activeConfiguredBotsCount, platformSettings] = await Promise.all([
        prisma.bot.count({ where: { status: ACTIVE_BOT_STATUS } }),
        prisma.settings.findUnique({ where: { id: 'settings' } }),
    ]);

    const runningBotsCount = telegramBotManager.getAllBots().size;
    const depixConfigured = isDepixConfigured(platformSettings);

    const uptimeSec = Math.floor(process.uptime());

    return {
        apiOnline: true,
        serverTime: new Date().toISOString(),
        uptimeSec,
        nodeVersion: process.version,
        bots: {
            activeConfigured: activeConfiguredBotsCount,
            running: runningBotsCount,
        },
        depix: {
            configured: depixConfigured,
        },
    };
}

export async function getStats() {
    const [botsCount, transactionsSummary, topBots] = await Promise.all([
        prisma.bot.count({
            where: { status: ACTIVE_BOT_STATUS },
        }),
        getTransactionsSummary(),
        getTopBotsByRevenue(),
    ]);

    return {
        botsCount,
        transactionsCount: transactionsSummary.transactionsCount,
        totalRevenue: transactionsSummary.totalRevenue,
        successRate: calculateSuccessRate(
            transactionsSummary.transactionsCount,
            transactionsSummary.completedTransactionsCount,
        ),
        topBots,
    };
}
