import { isAxiosError } from 'axios'
import { AlertCircle, Download } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import TransactionHistoryFilters from '../components/transactions/TransactionHistoryFilters'
import TransactionHistoryStats from '../components/transactions/TransactionHistoryStats'
import TransactionHistoryTable from '../components/transactions/TransactionHistoryTable'
import { api } from '../lib/api'
import type {
  SortOption,
  SortOrder,
  TransactionExportParams,
  TransactionListParams,
  TransactionRecord,
  TransactionsResponse,
  TransactionSortField,
  TransactionStatusFilter,
  PaginationData,
} from './TransactionHistory.types'

const DEFAULT_FETCH_ERROR_MESSAGE = 'Erro ao carregar transações'
const DEFAULT_EXPORT_ERROR_MESSAGE = 'Erro ao exportar transações'
const TRANSACTION_LIST_ENDPOINT = '/transactions'
const TRANSACTION_EXPORT_ENDPOINT = '/transactions/export'

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  processing: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  failed: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Concluída',
  processing: 'Processando',
  failed: 'Falhou',
}

function formatCurrencyFromCents(valueInCents: number): string {
  return `R$ ${(valueInCents / 100).toFixed(2)}`
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as { error?: string; message?: string } | undefined

    return responseData?.error ?? responseData?.message ?? error.message ?? fallbackMessage
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallbackMessage
}

function triggerFileDownload(fileBlob: Blob, fileName: string): void {
  const objectUrl = window.URL.createObjectURL(fileBlob)

  try {
    const anchorElement = document.createElement('a')
    anchorElement.href = objectUrl
    anchorElement.setAttribute('download', fileName)
    document.body.appendChild(anchorElement)
    anchorElement.click()
    anchorElement.remove()
  } finally {
    window.URL.revokeObjectURL(objectUrl)
  }
}

function getStatusBadge(status: string) {
  const badgeStyle = STATUS_STYLES[status] ?? STATUS_STYLES.processing
  const badgeLabel = STATUS_LABELS[status] ?? status

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
      {badgeLabel}
    </span>
  )
}

function parseSortOption(sortOption: string): {
  field: TransactionSortField
  order: SortOrder
} {
  if (sortOption === 'createdAt-asc') {
    return { field: 'createdAt', order: 'asc' }
  }

  if (sortOption === 'amountBrl-desc') {
    return { field: 'amountBrl', order: 'desc' }
  }

  if (sortOption === 'amountBrl-asc') {
    return { field: 'amountBrl', order: 'asc' }
  }

  return { field: 'createdAt', order: 'desc' }
}

export default function TransactionHistory() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortField, setSortField] = useState<TransactionSortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const sortOption: SortOption = `${sortField}-${sortOrder}`

  const totalTransactionAmount = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amountBrl, 0)
  }, [transactions])

  const totalPlatformFee = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.adminSplit, 0)
  }, [transactions])

  const buildBaseFilters = useCallback((): TransactionExportParams => {
    const baseFilters: TransactionExportParams = {}

    if (statusFilter !== 'all') {
      baseFilters.status = statusFilter
    }

    if (dateFrom) {
      baseFilters.dateFrom = dateFrom
    }

    if (dateTo) {
      baseFilters.dateTo = dateTo
    }

    return baseFilters
  }, [statusFilter, dateFrom, dateTo])

  const buildListParams = useCallback((): TransactionListParams => {
    const listParams: TransactionListParams = {
      page: currentPage,
      limit: 20,
      sortBy: sortField,
      sortOrder,
      ...buildBaseFilters(),
    }

    if (searchQuery) {
      listParams.search = searchQuery
    }

    return listParams
  }, [currentPage, sortField, sortOrder, searchQuery, buildBaseFilters])

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await api.get<TransactionsResponse>(TRANSACTION_LIST_ENDPOINT, {
        params: buildListParams(),
      })

      setTransactions(response.data.data)
      setPagination(response.data.pagination)
    } catch (error: unknown) {
      const message = getErrorMessage(error, DEFAULT_FETCH_ERROR_MESSAGE)
      console.error('Erro ao carregar transações', { error })
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [buildListParams])

  const exportTransactions = useCallback(async () => {
    try {
      const response = await api.get<Blob>(TRANSACTION_EXPORT_ENDPOINT, {
        params: buildBaseFilters(),
        responseType: 'blob',
      })

      const dateStamp = new Date().toISOString().split('T')[0]
      triggerFileDownload(response.data, `transactions_${dateStamp}.csv`)
      toast.success('Transações exportadas com sucesso!')
    } catch (error: unknown) {
      const message = getErrorMessage(error, DEFAULT_EXPORT_ERROR_MESSAGE)
      console.error('Erro ao exportar transações', { error })
      toast.error(message)
    }
  }, [buildBaseFilters])

  const handleSearch = useCallback(() => {
    setCurrentPage(1)
    setSearchQuery(searchInput.trim())
  }, [searchInput])

  const handleSortChange = useCallback((selectedSortOption: string) => {
    const { field, order } = parseSortOption(selectedSortOption)
    setSortField(field)
    setSortOrder(order)
  }, [])

  const handleOpenTransaction = useCallback((transactionId: string) => {
    navigate(`/transacoes/${transactionId}`)
  }, [navigate])

  useEffect(() => {
    void fetchTransactions()
  }, [fetchTransactions])

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-4xl font-bold text-white">Carregando...</h1>
        <div className="bg-gray-800 rounded-lg h-96 animate-pulse" />
      </div>
    )
  }

  if (errorMessage && transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4 p-6 bg-red-900/20 border border-red-700 rounded-lg">
          <AlertCircle className="text-red-400" size={24} />
          <div>
            <h3 className="text-red-400 font-semibold">Erro ao Carregar Transações</h3>
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Histórico de Transações</h1>
          <p className="text-gray-400 text-lg">Acompanhe todas as transações da plataforma</p>
        </div>

        <button
          onClick={exportTransactions}
          className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl"
          type="button"
        >
          <span className="font-semibold text-white shadow-lg hover:shadow-violet-500/50 flex items-center gap-2">
            <Download size={20} />
            Exportar CSV
          </span>
        </button>
      </div>

      <TransactionHistoryFilters
        searchInput={searchInput}
        statusFilter={statusFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        sortOption={sortOption}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onStatusFilterChange={setStatusFilter}
        onSortChange={handleSortChange}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
      />

      {pagination && (
        <TransactionHistoryStats
          totalTransactions={pagination.total}
          totalAmount={formatCurrencyFromCents(totalTransactionAmount)}
          totalPlatformFee={formatCurrencyFromCents(totalPlatformFee)}
        />
      )}

      <TransactionHistoryTable
        transactions={transactions}
        pagination={pagination}
        onOpenTransaction={handleOpenTransaction}
        onPageChange={setCurrentPage}
        getStatusBadge={getStatusBadge}
        formatCurrencyFromCents={formatCurrencyFromCents}
      />
    </div>
  )
}
