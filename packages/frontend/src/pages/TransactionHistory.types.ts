export type TransactionStatusFilter = 'all' | 'completed' | 'processing' | 'failed'
export type TransactionSortField = 'createdAt' | 'amountBrl'
export type SortOrder = 'asc' | 'desc'
export type SortOption = `${TransactionSortField}-${SortOrder}`

export interface TransactionRecord {
  id: string
  botName: string
  customerName: string | null
  amountBrl: number
  merchantSplit: number
  adminSplit: number
  status: string
  createdAt: string
}

export interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TransactionsResponse {
  data: TransactionRecord[]
  pagination: PaginationData
}

export interface TransactionListParams {
  page: number
  limit: number
  sortBy: TransactionSortField
  sortOrder: SortOrder
  status?: Exclude<TransactionStatusFilter, 'all'>
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface TransactionExportParams {
  status?: Exclude<TransactionStatusFilter, 'all'>
  dateFrom?: string
  dateTo?: string
}
