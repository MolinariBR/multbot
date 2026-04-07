import { useState, useEffect, ReactNode } from 'react';
import {
  LayoutDashboard,
  Bot,
  History,
  Settings
} from 'lucide-react';
import { api } from '../lib/api';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { PlatformStatus } from '../types';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Painel', href: '/painel', icon: LayoutDashboard },
    { name: 'Gerenciamento de Bots', href: '/bots', icon: Bot },
    { name: 'Transações', href: '/transacoes', icon: History },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const [dashboardStats, setDashboardStats] = useState<{ botsCount: number; totalRevenue: number } | null>(null);
  const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const response = await api.get('/dashboard/stats');
      setDashboardStats(response.data);
    };

    const fetchPlatformStatus = async () => {
      const response = await api.get('/dashboard/platform-status');
      setPlatformStatus(response.data);
    };

    const fetchSidebarData = async () => {
      try {
        await Promise.all([fetchDashboardStats(), fetchPlatformStatus()]);
      } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard ou status da plataforma:', error);
      }
    };

    fetchSidebarData();

    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchSidebarData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        navigation={navigation}
        dashboardStats={dashboardStats}
        platformStatus={platformStatus}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
