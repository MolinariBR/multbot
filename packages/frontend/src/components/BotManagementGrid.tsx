import { useNavigate } from 'react-router-dom';
import { Bot, ExternalLink, Eye, Settings } from 'lucide-react';

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

interface BotManagementGridProps {
    bots: BotData[];
    onEditBot: (bot: BotData) => void;
}

export function BotManagementGrid({ bots, onEditBot }: BotManagementGridProps) {
    const navigate = useNavigate();

    if (bots.length === 0) {
        return (
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-12 text-center">
                <Bot className="mx-auto text-gray-600 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-white mb-2">Nenhum bot encontrado</h3>
                <p className="text-gray-400">Crie seu primeiro bot para começar</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
                <div
                    key={bot.id}
                    className="group relative bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 transition-opacity" />
                    <div className="relative p-6 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                                    <Bot className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                                    <p className="text-sm text-gray-400">{bot.ownerName}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                bot.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                            }`}>
                                {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                        {bot.telegramUsername && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <ExternalLink size={16} />
                                <span>{bot.telegramUsername}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-500/10">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Transações</p>
                                <p className="text-lg font-bold text-white">{bot.transactionsCount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Receita</p>
                                <p className="text-lg font-bold text-white">R$ {(bot.totalRevenue / 100).toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-violet-500/10">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Taxa da Plataforma</span>
                                <span className="text-violet-400 font-semibold">{(bot.splitRate * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => navigate(`/bots/${bot.id}`)}
                                className="flex-1 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Eye size={16} />
                                Detalhes
                            </button>
                            <button
                                onClick={() => onEditBot(bot)}
                                className="flex-1 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 hover:text-white font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Settings size={16} />
                                Gerenciar
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}