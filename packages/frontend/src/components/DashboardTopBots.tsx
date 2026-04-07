interface DashboardTopBotsProps {
    topBots: Array<{
        id: string;
        name: string;
        revenue: number;
    }>;
}

export function DashboardTopBots({ topBots }: DashboardTopBotsProps) {
    if (!topBots || topBots.length === 0) return null;

    return (
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Top Bots por Receita</h2>
            <div className="space-y-3">
                {topBots.map((bot, idx) => (
                    <div
                        key={bot.id}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-violet-500/10 hover:border-violet-500/30 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white">
                                {idx + 1}
                            </div>
                            <p className="font-semibold text-white">{bot.name}</p>
                        </div>
                        <p className="font-bold text-emerald-400">R$ {(bot.revenue / 100).toFixed(2)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}