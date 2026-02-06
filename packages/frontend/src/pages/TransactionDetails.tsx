import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface TransactionDetailsData {
    id: string;
    botId: string;
    botName: string;
    amountBrl: number;
    depixAmount: number;
    status: string;
    pixKey: string;
    merchantSplit: number;
    adminSplit: number;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export default function TransactionDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [transaction, setTransaction] = useState<TransactionDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            loadDetails();
        }
    }, [id]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get(`/transactions/${id}`);
            setTransaction(response.data);
        } catch (err: any) {
            console.error('Erro ao carregar transação:', err);
            setError(err.response?.data?.error || 'Erro ao carregar detalhes da transação');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência!');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    if (error || !transaction) {
        return (
            <div className="space-y-8">
                <button
                    onClick={() => navigate('/transacoes')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={20} />
                    Voltar para Histórico
                </button>

                <div className="flex flex-col gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
                    <div className="flex items-center gap-4">
                        <AlertCircle className="text-red-400" size={24} />
                        <div className="flex-1">
                            <h3 className="text-red-400 font-semibold">Erro ao Carregar Transação</h3>
                            <p className="text-red-300 text-sm">{error || 'Transação não encontrada'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={20} />;
            case 'failed': return <XCircle size={20} />;
            case 'processing': return <Clock size={20} />;
            default: return <AlertCircle size={20} />;
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/transacoes')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar
                </button>

                <button
                    onClick={loadDetails}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Atualizar"
                >
                    <RefreshCw size={20} className="text-gray-400" />
                </button>
            </div>

            <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-violet-500/20 rounded-2xl overflow-hidden">
                {/* Status Bar */}
                <div className="p-8 border-b border-violet-500/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Valor da Transação</p>
                            <h1 className="text-4xl font-bold text-white">
                                R$ {(transaction.amountBrl / 100).toFixed(2)}
                            </h1>
                        </div>

                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status === 'completed' ? 'Concluída' : transaction.status === 'processing' ? 'Pendente' : 'Falhou'}</span>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white mb-4">Informações Gerais</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">ID da Transação</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">{transaction.id}</span>
                                    <button onClick={() => copyToClipboard(transaction.id)} className="text-gray-500 hover:text-white">
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm mb-1">Bot Origem</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-lg font-medium">{transaction.botName || 'Bot desconhecido'}</span>
                                    <button onClick={() => navigate(`/bots/${transaction.botId}`)} className="text-violet-400 hover:text-violet-300">
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-400 text-sm mb-1">Data de Criação</p>
                                <span className="text-white">{new Date(transaction.createdAt).toLocaleString()}</span>
                            </div>

                            {transaction.completedAt && (
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Data de Conclusão</p>
                                    <span className="text-emerald-400">{new Date(transaction.completedAt).toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-white mb-4">Detalhes Financeiros</h3>

                        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-zinc-700">
                                <span className="text-gray-400">Merchant Split (Liquid)</span>
                                <span className="text-white font-mono">{(transaction.merchantSplit / 100000000).toFixed(8)} L-BTC</span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-zinc-700">
                                <span className="text-gray-400">Admin Split (Liquid)</span>
                                <span className="text-white font-mono">{(transaction.adminSplit / 100000000).toFixed(8)} L-BTC</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Valor Bruto PIX</span>
                                <span className="text-emerald-400 font-bold">R$ {(transaction.amountBrl / 100).toFixed(2)}</span>
                            </div>
                        </div>

                        {transaction.status === 'processing' && transaction.pixKey && (
                            <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                                <p className="text-gray-400 text-sm mb-2">Chave PIX Copia e Cola</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={transaction.pixKey}
                                        className="flex-1 bg-black border border-zinc-700 rounded px-2 text-xs text-gray-500 truncate font-mono"
                                    />
                                    <button
                                        onClick={() => copyToClipboard(transaction.pixKey)}
                                        className="p-2 bg-violet-600 hover:bg-violet-500 rounded text-white"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
