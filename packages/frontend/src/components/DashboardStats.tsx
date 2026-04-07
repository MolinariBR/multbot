import { TrendingUp, Bot, Wallet, Activity } from 'lucide-react';

interface Stats {
    botsCount: number;
    transactionsCount: number;
    totalRevenue: number;
    successRate: number;
    topBots: Array<{
        id: string;
        name: string;
        revenue: number;
    }>;
}

interface DashboardStatsProps {
    stats: Stats | null;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
    const dashboardStats = [
        {
            name: 'Total de Bots',
            value: stats?.botsCount || 0,
            icon: Bot,
            gradient: 'from-fuchsia-500 to-pink-500',
        },
        {
            name: 'Transações',
            value: stats?.transactionsCount || 0,
            icon: Activity,
            gradient: 'from-orange-500 to-amber-500',
        },
        {
            name: 'Receita Total',
            value: `R$ ${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
            icon: Wallet,
            gradient: 'from-violet-500 to-purple-500',
        },
        {
            name: 'Taxa de Sucesso',
            value: `${stats?.successRate || 0}%`,
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-500',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {dashboardStats.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.name}
                        className="group relative bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl p-6 border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
                    >
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${stat.gradient} transition-opacity`} />
                        <div className="relative">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm font-medium mb-1">{stat.name}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}