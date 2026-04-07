interface TransactionHistoryStatsProps {
  totalTransactions: number
  totalAmount: string
  totalPlatformFee: string
}

const CARD_CLASS_NAME =
  'bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6'

export default function TransactionHistoryStats({
  totalTransactions,
  totalAmount,
  totalPlatformFee,
}: TransactionHistoryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className={CARD_CLASS_NAME}>
        <p className="text-gray-400 text-sm mb-1">Total de Transações</p>
        <p className="text-3xl font-bold text-white">{totalTransactions}</p>
      </div>
      <div className={CARD_CLASS_NAME}>
        <p className="text-gray-400 text-sm mb-1">Valor Total</p>
        <p className="text-3xl font-bold text-white">{totalAmount}</p>
      </div>
      <div className={CARD_CLASS_NAME}>
        <p className="text-gray-400 text-sm mb-1">Taxa Plataforma</p>
        <p className="text-3xl font-bold text-white">{totalPlatformFee}</p>
      </div>
    </div>
  )
}
