import { Heart, Play, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongRow } from '../components/SongRow';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatTotalDuration } from '../lib/format';
import type { Song } from '../types/music';

export function LikedSongsPage() {
  const { likedSongIds, getSongById } = useLibrary();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const likedSongs = useMemo(
    () => likedSongIds.map((id) => getSongById(id)).filter((s): s is Song => Boolean(s)),
    [getSongById, likedSongIds]
  );

  const totalSeconds = useMemo(
    () => likedSongs.reduce((sum, s) => sum + s.duration, 0),
    [likedSongs]
  );

  const handlePlayAll = () => {
    if (likedSongs.length > 0) {
      playSong(likedSongs[0], likedSongs);
    }
  };

  const handleShufflePlay = () => {
    if (likedSongs.length > 0) {
      const shuffled = [...likedSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border border-amber-500/20">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center shadow-xl shrink-0">
          <Heart className="w-16 h-16 fill-current" />
        </div>
        <div className="space-y-2 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Playlist
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            Liked Songs
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono-tabular">
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}{' '}
            <span aria-hidden="true">·</span> {formatTotalDuration(totalSeconds)}
          </p>
        </div>
      </header>

      {likedSongs.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlayAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play all</span>
          </button>
          <button
            type="button"
            onClick={handleShufflePlay}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-[#191D26] hover:bg-zinc-200 dark:hover:bg-[#232835] text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {likedSongs.length === 0 ? (
        <EmptyState
          icon={<Heart className="w-6 h-6" />}
          title="Songs you like will appear here"
          description="Click the heart icon next to any track across Soundify to build your favorites collection."
          actionLabel="Discover music"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
          {likedSongs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              index={idx}
              queueContext={likedSongs}
              onAddToPlaylist={setModalSong}
            />
          ))}
        </div>
      )}

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
