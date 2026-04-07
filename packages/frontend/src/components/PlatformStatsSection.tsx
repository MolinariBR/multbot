import { History } from 'lucide-react';
import { PlatformStatus } from '../types';

interface PlatformStatsSectionProps {
  collapsed: boolean;
  dashboardStats: { botsCount: number; totalRevenue: number } | null;
  platformStatus: PlatformStatus | null;
}

export function PlatformStatsSection({
  collapsed,
  dashboardStats,
  platformStatus
}: PlatformStatsSectionProps) {
  if (collapsed) return null;

  return (
    <div className="px-4 pb-6">
      <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-violet-500/20">
        <div className="flex items-center gap-2 mb-3">
          <History className="text-violet-400" size={18} />
          <span className="text-white font-semibold text-sm">Status da Plataforma</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">API</span>
            <span className="text-white font-bold text-sm">
              {platformStatus?.apiOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Bots (ativos/rodando)</span>
            <span className="text-white font-bold text-sm">
              {platformStatus ? `${platformStatus.bots.activeConfigured}/${platformStatus.bots.running}` : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Depix</span>
            <span className={`font-bold text-sm ${platformStatus?.depix.configured ? 'text-emerald-400' : 'text-amber-400'}`}>
              {platformStatus ? (platformStatus.depix.configured ? 'Configurado' : 'Pendente') : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-xs">Volume Total</span>
            <span className="text-emerald-400 font-bold text-sm">
              R$ {(((dashboardStats?.totalRevenue ?? 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-1.5 mt-3">
            <div
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full animate-pulse"
              style={{ width: platformStatus?.apiOnline ? '100%' : '20%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}