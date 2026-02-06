import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Bot, ExternalLink, Activity, TrendingUp, Users, AlertCircle, Eye, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import CreateBotModal from '../components/CreateBotModal'
import EditBotModal from '../components/EditBotModal'

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

export default function BotManagement() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bots, setBots] = useState<BotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBot, setEditingBot] = useState<BotData | null>(null)

  useEffect(() => {
    loadBots()
  }, [filterStatus])

  const loadBots = async () => {
    try {
      setLoading(true)
      setError('')

      const params: any = {}
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      const response = await api.get('/bots', { params })
      setBots(response.data)
    } catch (err: any) {
      console.error('Erro ao carregar bots:', err)
      setError(err.response?.data?.error || 'Erro ao carregar bots')
      toast.error('Erro ao carregar bots')
    } finally {
      setLoading(false)
    }
  }

  const filteredBots = bots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bot.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bot.telegramUsername && bot.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Carregando...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-red-400 font-semibold">Erro ao Carregar Bots</h3>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Gerenciamento de Bots</h1>
          <p className="text-gray-400 text-lg">
            Configure e monitore seus bots Telegram
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-violet-500/50 transition-all duration-300 flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Bot
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, proprietário ou username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total de Bots</p>
              <p className="text-2xl font-bold text-white">{bots.length}</p>
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
              <p className="text-2xl font-bold text-white">
                {bots.filter(b => b.status === 'active').length}
              </p>
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
              <p className="text-2xl font-bold text-white">
                R$ {(bots.reduce((sum, b) => sum + b.totalRevenue, 0) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bots Grid */}
      {filteredBots.length === 0 ? (
        <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-12 text-center">
          <Bot className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum bot encontrado</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro bot para começar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBots.map((bot) => (
            <div
              key={bot.id}
              className="group relative bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 transition-opacity" />

              <div className="relative p-6 space-y-4">
                {/* Header */}
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${bot.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                      }`}
                  >
                    {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Telegram */}
                {bot.telegramUsername && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <ExternalLink size={16} />
                    <span>{bot.telegramUsername}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-violet-500/10">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Transações</p>
                    <p className="text-lg font-bold text-white">{bot.transactionsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Receita</p>
                    <p className="text-lg font-bold text-white">
                      R$ {(bot.totalRevenue / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Split Rate */}
                <div className="pt-4 border-t border-violet-500/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Taxa da Plataforma</span>
                    <span className="text-violet-400 font-semibold">
                      {(bot.splitRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/bots/${bot.id}`)}
                    className="flex-1 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-xl text-violet-400 font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    Detalhes
                  </button>
                  <button
                    onClick={() => setEditingBot(bot)}
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
      )}

      {/* Create Bot Modal */}
      <CreateBotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadBots}
      />

      <EditBotModal
        isOpen={!!editingBot}
        onClose={() => setEditingBot(null)}
        onSuccess={loadBots}
        bot={editingBot}
      />
    </div>
  )
}
