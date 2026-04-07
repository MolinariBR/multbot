import { useState, useEffect, useCallback } from 'react';
import { Save, Lock, Zap, Bell, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface SettingsData {
    defaultSplitRate: number;
    minSplitRate: number;
    maxSplitRate: number;
    depixApiUrl: string;
    depixApiKey: string;
    depixWebhookSecret: string;
    telegramApiId: string;
    telegramApiHash: string;
    telegramPhone: string;
    notifyEmail: boolean;
    notifyTelegram: boolean;
    notifyMinAmount: number;
}

interface AdminTelegram {
    email: string;
    telegramLinked: boolean;
}

export default function Settings() {
    const [formData, setFormData] = useState<SettingsData>({
        defaultSplitRate: 10,
        minSplitRate: 5,
        maxSplitRate: 30,
        depixApiUrl: '',
        depixApiKey: '',
        depixWebhookSecret: '',
        telegramApiId: '',
        telegramApiHash: '',
        telegramPhone: '',
        notifyEmail: false,
        notifyTelegram: true,
        notifyMinAmount: 0, // UI em R$ (ex: 100.00)
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingDepix, setTestingDepix] = useState(false);
    const [depixStatus, setDepixStatus] = useState<'none' | 'success' | 'error'>('none');
    const [pairingCode, setPairingCode] = useState<string>('');
    const [pairingExpiresAt, setPairingExpiresAt] = useState<string>('');
    const [adminsTelegram, setAdminsTelegram] = useState<Array<{ email: string; telegramLinked: boolean }>>([]);
    const [telegramBotReady, setTelegramBotReady] = useState<boolean>(false);

    const convertSettingsData = useCallback((data: unknown) => {
        const settings = data as SettingsData;
        // Ajuste para taxas se vierem em decimal
        if (settings.defaultSplitRate < 1) settings.defaultSplitRate *= 100;
        if (settings.minSplitRate < 1) settings.minSplitRate *= 100;
        if (settings.maxSplitRate < 1) settings.maxSplitRate *= 100;

        // Notificações: backend usa centavos, UI usa R$
        if (typeof settings.notifyMinAmount === 'number') {
            settings.notifyMinAmount = settings.notifyMinAmount / 100;
        } else {
            settings.notifyMinAmount = 0;
        }

        return settings;
    }, []);

    const convertAdminsData = useCallback((admins: unknown[]) => {
        return admins.map((a) => {
            const admin = a as AdminTelegram;
            return {
                email: admin.email,
                telegramLinked: Boolean(admin.telegramLinked),
            };
        });
    }, []);

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const [settingsRes, adminsRes] = await Promise.all([
                api.get('/settings'),
                api.get('/notifications/admins'),
            ]);

            const convertedData = convertSettingsData(settingsRes.data);
            setFormData(convertedData);
            setTelegramBotReady(Boolean(adminsRes.data?.telegramBotReady));
            setAdminsTelegram(convertAdminsData(adminsRes.data?.admins || []));
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            toast.error('Erro ao carregar configurações');
        } finally {
            setLoading(false);
        }
    }, [convertSettingsData, convertAdminsData]);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);

            const payload = preparePayloadForSave(formData);

            await api.put('/settings', payload);
            toast.success('Configurações salvas com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            toast.error('Erro ao salvar configurações');
        } finally {
            setSaving(false);
        }
    };

    const preparePayloadForSave = (data: SettingsData) => ({
        ...data,
        defaultSplitRate: data.defaultSplitRate / 100,
        minSplitRate: data.minSplitRate / 100,
        maxSplitRate: data.maxSplitRate / 100,
        notifyMinAmount: Math.round((data.notifyMinAmount || 0) * 100),
    });

    const handleGeneratePairingCode = async () => {
        try {
            const res = await api.post('/notifications/telegram/pairing-code');
            setPairingCode(res.data.code);
            setPairingExpiresAt(res.data.expiresAt);
            toast.success('Código gerado. Envie /link CODIGO no bot admin.');
        } catch (error) {
            console.error('Erro ao gerar código Telegram:', error);
            toast.error('Erro ao gerar código Telegram');
        }
    };

    const handleTestEmail = async () => {
        try {
            await api.post('/notifications/test-email');
            toast.success('Email de teste enviado!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            toast.error(message || 'Falha ao enviar email de teste');
        }
    };

    const handleTestTelegram = async () => {
        try {
            await api.post('/notifications/test-telegram');
            toast.success('Telegram de teste enviado!');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            toast.error(message || 'Falha ao enviar Telegram de teste');
        }
    };

    const handleTestDepix = async () => {
        try {
            setTestingDepix(true);
            setDepixStatus('none');

            await api.post('/settings/test-depix');

            setDepixStatus('success');
            toast.success('Conexão com Depix estabelecida com sucesso!');
        } catch (error) {
            console.error('Erro teste Depix:', error);
            setDepixStatus('error');
            toast.error('Falha na conexão com a Depix API');
        } finally {
            setTestingDepix(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-gray-400">
                    Gerencie as configurações globais da plataforma
                </p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">

                {/* Seção Depix API */}
                <section className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-violet-500/20 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Zap className="text-emerald-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Integração Depix</h2>
                            <p className="text-sm text-gray-400">Configure a conexão com a Liquid Network</p>
                        </div>

                        <div className="ml-auto">
                            <button
                                type="button"
                                onClick={handleTestDepix}
                                disabled={testingDepix || !formData.depixApiKey}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${depixStatus === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : depixStatus === 'error'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                    }`}
                            >
                                {testingDepix ? (
                                    <RefreshCw className="animate-spin" size={16} />
                                ) : depixStatus === 'success' ? (
                                    <CheckCircle size={16} />
                                ) : depixStatus === 'error' ? (
                                    <AlertCircle size={16} />
                                ) : (
                                    <Zap size={16} />
                                )}
                                {testingDepix ? 'Testando...' : 'Testar Conexão'}
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                URL da API
                            </label>
                            <input
                                type="url"
                                value={formData.depixApiUrl}
                                onChange={(e) => setFormData({ ...formData, depixApiUrl: e.target.value })}
                                placeholder="https://api.depix.com.br"
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    API Key
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={formData.depixApiKey}
                                        onChange={(e) => setFormData({ ...formData, depixApiKey: e.target.value })}
                                        placeholder="Sua chave de API"
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors font-mono"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Webhook Secret
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={formData.depixWebhookSecret}
                                        onChange={(e) => setFormData({ ...formData, depixWebhookSecret: e.target.value })}
                                        placeholder="Segredo para validar webhooks"
                                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors font-mono"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção Taxas e Limites */}
                <section className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-violet-500/20 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                            <RefreshCw className="text-violet-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Taxas e Limites</h2>
                            <p className="text-sm text-gray-400">Controle as taxas padrão para novos bots</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Taxa Padrão (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.defaultSplitRate}
                                onChange={(e) => setFormData({ ...formData, defaultSplitRate: parseFloat(e.target.value) })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Taxa Mínima (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.minSplitRate}
                                onChange={(e) => setFormData({ ...formData, minSplitRate: parseFloat(e.target.value) })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Taxa Máxima (%)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={formData.maxSplitRate}
                                onChange={(e) => setFormData({ ...formData, maxSplitRate: parseFloat(e.target.value) })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                        </div>
                    </div>
                </section>

                {/* Seção Notificações */}
                <section className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-violet-500/20 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Bell className="text-orange-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Notificações</h2>
                            <p className="text-sm text-gray-400">Configure alertas do sistema</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div>
                                <p className="font-medium text-white">Notificar Telegram</p>
                                <p className="text-sm text-gray-400">Receber alertas de vendas via bot</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notifyTelegram}
                                    onChange={(e) => setFormData({ ...formData, notifyTelegram: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div>
                                <p className="font-medium text-white">Notificar Email</p>
                                <p className="text-sm text-gray-400">Receber relatórios diários via email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.notifyEmail}
                                    onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>

                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Notificar apenas acima de (R$)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.notifyMinAmount}
                                onChange={(e) => setFormData({ ...formData, notifyMinAmount: parseFloat(e.target.value || '0') })}
                                className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Exemplo: 100,00 notifica apenas transações concluídas acima de R$ 100,00.
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <p className="font-medium text-white">Vincular Telegram (Admins)</p>
                                    <p className="text-sm text-gray-400">
                                        {telegramBotReady ? 'Bot admin online.' : 'Bot admin offline (configure TELEGRAM_ADMIN_BOT_TOKEN).'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleGeneratePairingCode}
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Gerar Código
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTestTelegram}
                                        className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Testar Telegram
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleTestEmail}
                                        className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/20 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Testar Email
                                    </button>
                                </div>
                            </div>

                            {pairingCode && (
                                <div className="mt-4 p-4 bg-black/40 rounded-xl border border-violet-500/10">
                                    <p className="text-sm text-gray-300">
                                        Envie no bot admin: <span className="font-mono text-white">/link {pairingCode}</span>
                                    </p>
                                    {pairingExpiresAt && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Expira em: {new Date(pairingExpiresAt).toLocaleString('pt-BR')}
                                        </p>
                                    )}
                                </div>
                            )}

                            {adminsTelegram.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-2">Admins vinculados</p>
                                    <div className="grid gap-2">
                                        {adminsTelegram.map((a) => (
                                            <div key={a.email} className="flex items-center justify-between text-sm">
                                                <span className="text-gray-300">{a.email}</span>
                                                <span className={a.telegramLinked ? 'text-emerald-400' : 'text-gray-500'}>
                                                    {a.telegramLinked ? 'Vinculado' : 'Nao vinculado'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Botão Salvar */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="animate-spin" size={20} />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}
