import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { BotHeader } from '../components/BotHeader';
import { BotStats } from '../components/BotStats';
import { BotDetailsCards } from '../components/BotDetailsCards';
import EditBotModal from '../components/EditBotModal';

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

export default function BotDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [bot, setBot] = useState<BotDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadBotDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/bots/${id}`);
            setBot(response.data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } }; message?: string };
            const errorMessage = `Erro ao carregar detalhes do bot ${id}: ${error.response?.data?.error || error.message || 'Erro desconhecido'}`;
            console.error('BotDetails load error', { botId: id, error });
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadBotDetails();
        }
    }, [id, loadBotDetails]);

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
            <BotHeader bot={bot} onEditClick={() => setIsEditModalOpen(true)} />
            <BotStats splitRate={bot.splitRate} totalRevenue={bot.totalRevenue} transactionsCount={bot.transactionsCount} />
            <BotDetailsCards bot={bot} />
            <EditBotModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSaveSuccess={loadBotDetails}
                bot={bot}
            />
        </div>
    );
}
