import { Menu, Zap } from 'lucide-react';

interface LogoSectionProps {
  collapsed: boolean;
}

export function LogoSection({ collapsed }: LogoSectionProps) {
  return (
    <div className="flex items-center justify-between h-20 px-6 border-b border-violet-500/10">
      {!collapsed && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Zydra.org</h1>
            <p className="text-violet-400 text-xs mt-0.5">Rede Liquid</p>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50 mx-auto">
          <Menu className="text-white" size={24} />
        </div>
      )}
    </div>
  );
}