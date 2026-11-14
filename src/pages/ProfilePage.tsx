import { Calendar, Heart, ListMusic, Save } from 'lucide-react';
import { useState } from 'react';
import { ArtworkImage } from '../components/ArtworkImage';
import { PlaylistCard } from '../components/PlaylistCard';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { GENERATED_MEDIA } from '../lib/artwork';

const AVATAR_PRESETS = [
  { label: 'Studio Headphones', url: GENERATED_MEDIA.avatarSnehaProfile },
  { label: 'Midnight Producer', url: GENERATED_MEDIA.artistNovaLane },
  { label: 'Acoustic Window', url: GENERATED_MEDIA.coverGoldenHour },
  { label: 'Coastal Mist', url: GENERATED_MEDIA.coverCoastalEcho },
];

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { userPlaylists, likedSongIds } = useLibrary();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? GENERATED_MEDIA.avatarSnehaProfile);
  const [bio, setBio] = useState(user?.bio ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    await updateProfile({
      full_name: fullName.trim(),
      avatar_url: avatarUrl.trim() || GENERATED_MEDIA.avatarSnehaProfile,
      bio: bio.trim(),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Profile Hero */}
      <header className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08]">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-500/30">
          <ArtworkImage src={user.avatar_url} alt={user.full_name} rounded="full" />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Listener Profile
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-zinc-900 dark:text-white truncate">
            {user.full_name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
          {user.bio && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 pt-1">{user.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Member since {memberSince}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5" />
              {userPlaylists.length} playlists
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-500" />
              {likedSongIds.length} liked songs
            </span>
          </div>
        </div>
      </header>

      {/* Edit Profile Form */}
      <section className="p-6 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Edit profile</h2>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Display name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label htmlFor="profile-photo" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Profile photo URL
              </label>
              <input
                id="profile-photo"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Or choose a studio portrait preset
            </p>
            <div className="flex flex-wrap gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAvatarUrl(preset.url)}
                  className={`flex items-center gap-2 pr-3 pl-1.5 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    avatarUrl === preset.url
                      ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full overflow-hidden">
                    <ArtworkImage src={preset.url} alt={preset.label} rounded="full" />
                  </span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what genres and moods you enjoy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 text-sm font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save profile'}</span>
          </button>
        </form>
      </section>

      {userPlaylists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Your playlists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {userPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
