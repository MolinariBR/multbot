import { useState } from 'react'
import {Search, Plus, QrCode, Copy, Check} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StoreManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPixModal, setShowPixModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)

  const stores = [
    { id: '1', name: 'Loja Tech Store', owner: 'João Silva', status: 'active', balance: 'R$ 12,450.00' },
    { id: '2', name: 'Fashion Outlet', owner: 'Maria Santos', status: 'active', balance: 'R$ 8,320.50' },
    { id: '3', name: 'Electronics Plus', owner: 'Pedro Costa', status: 'active', balance: 'R$ 15,890.00' },
    { id: '4', name: 'Book Haven', owner: 'Ana Lima', status: 'inactive', balance: 'R$ 2,100.00' },
    { id: '5', name: 'Sports Arena', owner: 'Carlos Mendes', status: 'active', balance: 'R$ 9,750.00' },
  ]

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.owner.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGeneratePix = () => {
    setShowPixModal(true)
  }

  const generatePixQRCode = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    toast.success('PIX QR Code generated successfully!')
  }

  const copyPixKey = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix...')
    setCopiedKey(true)
    toast.success('PIX key copied to clipboard')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Store Management</h1>
          <p className="text-gray-400">Manage all stores using the Depix bot</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all">
          <Plus size={20} />
          Add Store
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search stores or owners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800/50 border border-purple-500/20 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{store.name}</h3>
                <p className="text-gray-400 text-sm">{store.owner}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  store.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}
              >
                {store.status}
              </span>
            </div>

            <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
              <p className="text-gray-400 text-xs mb-1">Current Balance</p>
              <p className="text-white font-bold text-xl">{store.balance}</p>
            </div>

            <button
              onClick={handleGeneratePix}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all border border-purple-500/30"
            >
              <QrCode size={18} />
              Generate PIX
            </button>
          </div>
        ))}
      </div>

      {/* PIX Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-purple-500/20">
            <h3 className="text-xl font-bold text-white mb-4">Generate PIX Payment</h3>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Amount (BRL)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-900/50 border border-purple-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500/40"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-purple-500/20">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                    <QrCode size={120} className="text-gray-800" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="00020126580014br.gov.bcb.pix..."
                    readOnly
                    className="flex-1 bg-gray-800 border border-purple-500/20 rounded px-3 py-2 text-gray-400 text-sm"
                  />
                  <button
                    onClick={copyPixKey}
                    className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition-all"
                  >
                    {copiedKey ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPixModal(false)
                  setAmount('')
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={generatePixQRCode}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
