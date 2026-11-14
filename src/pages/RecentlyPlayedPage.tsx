import { Clock, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongRow } from '../components/SongRow';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import type { Song } from '../types/music';

export function RecentlyPlayedPage() {
  const { recentlyPlayed, getSongById } = useLibrary();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const recentTracks = useMemo(() => {
    const items: { song: Song; playedAt: string }[] = [];
    for (const entry of recentlyPlayed) {
      const s = getSongById(entry.song_id);
      if (s) items.push({ song: s, playedAt: entry.played_at });
    }
    return items;
  }, [getSongById, recentlyPlayed]);

  const queueList = useMemo(() => recentTracks.map((r) => r.song), [recentTracks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Recently Played
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Your latest listening history across Soundify.
          </p>
        </div>

        {queueList.length > 0 && (
          <button
            type="button"
            onClick={() => playSong(queueList[0], queueList)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Play history</span>
          </button>
        )}
      </div>

      {recentTracks.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-6 h-6" />}
          title="No listening history yet"
          description="Tracks you listen to will be recorded here automatically unless Private Session is enabled."
          actionLabel="Explore home"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
          {recentTracks.map(({ song, playedAt }, idx) => (
            <div key={`${song.id}-${playedAt}-${idx}`} className="py-0.5">
              <SongRow
                song={song}
                index={idx}
                queueContext={queueList}
                onAddToPlaylist={setModalSong}
              />
            </div>
          ))}
        </div>
      )}

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
