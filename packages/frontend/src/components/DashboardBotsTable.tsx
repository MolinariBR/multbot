import { ArrowUpRight } from 'lucide-react';

interface BotData {
    id: string;
    name: string;
    telegramToken: string;
    telegramUsername: string | null;
    ownerName: string;
    depixAddress: string;
    splitRate: number;
    status: string;
    totalRevenue: number;
    transactionsCount: number;
    createdAt: string;
    updatedAt: string;
}

interface DashboardBotsTableProps {
    bots: BotData[];
}

export function DashboardBotsTable({ bots }: DashboardBotsTableProps) {
    return (
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 overflow-hidden">
            <div className="p-6 border-b border-violet-500/10">
                <h2 className="text-2xl font-bold text-white">Seus Bots ({bots.length})</h2>
                <p className="text-gray-400 text-sm mt-1">Gerenciamento de bots Telegram</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-black/50">
                        <tr>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                                Bot
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                                Status
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                                Transações
                            </th>
                            <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                                Receita
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {bots.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                    Nenhum bot criado ainda
                                </td>
                            </tr>
                        ) : (
                            bots.map((bot) => (
                                <tr
                                    key={bot.id}
                                    className="border-t border-zinc-800/50 hover:bg-black/20 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-white">{bot.name}</p>
                                            <p className="text-xs text-gray-500">{bot.id.slice(0, 8)}...</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                            {bot.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white font-semibold">{bot.transactionsCount || 0}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-semibold">
                                                R$ {(bot.totalRevenue / 100).toFixed(2)}
                                            </p>
                                            <ArrowUpRight className="text-emerald-400" size={16} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}