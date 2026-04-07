import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardBotsTable } from '../components/DashboardBotsTable';
import { DashboardTopBots } from '../components/DashboardTopBots';

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

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bots, setBots] = useState<BotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const adminName = 'Zydra';

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');

      // Carregar estatísticas e bots em paralelo
      const [statsRes, botsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/bots')
      ]);

      setStats(statsRes.data);
      setBots(botsRes.data);
      setLastUpdate(new Date());

      if (isRefresh) {
        toast.success('Dados atualizados!');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      console.error('Erro ao carregar dados:', err);
      const errorMessage = error.response?.data?.error || 'Erro ao carregar dados do servidor';
      setError(errorMessage);

      if (isRefresh) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold text-white">Carregando...</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-red-400" size={24} />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Erro ao Carregar Dados</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadData()}
            className="self-start px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DashboardHeader adminName={adminName} lastUpdate={lastUpdate} onRefresh={() => loadData(true)} refreshing={refreshing} />
      <DashboardStats stats={stats} />
      <DashboardBotsTable bots={bots} />
      <DashboardTopBots topBots={stats?.topBots || []} />
    </div>
  );
}
