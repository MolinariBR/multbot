import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
    adminName: string;
    lastUpdate: Date;
    onRefresh: () => void;
    refreshing: boolean;
}

export function DashboardHeader({ adminName, lastUpdate, onRefresh, refreshing }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                    Bem-vindo, {adminName}
                </h1>
                <p className="text-gray-400 text-lg">
                    Visão geral da sua plataforma MultiBot
                </p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden md:block">
                    Atualizado: {lastUpdate.toLocaleTimeString()}
                </span>
                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="p-2.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 rounded-xl transition-all border border-violet-500/20"
                    title="Atualizar dados"
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );
}