import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, Settings, Activity, TrendingUp, Users, ExternalLink, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import EditBotModal from '../components/EditBotModal';
import toast from 'react-hot-toast';

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
    transactions?: Array<{
        id: string;
        amountBrl: number;
        status: string;
        createdAt: string;
    }>;
}

export default function BotDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [bot, setBot] = useState<BotDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadBotDetails();
        }
    }, [id]);

    const loadBotDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(`/bots/${id}`);
            setBot(response.data);
        } catch (err: any) {
            console.error('Erro ao carregar detalhes do bot:', err);
            setError(err.response?.data?.error || 'Erro ao carregar detalhes do bot');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="h-8 w-32 bg-gray-800 rounded animate-pulse mb-6"></div>
                <div className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
        );
    }

    if (error || !bot) {
        return (
            <div className="space-y-8">
                <button
                    onClick={() => navigate('/bots')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    Voltar para Lista
                </button>

                <div className="flex flex-col gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="text-red-400" size={24} />
                        <div className="flex-1">
                            <h3 className="text-red-400 font-semibold">Erro ao Carregar Bot</h3>
                            <p className="text-red-300 text-sm">{error || 'Bot não encontrado'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header e Navigation */}
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
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${bot.status === 'active'
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
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors border border-zinc-700"
                    >
                        <Settings size={18} />
                        Gerenciar Bot
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                            <Activity className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Taxa da Plataforma</p>
                            <p className="text-2xl font-bold text-white">{(bot.splitRate * 100).toFixed(0)}%</p>
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
                            <p className="text-2xl font-bold text-white">R$ {(bot.totalRevenue / 100).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Bot className="text-white" size={24} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Total Transações</p>
                            <p className="text-2xl font-bold text-white">{bot.transactionsCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Tecnical Details */}
                <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Detalhes Técnicos</h3>

                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Telegram Token</p>
                            <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-300 break-all">
                                {bot.telegramToken.substring(0, 10)}...{bot.telegramToken.substring(bot.telegramToken.length - 10)}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Depix Address (Liquid)</p>
                            <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-300 break-all">
                                {bot.depixAddress}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Bot ID</p>
                            <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-500">
                                {bot.id}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity (Placeholder) */}
                <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Últimas Atividades</h3>
                    <div className="space-y-4">
                        {/* TODO: Integrar lista de transações reais se disponível no endpoint /:id */}
                        <div className="flex items-center justify-center h-40 text-gray-500 text-sm italic border border-dashed border-gray-800 rounded-xl">
                            Nenhuma atividade recente para exibir.
                            <br />
                            (Histórico detalhado em desenvolvimento)
                        </div>
                    </div>
                </div>
            </div>

            <EditBotModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={loadBotDetails}
                bot={bot}
            />
        </div>
    );
}
