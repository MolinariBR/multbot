import { prisma } from '../../lib/prisma.js';

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
