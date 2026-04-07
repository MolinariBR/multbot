import { useState, useEffect } from 'react'
import axios from 'axios'
import { Bot, Save, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
import Modal from './Modal'

interface BotData {
    id: string
    name: string
    telegramUsername: string | null
    ownerName: string
    createdAt: string
    splitRate: number
    status: string
}

interface EditBotModalProps {
    isOpen: boolean
    onClose: () => void
    onSaveSuccess: () => void
    bot: BotData | null
}

interface EditBotFormData {
    name: string
    platformFeePercentage: number
    status: string
}

interface UpdateBotPayload {
    name: string
    splitRate: number
    status: string
}

const getInitialEditBotFormState = (): EditBotFormData => ({
    name: '',
    platformFeePercentage: 10,
    status: 'active',
})

const mapBotToFormState = (bot: BotData): EditBotFormData => ({
    name: bot.name,
    platformFeePercentage: Math.round(bot.splitRate * 100),
    status: bot.status,
})

export default function EditBotModal({
    isOpen,
    onClose,
    onSaveSuccess,
    bot,
}: EditBotModalProps) {
    const [botFormState, setBotFormState] = useState<EditBotFormData>(getInitialEditBotFormState())
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!bot) return
        setBotFormState(mapBotToFormState(bot))
    }, [bot])

    const handleSaveBot = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!bot) return

        setIsSaving(true)

        try {
            await saveBot(bot.id, buildBotUpdatePayload(botFormState))
            toast.success('Bot atualizado com sucesso!')
            onSaveSuccess()
            onClose()
        } catch (error: unknown) {
            handleSaveBotError(error, bot.id, botFormState)
        } finally {
            setIsSaving(false)
        }
    }

    const saveBot = async (botId: string, payload: UpdateBotPayload) => {
        await api.patch(`/bots/${botId}`, payload)
    }

    const buildBotUpdatePayload = (formState: EditBotFormData): UpdateBotPayload => ({
        name: formState.name,
        splitRate: formState.platformFeePercentage / 100,
        status: formState.status,
    })

    const extractErrorMessage = (error: unknown): string => {
        if (axios.isAxiosError(error)) {
            const serverMessage = error.response?.data?.error
            if (typeof serverMessage === 'string' && serverMessage.length > 0) {
                return serverMessage
            }
            return error.message || 'Erro desconhecido ao atualizar o bot'
        }

        if (error instanceof Error) {
            return error.message
        }

        return 'Erro desconhecido ao atualizar o bot'
    }

    const handleSaveBotError = (
        error: unknown,
        botId: string,
        formState: EditBotFormData,
    ) => {
        const message = extractErrorMessage(error)
        console.error('Falha ao atualizar bot', { botId, formState, error })
        toast.error(message)
    }

    const updateBotFormField = <K extends keyof EditBotFormData>(field: K, value: EditBotFormData[K]) => {
        setBotFormState((currentFormState) => ({
            ...currentFormState,
            [field]: value,
        }))
    }

    if (!bot) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Bot"
            icon={<Bot className="text-violet-400" size={24} />}
            maxWidth="lg"
        >
            <form onSubmit={handleSaveBot} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nome de Exibição
                    </label>
                    <input
                        type="text"
                        required
                        value={botFormState.name}
                        onChange={(e) => updateBotFormField('name', e.target.value)}
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white placeholder-gray-500 focus:outline-none
                            focus:border-violet-500/50 transition-colors`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status Operacional
                    </label>
                    <select
                        value={botFormState.status}
                        onChange={(e) => updateBotFormField('status', e.target.value)}
                        className={`w-full bg-black/50 border border-violet-500/20 rounded-xl
                            px-4 py-3 text-white focus:outline-none
                            focus:border-violet-500/50 transition-colors`}
                    >
                        <option value="active">🟢 Ativo (Recebendo pagamentos)</option>
                        <option value="inactive">🔴 Inativo (Pausado)</option>
                    </select>
                </div>

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
                            value={botFormState.platformFeePercentage}
                            onChange={(e) =>
                                updateBotFormField('platformFeePercentage', Number(e.target.value))
                            }
                            className="flex-1"
                        />
                        <div className="w-16 bg-black/50 border border-violet-500/20 rounded-xl px-3 py-2 text-center">
                            <span className="text-violet-400 font-bold">
                                {botFormState.platformFeePercentage}%
                            </span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} />
                        Esta taxa será aplicada a todas as novas transações deste bot.
                    </p>
                </div>

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

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700
                            text-white rounded-xl font-medium transition-colors`}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className={`flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600
                            hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold
                            shadow-lg shadow-violet-500/20 transition-all flex items-center
                            justify-center gap-2`}
                    >
                        {isSaving ? (
                            <div
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            />
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
