import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Download, Calendar, AlertCircle, ArrowUpDown, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import Pagination from '../components/Pagination'

interface Transaction {
  id: string;
  botId: string;
  botName: string;
  customerName: string | null;
  amountBrl: number;
  depixAmount: number;
  merchantSplit: number;
  adminSplit: number;
  pixKey: string | null;
  status: string;
  createdAt: string;
  completedAt: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TransactionHistory() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTransactions()
  }, [statusFilter, dateFrom, dateTo, sortBy, sortOrder, page])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError('')

      const params: any = {
        page,
        limit: 20,
        sortBy,
        sortOrder,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (dateFrom) {
        params.dateFrom = dateFrom
      }
      if (dateTo) {
        params.dateTo = dateTo
      }
      if (searchTerm) {
        params.search = searchTerm
      }

      const response = await api.get('/transactions', { params })
      setTransactions(response.data.data)
      setPagination(response.data.pagination)
    } catch (err: any) {
      console.error('Erro ao carregar transações:', err)
      setError(err.response?.data?.error || 'Erro ao carregar transações')
      toast.error('Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadTransactions()
  }

  const handleExport = async () => {
    try {
      const params: any = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      const response = await api.get('/transactions/export', {
        params,
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Transações exportadas com sucesso!')
    } catch (err) {
      toast.error('Erro ao exportar transações')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      processing: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      failed: 'bg-red-500/10 text-red-400 border-red-500/30',
    }
    const labels = {
      completed: 'Concluída',
      processing: 'Processando',
      failed: 'Falhou',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.processing}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Carregando...</h1>
        <div className="bg-gray-800 rounded-lg h-96 animate-pulse"></div>
      </div>
    )
  }

  if (error && transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-red-400 font-semibold">Erro ao Carregar Transações</h3>
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
          <h1 className="text-4xl font-bold text-white mb-2">Histórico de Transações</h1>
          <p className="text-gray-400 text-lg">
            Acompanhe todas as transações da plataforma
          </p>
        </div>
        <button
          onClick={handleExport}
          className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-violet-500/50 transition-all duration-300 flex items-center gap-2"
        >
          <Download size={20} />
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por ID, bot ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="processing">Processando</option>
            <option value="failed">Falhadas</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-')
              setSortBy(field)
              setSortOrder(order as 'asc' | 'desc')
            }}
            className="bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
          >
            <option value="createdAt-desc">Mais Recentes</option>
            <option value="createdAt-asc">Mais Antigas</option>
            <option value="amountBrl-desc">Maior Valor</option>
            <option value="amountBrl-asc">Menor Valor</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <p className="text-gray-400 text-sm mb-1">Total de Transações</p>
            <p className="text-3xl font-bold text-white">{pagination.total}</p>
          </div>
          <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <p className="text-gray-400 text-sm mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-white">
              R$ {(transactions.reduce((sum, t) => sum + t.amountBrl, 0) / 100).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
            <p className="text-gray-400 text-sm mb-1">Taxa Plataforma</p>
            <p className="text-3xl font-bold text-white">
              R$ {(transactions.reduce((sum, t) => sum + t.adminSplit, 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  ID
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Bot
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Cliente
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Valor
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Split
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">
                  Data
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/transacoes/${tx.id}`)}
                    className="border-t border-zinc-800/50 hover:bg-black/20 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-mono text-sm">{tx.id.slice(0, 8)}...</p>
                        <ExternalLink className="text-gray-500" size={14} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{tx.botName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300">{tx.customerName || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-semibold">
                        R$ {(tx.amountBrl / 100).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">
                          Merchant: <span className="text-emerald-400">R$ {(tx.merchantSplit / 100).toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Admin: <span className="text-violet-400">R$ {(tx.adminSplit / 100).toFixed(2)}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-300 text-sm">
                        {new Date(tx.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={setPage} // setPage atualiza o estado, que dispara o useEffect
            pageSize={pagination.limit}
          />
        )}
      </div>
    </div>
  )
}
