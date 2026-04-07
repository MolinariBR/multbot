import { Calendar, Search } from 'lucide-react'

import type {
  SortOption,
  TransactionStatusFilter,
} from '../../pages/TransactionHistory.types'

interface TransactionHistoryFiltersProps {
  searchInput: string
  statusFilter: TransactionStatusFilter
  dateFrom: string
  dateTo: string
  sortOption: SortOption
  onSearchInputChange: (value: string) => void
  onSearch: () => void
  onStatusFilterChange: (value: TransactionStatusFilter) => void
  onSortChange: (value: string) => void
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
}

const CONTAINER_CLASS_NAME =
  'bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6'
const INPUT_CLASS_NAME =
  'bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none '
  + 'focus:border-violet-500/50 transition-colors'
const SEARCH_AND_DATE_INPUT_CLASS_NAME =
  'w-full bg-black/50 border border-violet-500/20 rounded-xl pl-12 pr-4 py-3 text-white '
  + 'focus:outline-none focus:border-violet-500/50 transition-colors'

export default function TransactionHistoryFilters({
  searchInput,
  statusFilter,
  dateFrom,
  dateTo,
  sortOption,
  onSearchInputChange,
  onSearch,
  onStatusFilterChange,
  onSortChange,
  onDateFromChange,
  onDateToChange,
}: TransactionHistoryFiltersProps) {
  return (
    <div className={CONTAINER_CLASS_NAME}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative lg:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ID, bot ou cliente..."
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSearch()
              }
            }}
            className={SEARCH_AND_DATE_INPUT_CLASS_NAME}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as TransactionStatusFilter)}
          className={INPUT_CLASS_NAME}
        >
          <option value="all">Todos os Status</option>
          <option value="completed">Concluídas</option>
          <option value="processing">Processando</option>
          <option value="failed">Falhadas</option>
        </select>

        <select
          value={sortOption}
          onChange={(event) => onSortChange(event.target.value)}
          className={INPUT_CLASS_NAME}
        >
          <option value="createdAt-desc">Mais Recentes</option>
          <option value="createdAt-asc">Mais Antigas</option>
          <option value="amountBrl-desc">Maior Valor</option>
          <option value="amountBrl-asc">Menor Valor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
            className={SEARCH_AND_DATE_INPUT_CLASS_NAME}
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
            className={SEARCH_AND_DATE_INPUT_CLASS_NAME}
          />
        </div>
      </div>
    </div>
  )
}
