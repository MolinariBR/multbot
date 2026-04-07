interface BotDetailsData {
    id: string;
    name: string;
    telegramToken: string;
    telegramUsername: string | null;
    ownerName: string;
    depixAddress: string;
    splitRate: number;
    status: string;
    totalRevenue: number;
    transactionsCount: number;
    createdAt: string;
    updatedAt: string;
}

interface BotDetailsCardsProps {
    bot: BotDetailsData;
}

export function BotDetailsCards({ bot }: BotDetailsCardsProps) {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Detalhes Técnicos</h3>
                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Telegram Token</p>
                        <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-300 break-all">
                            {bot.telegramToken.substring(0, 10)}...{bot.telegramToken.substring(bot.telegramToken.length - 10)}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Depix Address (Liquid)</p>
                        <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-300 break-all">
                            {bot.depixAddress}
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Bot ID</p>
                        <div className="bg-black/50 p-3 rounded-lg border border-violet-500/10 font-mono text-sm text-gray-500">
                            {bot.id}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-zinc-900/50 to-black rounded-2xl border border-violet-500/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Últimas Atividades</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-center h-40 text-gray-500 text-sm italic border border-dashed border-gray-800 rounded-xl">
                        Nenhuma atividade recente para exibir.
                        <br />
                        (Histórico detalhado em desenvolvimento)
                    </div>
                </div>
            </div>
        </div>
    );
}