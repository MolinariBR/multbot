import { ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

import Pagination from '../Pagination'
import type {
  PaginationData,
  TransactionRecord,
} from '../../pages/TransactionHistory.types'

interface TransactionHistoryTableProps {
  transactions: TransactionRecord[]
  pagination: PaginationData | null
  onOpenTransaction: (transactionId: string) => void
  onPageChange: (page: number) => void
  getStatusBadge: (status: string) => ReactNode
  formatCurrencyFromCents: (valueInCents: number) => string
}

const TABLE_WRAPPER_CLASS_NAME =
  'bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 overflow-hidden'

export default function TransactionHistoryTable({
  transactions,
  pagination,
  onOpenTransaction,
  onPageChange,
  getStatusBadge,
  formatCurrencyFromCents,
}: TransactionHistoryTableProps) {
  return (
    <div className={TABLE_WRAPPER_CLASS_NAME}>
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
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  onClick={() => onOpenTransaction(transaction.id)}
                  className="border-t border-zinc-800/50 hover:bg-black/20 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-mono text-sm">{transaction.id.slice(0, 8)}...</p>
                      <ExternalLink className="text-gray-500" size={14} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{transaction.botName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{transaction.customerName || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">
                      {formatCurrencyFromCents(transaction.amountBrl)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400">
                        Merchant:{' '}
                        <span className="text-emerald-400">
                          {formatCurrencyFromCents(transaction.merchantSplit)}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Admin:{' '}
                        <span className="text-violet-400">
                          {formatCurrencyFromCents(transaction.adminSplit)}
                        </span>
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300 text-sm">
                      {new Date(transaction.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={onPageChange}
          pageSize={pagination.limit}
        />
      )}
    </div>
  )
}
