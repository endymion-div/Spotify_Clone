import { Bell, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileMenu } from './ProfileMenu';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllNotificationsRead, markNotificationRead } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="md:sticky md:top-0 z-20 h-14 md:h-16 px-4 sm:px-6 flex items-center justify-between gap-4 bg-zinc-50/95 dark:bg-[#0B0D11]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-white/[0.06] shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-white/[0.06]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="md:hidden flex items-center gap-2 whitespace-nowrap shrink-0">
          <img src="/images/soundify-mark.svg" alt="Soundify" className="w-7 h-7 rounded-md" />
          <span className="font-display text-base font-bold text-zinc-900 dark:text-white">
            Soundify
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-[#161A22] hover:bg-zinc-300/80 dark:hover:bg-[#1F2430] flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigate(1)}
            aria-label="Go forward"
            className="w-8 h-8 rounded-full bg-zinc-200/80 dark:bg-[#161A22] hover:bg-zinc-300/80 dark:hover:bg-[#1F2430] flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative w-9 h-9 rounded-full bg-zinc-200/70 dark:bg-[#161A22] hover:bg-zinc-200 dark:hover:bg-[#1F2430] flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              role="region"
              aria-label="Notifications panel"
              className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#151821] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden z-50"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-white/[0.06]">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100 dark:divide-white/[0.05] soundify-scroll">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                        if (n.href) navigate(n.href);
                      }}
                      className={`w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-colors ${
                        !n.read ? 'bg-amber-500/[0.05]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <ProfileMenu />
      </div>
    </header>
  );
}
