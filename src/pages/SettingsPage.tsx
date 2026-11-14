import { LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { ThemeMode } from '../types/music';

export function SettingsPage() {
  const { user, settings, isDemoMode, updateSettings, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleThemeChange = async (theme: ThemeMode) => {
    await updateSettings({ theme });
    showToast(`Appearance set to ${theme}.`, 'info');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Manage appearance, audio playback, notifications, privacy, and account preferences.
        </p>
      </div>

      {/* Profile Settings Shortcut */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Profile settings</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Signed in as {user?.full_name} ({user?.email})
          </p>
        </div>
        <Link
          to="/profile"
          className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-[#1D222D] hover:bg-zinc-200 dark:hover:bg-[#262C3A] text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
        >
          Edit profile
        </Link>
      </section>

      {/* Appearance */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Appearance</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Choose your preferred interface theme across Soundify.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { id: 'dark', label: 'Dark mode', icon: Moon },
              { id: 'light', label: 'Light mode', icon: Sun },
              { id: 'system', label: 'System default', icon: Monitor },
            ] as const
          ).map(({ id, label, icon: Icon }) => {
            const active = settings.theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeChange(id)}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                  active
                    ? 'border-amber-500 bg-amber-500/12 text-amber-600 dark:text-amber-400'
                    : 'border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Audio Settings */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Audio settings</h2>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Streaming quality</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select audio fidelity for playback sessions.
            </p>
          </div>
          <select
            aria-label="Streaming quality"
            value={settings.audio_quality}
            onChange={(e) =>
              updateSettings({
                audio_quality: e.target.value as 'standard' | 'high' | 'lossless',
              })
            }
            className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-zinc-100"
          >
            <option value="standard">Standard (128 kbps)</option>
            <option value="high">High (320 kbps)</option>
            <option value="lossless">Studio Lossless</option>
          </select>
        </div>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
              Autoplay similar songs
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Automatically advance to the next song in queue when a track finishes.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.autoplay}
            onChange={(e) => updateSettings({ autoplay: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
        </label>
      </section>

      {/* Notifications & Privacy */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
          Notifications &amp; Privacy
        </h2>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
              Playlist &amp; recommendation alerts
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive in-app updates for new mixes and personalized picks.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.push_notifications}
            onChange={(e) => updateSettings({ push_notifications: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
        </label>

        <label className="flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block">
              Private session
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Pause recording tracks to your Recently Played history.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.private_session}
            onChange={(e) => updateSettings({ private_session: e.target.checked })}
            className="w-4 h-4 accent-amber-500"
          />
        </label>
      </section>

      {/* Account */}
      <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Account</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Storage mode: {isDemoMode ? 'Local Demo Mode (browser persistence)' : 'Supabase PostgreSQL'}
          </p>
        </div>

        <button
          type="button"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </section>
    </div>
  );
}
