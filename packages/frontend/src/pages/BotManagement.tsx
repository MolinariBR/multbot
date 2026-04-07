import { useState, useEffect, useCallback } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import { BotFilters } from '../components/BotFilters'
import { BotManagementStats } from '../components/BotManagementStats'
import { BotManagementGrid } from '../components/BotManagementGrid'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [bots, setBots] = useState<BotData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBot, setEditingBot] = useState<BotData | null>(null)

  const loadBots = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params: { status?: string } = {}
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      const response = await api.get('/bots', { params })
      setBots(response.data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string }
      console.error('Erro ao carregar bots:', err)
      setError(error.response?.data?.error || 'Erro ao carregar bots')
      toast.error('Erro ao carregar bots')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    loadBots()
  }, [loadBots])

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

      <BotFilters searchTerm={searchTerm} onSearchChange={setSearchTerm} filterStatus={filterStatus} onFilterChange={setFilterStatus} />

      <BotManagementStats totalBots={bots.length} activeBots={bots.filter(b => b.status === 'active').length} totalRevenue={bots.reduce((sum, b) => sum + b.totalRevenue, 0)} />

      <BotManagementGrid bots={filteredBots} onEditBot={setEditingBot} />

      <CreateBotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBotCreated={loadBots}
      />

      <EditBotModal
        isOpen={!!editingBot}
        onClose={() => setEditingBot(null)}
        onSaveSuccess={loadBots}
        bot={editingBot}
      />
    </div>
  )
}
