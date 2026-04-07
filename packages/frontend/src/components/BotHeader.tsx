import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bot, Settings, Users, ExternalLink, Calendar } from 'lucide-react';

interface BotDetailsData {
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

interface BotHeaderProps {
    bot: BotDetailsData;
    onEditClick: () => void;
}

export function BotHeader({ bot, onEditClick }: BotHeaderProps) {
    const navigate = useNavigate();

    return (
        <div>
            <button
                onClick={() => navigate('/bots')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                Voltar para Lista
            </button>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Bot className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {bot.name}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                bot.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                            }`}>
                                {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-gray-400">
                            <span className="flex items-center gap-1.5 text-sm">
                                <Users size={14} />
                                {bot.ownerName}
                            </span>
                            {bot.telegramUsername && (
                                <a
                                    href={`https://t.me/${bot.telegramUsername.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    <ExternalLink size={14} />
                                    {bot.telegramUsername}
                                </a>
                            )}
                            <span className="flex items-center gap-1.5 text-sm">
                                <Calendar size={14} />
                                Criado em {new Date(bot.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onEditClick}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
                >
                    <Settings size={18} />
                    Gerenciar Bot
                </button>
            </div>
        </div>
    );
}