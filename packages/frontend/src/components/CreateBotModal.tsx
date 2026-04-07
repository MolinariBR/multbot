import { useState } from 'react'
import axios from 'axios'
import { Bot, ExternalLink, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import Modal from './Modal'

interface CreateBotModalProps {
    isOpen: boolean
    onClose: () => void
    onBotCreated: () => void
}

interface BotFormData {
    name: string
    telegramToken: string
    ownerFullName: string
    depixAddress: string
    platformFeePercentage: number
}

interface CreateBotPayload {
    name: string
    telegramToken: string
    ownerName: string
    depixAddress: string
    splitRate: number
}

const getInitialBotFormData = (): BotFormData => ({
    name: '',
    telegramToken: '',
    ownerFullName: '',
    depixAddress: '',
    platformFeePercentage: 10,
})

export default function CreateBotModal({ isOpen, onClose, onBotCreated }: CreateBotModalProps) {
    const [botFormData, setBotFormData] = useState<BotFormData>(getInitialBotFormData())
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetBotForm = () => setBotFormData(getInitialBotFormData())

    const updateBotFormField = <K extends keyof BotFormData>(field: K, value: BotFormData[K]) => {
        setBotFormData((currentFormData) => ({
            ...currentFormData,
            [field]: value,
        }))
    }

    const handleCreateBotSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await createBot(buildBotPayload(botFormData))
            toast.success('Bot criado com sucesso!')
            onBotCreated()
            onClose()
            resetBotForm()
        } catch (error: unknown) {
            handleBotCreationError(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const createBot = async (payload: CreateBotPayload) => {
        await api.post('/bots', payload)
    }

    const buildBotPayload = (formData: BotFormData): CreateBotPayload => ({
        name: formData.name,
        telegramToken: formData.telegramToken,
        ownerName: formData.ownerFullName,
        depixAddress: formData.depixAddress,
        splitRate: formData.platformFeePercentage / 100,
    })

    const extractBotCreationErrorMessage = (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            const serverMessage = error.response?.data?.error
            if (typeof serverMessage === 'string' && serverMessage.length > 0) {
                return serverMessage
            }
            return error.message || 'Erro desconhecido ao criar bot'
        }

        if (error instanceof Error) {
            return error.message
        }

        return 'Erro desconhecido ao criar bot'
    }

    const handleBotCreationError = (error: unknown) => {
        const message = extractBotCreationErrorMessage(error)
        console.error('Erro ao criar bot:', {
            error,
            formData: botFormData,
        })
        toast.error(message)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Criar Novo Bot"
            icon={<Bot className="text-white" size={24} />}
            maxWidth="2xl"
        >
            <form onSubmit={handleCreateBotSubmit} className="space-y-6">
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4">
                    <h3 className="text-violet-400 font-semibold mb-2 flex items-center gap-2">
                        <ExternalLink size={16} />
                        Como obter o token do bot?
                    </h3>
                    <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                        <li>
                            Abra o Telegram e fale com{' '}
                            <span className="text-violet-400 font-mono">@BotFather</span>
                        </li>
                        <li>
                            Digite{' '}
                            <span className="text-violet-400 font-mono">/newbot</span>
                        </li>
                        <li>Siga as instruções para criar seu bot</li>
                        <li>Copie o token fornecido e cole abaixo</li>
                    </ol>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome do Bot *
                    </label>
                    <input
                        type="text"
                        required
                        value={botFormData.name}
                        onChange={(e) => updateBotFormField('name', e.target.value)}
                        placeholder="Ex: Bot TechStore"
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white placeholder-gray-500 focus:outline-none
                            focus:border-violet-500/50 transition-colors`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Token do Telegram *
                    </label>
                    <input
                        type="text"
                        required
                        value={botFormData.telegramToken}
                        onChange={(e) => updateBotFormField('telegramToken', e.target.value)}
                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white placeholder-gray-500 focus:outline-none
                            focus:border-violet-500/50 transition-colors font-mono text-sm`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Token fornecido pelo @BotFather
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome do Proprietário *
                    </label>
                    <input
                        type="text"
                        required
                        value={botFormData.ownerFullName}
                        onChange={(e) => updateBotFormField('ownerFullName', e.target.value)}
                        placeholder="Ex: João Silva"
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white placeholder-gray-500 focus:outline-none
                            focus:border-violet-500/50 transition-colors`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <Wallet size={16} />
                        Endereço Liquid (Depix) *
                    </label>
                    <input
                        type="text"
                        required
                        value={botFormData.depixAddress}
                        onChange={(e) => updateBotFormField('depixAddress', e.target.value)}
                        placeholder="VJL..."
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white placeholder-gray-500 focus:outline-none
                            focus:border-violet-500/50 transition-colors font-mono text-sm`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Endereço Liquid Network para receber pagamentos
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Taxa da Plataforma (%)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="5"
                            max="30"
                            step="1"
                            value={botFormData.platformFeePercentage}
                            onChange={(e) => updateBotFormField('platformFeePercentage', Number(e.target.value))}
                            className="flex-1"
                        />
                        <div className="w-20 bg-black/50 border border-violet-500/20 rounded-xl px-3 py-2 text-center">
                            <span className="text-violet-400 font-bold">{botFormData.platformFeePercentage}%</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Percentual que a plataforma receberá de cada transação
                    </p>
                </div>

                <div className="bg-black/30 border border-violet-500/10 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">Exemplo de Split (R$ 100,00)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Proprietário recebe</p>
                            <p className="text-lg font-bold text-emerald-400">
                                R$ {(100 * (1 - botFormData.platformFeePercentage / 100)).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Plataforma recebe</p>
                            <p className="text-lg font-bold text-violet-400">
                                R$ {(100 * (botFormData.platformFeePercentage / 100)).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`flex-1 px-6 py-3 bg-white/5 hover:bg-white/10
                            border border-white/10 rounded-xl text-white font-medium
                            transition-colors`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600
                            hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-white
                            font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? 'Criando...' : 'Criar Bot'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
