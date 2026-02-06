import { useState, useEffect, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Bot, History, Menu, X, Zap, LogOut, TrendingUp, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const adminName = localStorage.getItem('adminName') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    navigate('/login')
  }

  const navigation = [
    { name: 'Painel', href: '/painel', icon: LayoutDashboard },
    { name: 'Gerenciamento de Bots', href: '/bots', icon: Bot },
    { name: 'Transações', href: '/transacoes', icon: History },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ]

  const isActive = (path: string) => location.pathname === path

  const [stats, setStats] = useState<{ botsCount: number; totalRevenue: number } | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await import('../lib/api').then(m => m.api.get('/dashboard/stats'));
        setStats(data);
      } catch (error) {
        console.error('Erro ao buscar stats da sidebar:', error);
      }
    };

    fetchStats();

    // Atualizar a cada 60 segundos
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-r border-violet-500/10 transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-violet-500/10">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Admin Depix</h1>
                <p className="text-violet-400 text-xs mt-0.5">Rede Liquid</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/50 mx-auto">
              <Zap className="text-white" size={24} />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${active
                  ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${collapsed ? 'justify-center' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon
                  size={22}
                  className={active ? 'text-violet-400' : 'group-hover:text-violet-400'}
                />
                {!collapsed && <span className="font-medium">{item.name}</span>}
                {active && !collapsed && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Platform Stats */}
        {!collapsed && stats && (
          <div className="px-4 pb-6">
            <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-violet-400" size={18} />
                <span className="text-white font-semibold text-sm">Status da Plataforma</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Bots Ativos</span>
                  <span className="text-white font-bold text-sm">{stats.botsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-xs">Volume Total</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    R$ {(stats.totalRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-1.5 mt-3">
                  <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-14 border-t border-violet-500/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Menu size={20} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-b border-violet-500/10 px-6 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-white font-semibold text-sm">{adminName}</p>
              <p className="text-violet-400 text-xs">Plataforma MultiBot</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
