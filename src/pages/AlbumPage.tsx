import { Play, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArtworkImage } from '../components/ArtworkImage';
import { EmptyState } from '../components/EmptyState';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongRow } from '../components/SongRow';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatTotalDuration } from '../lib/format';
import type { Song } from '../types/music';

export function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { albums, songs } = useLibrary();
  const { playSong } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const album = useMemo(() => albums.find((a) => a.id === id), [albums, id]);
  const tracks = useMemo(
    () =>
      songs
        .filter((s) => s.album_id === id)
        .sort((a, b) => a.track_number - b.track_number),
    [id, songs]
  );

  const totalSeconds = useMemo(
    () => tracks.reduce((sum, t) => sum + t.duration, 0),
    [tracks]
  );

  if (!album) {
    return (
      <EmptyState
        title="Album not found"
        description="This album could not be located in the Soundify catalog."
        actionLabel="Back to home"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08]">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden shadow-xl shrink-0">
          <ArtworkImage src={album.cover_url} alt={album.title} rounded="xl" />
        </div>
        <div className="space-y-2.5 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Album <span aria-hidden="true">·</span> {album.genre}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {album.title}
          </h1>
          {album.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
              {album.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Link
              to={`/artist/${album.artist_id}`}
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              {album.artist_name}
            </Link>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{album.release_year}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{formatTotalDuration(totalSeconds)}</span>
          </div>

          {tracks.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => playSong(tracks[0], tracks)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play album</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                  playSong(shuffled[0], shuffled);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-[#191D26] hover:bg-zinc-200 dark:hover:bg-[#232835] text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-colors"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
        {tracks.map((song, idx) => (
          <SongRow
            key={song.id}
            song={song}
            index={idx}
            queueContext={tracks}
            showAlbum={false}
            onAddToPlaylist={setModalSong}
          />
        ))}
      </section>

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
