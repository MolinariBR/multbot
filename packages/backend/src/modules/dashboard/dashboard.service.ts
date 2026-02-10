import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { telegramBotManager } from '../telegram/telegram-bot.service.js';

export async function getPlatformStatus() {
    const [activeBotsCount, settings] = await Promise.all([
        prisma.bot.count({ where: { status: 'active' } }),
        prisma.settings.findUnique({ where: { id: 'settings' } }),
    ]);

    const runningBotsCount = telegramBotManager.getAllBots().size;

    // Depix can be configured either via Settings (DB) or via `.env` fallback.
    const depixApiUrl = settings?.depixApiUrl || env.DEPIX_API_URL || '';
    const depixApiKey = settings?.depixApiKey || env.DEPIX_API_KEY || '';
    const depixConfigured = Boolean(depixApiUrl && depixApiKey);

    const uptimeSec = Math.floor(process.uptime());

    return {
        apiOnline: true,
        serverTime: new Date().toISOString(),
        uptimeSec,
        nodeVersion: process.version,
        bots: {
            activeConfigured: activeBotsCount,
            running: runningBotsCount,
        },
        depix: {
            configured: depixConfigured,
        },
    };
}

export async function getStats() {
    // Contar bots ativos
    const botsCount = await prisma.bot.count({
        where: { status: 'active' },
    });

    // Contar transações
    const transactionsCount = await prisma.transaction.count();

    // Receita total (apenas transações completas)
    const revenueResult = await prisma.transaction.aggregate({
        where: { status: 'completed' },
        _sum: { amountBrl: true },
    });
    const totalRevenue = revenueResult._sum.amountBrl || 0;

    // Taxa de sucesso
    const completedCount = await prisma.transaction.count({
        where: { status: 'completed' },
    });
    const successRate = transactionsCount > 0
        ? Math.round((completedCount / transactionsCount) * 100 * 10) / 10
        : 0;

    // Top 5 bots por receita
    const topBots = await prisma.bot.findMany({
        select: {
            id: true,
            name: true,
            transactions: {
                where: { status: 'completed' },
                select: { amountBrl: true },
            },
        },
        take: 5,
    });

    const topBotsWithRevenue = topBots
        .map(bot => ({
            id: bot.id,
            name: bot.name,
            revenue: bot.transactions.reduce((sum, t) => sum + t.amountBrl, 0),
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        botsCount,
        transactionsCount,
        totalRevenue,
        successRate,
        topBots: topBotsWithRevenue,
    };
}
