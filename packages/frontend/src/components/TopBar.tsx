import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

interface TopBarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export function TopBar({ isMobileMenuOpen, setIsMobileMenuOpen }: TopBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    navigate('/login');
  };

  return (
    <header className="h-20 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-b border-violet-500/10 px-6 flex items-center justify-between">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-6">
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}