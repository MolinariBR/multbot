import { isAxiosError } from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { BotHeader } from '../components/BotHeader';
import { BotStats } from '../components/BotStats';
import { BotDetailsCards } from '../components/BotDetailsCards';
import EditBotModal from '../components/EditBotModal';

const BOT_DETAILS_ENDPOINT = '/bots';
const DEFAULT_BOT_NOT_FOUND_MESSAGE = 'Bot não encontrado';
const DEFAULT_BOT_LOAD_ERROR_MESSAGE = 'Erro ao carregar detalhes do bot';
const INVALID_BOT_ID_ERROR_MESSAGE = 'ID do bot inválido ou ausente';

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

interface BotDetailsErrorStateProps {
  errorMessage: string;
  onBack: () => void;
}

interface UseBotDetailsResult {
  bot: BotDetailsData | null;
  loading: boolean;
  error: string;
  reloadBotDetails: () => Promise<void>;
}

function getBotDetailsErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string; message?: string } | undefined;
    return responseData?.error ?? responseData?.message ?? error.message ?? DEFAULT_BOT_LOAD_ERROR_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return DEFAULT_BOT_LOAD_ERROR_MESSAGE;
}

function BotDetailsLoadingState() {
  return (
    <div className="space-y-8">
      <div className="h-8 w-32 bg-gray-800 rounded animate-pulse mb-6"></div>
      <div className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
    </div>
  );
}

function BotDetailsErrorState({ errorMessage, onBack }: BotDetailsErrorStateProps) {
  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
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
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function useBotDetails(id: string | undefined): UseBotDetailsResult {
  const [bot, setBot] = useState<BotDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reloadBotDetails = useCallback(async () => {
    if (!id) {
      setBot(null);
      setError(INVALID_BOT_ID_ERROR_MESSAGE);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get<BotDetailsData>(`${BOT_DETAILS_ENDPOINT}/${id}`);
      setBot(response.data);
    } catch (error: unknown) {
      setError(getBotDetailsErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void reloadBotDetails();
  }, [reloadBotDetails]);

  return { bot, loading, error, reloadBotDetails };
}

export default function BotDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { bot, loading, error, reloadBotDetails } = useBotDetails(id);

  if (loading) {
    return <BotDetailsLoadingState />;
  }

  if (error || !bot) {
    return (
      <BotDetailsErrorState errorMessage={error || DEFAULT_BOT_NOT_FOUND_MESSAGE} onBack={() => navigate('/bots')} />
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
        onSaveSuccess={reloadBotDetails}
        bot={bot}
      />
    </div>
  );
}
