import { Check, ListMusic, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { createArtworkDataUri } from '../lib/artwork';
import type { Song } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface PlaylistModalProps {
  song: Song | null;
  onClose: () => void;
}

export function PlaylistModal({ song, onClose }: PlaylistModalProps) {
  const { user } = useAuth();
  const { userPlaylists, addSongToPlaylist, createPlaylist } = useLibrary();
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  if (!song) return null;

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const created = await createPlaylist({
      name: newName.trim(),
      description: `Custom mix featuring ${song.title}`,
      cover_url: createArtworkDataUri(newName.trim(), 'playlist'),
    });
    if (created) {
      await addSongToPlaylist(created.id, song.id);
      setNewName('');
      onClose();
    }
    setCreating(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-playlist-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151821] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <h2 id="add-to-playlist-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Add to playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close add to playlist modal"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-100 dark:bg-[#0E1015]">
            <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
              <ArtworkImage src={song.cover_url} alt={song.title} rounded="md" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{song.title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{song.artist_name}</p>
            </div>
          </div>

          {!user ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Please sign in to save tracks to your custom playlists.
            </p>
          ) : (
            <>
              <div className="max-h-56 overflow-y-auto space-y-1.5 soundify-scroll">
                {userPlaylists.length === 0 ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 py-3 text-center">
                    You do not have any custom playlists yet. Create one below.
                  </p>
                ) : (
                  userPlaylists.map((pl) => {
                    const exists = pl.song_ids.includes(song.id);
                    return (
                      <button
                        key={pl.id}
                        type="button"
                        onClick={async () => {
                          await addSongToPlaylist(pl.id, song.id);
                          onClose();
                        }}
                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ListMusic className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {pl.name}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {pl.song_ids.length} songs
                            </p>
                          </div>
                        </div>
                        {exists ? (
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Plus className="w-4 h-4 text-zinc-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleQuickCreate} className="pt-3 border-t border-zinc-200 dark:border-white/[0.08] flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New playlist name..."
                  aria-label="New playlist name"
                  className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  Create & Add
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
