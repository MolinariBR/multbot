import { useState, useEffect } from 'react';
import { TrendingUp, Bot, Wallet, Activity, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

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

  const loadData = async (isRefresh = false) => {
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
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      const errorMessage = err.response?.data?.error || 'Erro ao carregar dados do servidor';
      setError(errorMessage);

      if (isRefresh) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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

  const dashboardStats = [
    {
      name: 'Total de Bots',
      value: stats?.botsCount || 0,
      icon: Bot,
      gradient: 'from-fuchsia-500 to-pink-500',
    },
    {
      name: 'Transações',
      value: stats?.transactionsCount || 0,
      icon: Activity,
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      name: 'Receita Total',
      value: `R$ ${((stats?.totalRevenue || 0) / 100).toFixed(2)}`,
      icon: Wallet,
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      name: 'Taxa de Sucesso',
      value: `${stats?.successRate || 0}%`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Bem-vindo, {adminName}
          </h1>
          <p className="text-gray-400 text-lg">
            Visão geral da sua plataforma MultiBot
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">
            Atualizado: {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl transition-all border border-violet-500/20"
            title="Atualizar dados"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="group relative bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl p-6 border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${stat.gradient} transition-opacity`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">{stat.name}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bots List */}
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

      {/* Top Bots */}
      {
        stats?.topBots && stats.topBots.length > 0 && (
          <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Top Bots por Receita</h2>
            <div className="space-y-3">
              {stats.topBots.map((bot, idx) => (
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
        )
      }
    </div >
  );
}
