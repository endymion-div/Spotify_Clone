import { Clock, Heart, Home, Library, ListMusic, PlusCircle, Search, Settings, User, X } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onOpenCreatePlaylist,
  mobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const { user } = useAuth();
  const { userPlaylists, likedSongIds } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreateClick = () => {
    if (!user) {
      showToast('Please log in to create a playlist.', 'warning');
      navigate('/login');
      onCloseMobile?.();
      return;
    }
    onOpenCreatePlaylist();
    onCloseMobile?.();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400 font-semibold'
        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-white/[0.04]'
    }`;

  const content = (
    <div className="flex flex-col h-full bg-zinc-100 dark:bg-[#0E1117] border-r border-zinc-200 dark:border-white/[0.08] w-64 shrink-0">
      <div className="flex items-center justify-between px-5 h-16 border-b border-zinc-200 dark:border-white/[0.06] shrink-0">
        <Link
          to="/"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <img
            src="/images/soundify-mark.svg"
            alt="Soundify logo"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-display text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
            Soundify
          </span>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className="px-3 py-4 space-y-1">
        <NavLink to="/" end className={navLinkClass} onClick={onCloseMobile}>
          <Home className="w-4 h-4 shrink-0" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={navLinkClass} onClick={onCloseMobile}>
          <Search className="w-4 h-4 shrink-0" />
          <span>Search</span>
        </NavLink>
        <NavLink to="/library" className={navLinkClass} onClick={onCloseMobile}>
          <Library className="w-4 h-4 shrink-0" />
          <span>Your Library</span>
        </NavLink>
      </nav>

      <div className="px-3 pt-2 pb-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-1">
        <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          Collection
        </p>
        <NavLink to="/liked" className={navLinkClass} onClick={onCloseMobile}>
          <Heart className="w-4 h-4 shrink-0 text-amber-500" />
          <span className="flex-1 truncate">Liked Songs</span>
          <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
            {likedSongIds.length}
          </span>
        </NavLink>
        <NavLink to="/recently-played" className={navLinkClass} onClick={onCloseMobile}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>Recently Played</span>
        </NavLink>
        <button
          type="button"
          onClick={handleCreateClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-white/[0.04] transition-colors text-left"
        >
          <PlusCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Create Playlist</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 soundify-scroll">
        <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          My Playlists
        </p>
        {userPlaylists.length === 0 ? (
          <p className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
            No playlists created yet.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {userPlaylists.map((pl) => (
              <li key={pl.id}>
                <NavLink
                  to={`/playlist/${pl.id}`}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-zinc-200 dark:bg-white/[0.08] text-zinc-950 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/40 dark:hover:bg-white/[0.03]'
                    }`
                  }
                >
                  <ListMusic className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-3 border-t border-zinc-200 dark:border-white/[0.06] space-y-1 shrink-0">
        <NavLink to="/profile" className={navLinkClass} onClick={onCloseMobile}>
          <User className="w-4 h-4 shrink-0" />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/settings" className={navLinkClass} onClick={onCloseMobile}>
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );

  return (
    <>
      <aside aria-label="Sidebar navigation" className="hidden md:flex h-full shrink-0">
        {content}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
