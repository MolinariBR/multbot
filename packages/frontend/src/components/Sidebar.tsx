import { Menu } from 'lucide-react';
import { PlatformStatus } from '../types';
import { LogoSection } from './LogoSection';
import { NavigationSection } from './NavigationSection';
import { PlatformStatsSection } from './PlatformStatsSection';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  navigation: Array<{ name: string; href: string; icon: any }>;
  dashboardStats: { botsCount: number; totalRevenue: number } | null;
  platformStatus: PlatformStatus | null;
}

export function Sidebar({
  collapsed,
  setCollapsed,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navigation,
  dashboardStats,
  platformStatus
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col
        bg-gradient-to-b from-zinc-950 via-black to-zinc-950
        border-r border-violet-500/10 transition-all duration-300
        ${collapsed ? 'w-20' : 'w-72'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <LogoSection collapsed={collapsed} />

      <NavigationSection
        collapsed={collapsed}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
      />

      <PlatformStatsSection
        collapsed={collapsed}
        dashboardStats={dashboardStats}
        platformStatus={platformStatus}
      />

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-14 border-t border-violet-500/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
      >
        <Menu size={20} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
      </button>
    </aside>
  );
}