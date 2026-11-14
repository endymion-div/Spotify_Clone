import { Home, Library, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function MobileNavigation() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center min-h-[48px] text-[11px] font-medium transition-colors ${
      isActive
        ? 'text-amber-600 dark:text-amber-400 font-semibold'
        : 'text-zinc-600 dark:text-zinc-400'
    }`;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-[56px] bg-white/95 dark:bg-[#0E1117]/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/[0.08] grid grid-cols-4"
    >
      <NavLink to="/" end className={linkClass}>
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={linkClass}>
        <Search className="w-5 h-5 mb-0.5" />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className={linkClass}>
        <Library className="w-5 h-5 mb-0.5" />
        <span>Library</span>
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
