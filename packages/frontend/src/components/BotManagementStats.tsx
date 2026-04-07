import { Bot, Activity, TrendingUp } from 'lucide-react';

interface BotManagementStatsProps {
    totalBots: number;
    activeBots: number;
    totalRevenue: number;
}

export function BotManagementStats({ totalBots, activeBots, totalRevenue }: BotManagementStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <Bot className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total de Bots</p>
                        <p className="text-2xl font-bold text-white">{totalBots}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Bots Ativos</p>
                        <p className="text-2xl font-bold text-white">{activeBots}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                        <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Receita Total</p>
                        <p className="text-2xl font-bold text-white">R$ {(totalRevenue / 100).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}