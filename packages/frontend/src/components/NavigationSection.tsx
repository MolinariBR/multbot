import { Link, useLocation } from 'react-router-dom';

interface NavigationSectionProps {
  collapsed: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
  navigation: Array<{ name: string; href: string; icon: any }>;
}

export function NavigationSection({
  collapsed,
  setIsMobileMenuOpen,
  navigation
}: NavigationSectionProps) {
  const location = useLocation();

  const isNavigationItemActive = (path: string) => location.pathname === path;

  return (
    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
      {navigation.map((navItem) => {
        const Icon = navItem.icon;
        const active = isNavigationItemActive(navItem.href);
        return (
          <Link
            key={navItem.name}
            to={navItem.href}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
              ${active
                ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-500/30 shadow-lg shadow-violet-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
              ${collapsed ? 'justify-center' : ''}
            `}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Icon
              size={22}
              className={active ? 'text-violet-400' : 'group-hover:text-violet-400'}
            />
            {!collapsed && <span className="font-medium">{navItem.name}</span>}
            {active && !collapsed && (
              <div className="ml-auto w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}