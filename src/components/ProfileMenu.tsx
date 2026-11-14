import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArtworkImage } from './ArtworkImage';

export function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        to="/login"
        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full bg-zinc-200/70 dark:bg-[#191D26] hover:bg-zinc-200 dark:hover:bg-[#222733] border border-zinc-300/60 dark:border-white/10 transition-colors"
      >
        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
          <ArtworkImage src={user.avatar_url} alt={user.full_name} rounded="full" />
        </div>
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 max-w-[110px] truncate hidden sm:inline">
          {user.full_name}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#151821] border border-zinc-200 dark:border-white/10 shadow-2xl py-1.5 z-50"
        >
          <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-white/[0.06]">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
          </div>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <User className="w-4 h-4 text-zinc-400" />
            <span>Profile</span>
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}
