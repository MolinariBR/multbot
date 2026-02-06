import { useState, useEffect } from 'react'
import { Bot, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import Modal from './Modal'

interface BotData {
    id: string;
    name: string;
    telegramToken: string;
    telegramUsername: string | null;
    ownerName: string;
    depixAddress: string;
    splitRate: number;
    status: string;
}

interface EditBotModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    bot: BotData | null
}

export default function EditBotModal({ isOpen, onClose, onSuccess, bot }: EditBotModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        splitRate: 10,
        status: 'active',
    })
    const [loading, setLoading] = useState(false)

    // Atualizar formulário quando o bot mudar
    useEffect(() => {
        if (bot) {
            setFormData({
                name: bot.name,
                splitRate: Math.round(bot.splitRate * 100), // Converter decimal para %
                status: bot.status,
            })
        }
    }, [bot])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!bot) return

        try {
            setLoading(true)

            await api.patch(`/bots/${bot.id}`, {
                name: formData.name,
                splitRate: formData.splitRate / 100, // Converter % para decimal
                status: formData.status,
            })

            toast.success('Bot atualizado com sucesso!')
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('Erro ao atualizar bot:', err)
            toast.error(err.response?.data?.error || 'Erro ao atualizar bot')
        } finally {
            setLoading(false)
        }
    }

    if (!bot) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Bot"
            icon={<Bot className="text-violet-400" size={24} />}
            maxWidth="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nome do Bot */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome de Exibição
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status Operacional
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-black/50 border border-violet-500/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                        <option value="active">🟢 Ativo (Recebendo pagamentos)</option>
                        <option value="inactive">🔴 Inativo (Pausado)</option>
                    </select>
                </div>

                {/* Taxa de Split */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Taxa da Plataforma (%)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={formData.splitRate}
                            onChange={(e) => setFormData({ ...formData, splitRate: Number(e.target.value) })}
                            className="flex-1"
                        />
                        <div className="w-16 bg-black/50 border border-violet-500/20 rounded-xl px-3 py-2 text-center">
                            <span className="text-violet-400 font-bold">{formData.splitRate}%</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Esta taxa será aplicada a todas as novas transações deste bot.
                    </p>
                </div>

                {/* Dados não editáveis (Info) */}
                <div className="bg-zinc-900/50 rounded-xl p-4 text-sm text-gray-400 space-y-2 border border-white/5">
                    <div className="flex justify-between">
                        <span>Proprietário:</span>
                        <span className="text-white">{bot.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Username:</span>
                        <span className="text-violet-400">{bot.telegramUsername}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Criado em:</span>
                        <span>{new Date(bot.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={18} />
                                Salvar
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
