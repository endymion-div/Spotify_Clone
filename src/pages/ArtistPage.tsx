import { CheckCircle2, Play, UserCheck, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { ArtworkImage } from '../components/ArtworkImage';
import { EmptyState } from '../components/EmptyState';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongRow } from '../components/SongRow';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatCompactNumber } from '../lib/format';
import type { Song } from '../types/music';

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { artists, albums, songs, isArtistFollowed, toggleFollowArtist } = useLibrary();
  const { playSong } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const artist = useMemo(() => artists.find((a) => a.id === id), [artists, id]);
  const popularSongs = useMemo(
    () =>
      songs
        .filter((s) => s.artist_id === id)
        .sort((a, b) => b.popularity - a.popularity),
    [id, songs]
  );
  const artistAlbums = useMemo(
    () => albums.filter((al) => al.artist_id === id),
    [albums, id]
  );
  const relatedArtists = useMemo(() => {
    if (!artist) return [];
    return artists
      .filter((a) => a.id !== artist.id)
      .sort((a, b) => (a.genre === artist.genre ? -1 : b.genre === artist.genre ? 1 : 0))
      .slice(0, 5);
  }, [artist, artists]);

  if (!artist) {
    return (
      <EmptyState
        title="Artist not found"
        description="The artist you are looking for does not exist in the catalog."
        actionLabel="Back to home"
        onAction={() => navigate('/')}
      />
    );
  }

  const following = isArtistFollowed(artist.id);

  return (
    <div className="space-y-10">
      {/* Artist Header */}
      <header className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08]">
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-500/30">
          <ArtworkImage src={artist.image_url} alt={artist.name} rounded="full" />
        </div>

        <div className="space-y-2.5 min-w-0 flex-1">
          {artist.verified && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Artist</span>
            </p>
          )}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {artist.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">{artist.bio}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular">
            {formatCompactNumber(artist.monthly_listeners)} monthly listeners{' '}
            <span aria-hidden="true">·</span> {formatCompactNumber(artist.followers)} followers{' '}
            <span aria-hidden="true">·</span> {artist.genre}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {popularSongs.length > 0 && (
              <button
                type="button"
                onClick={() => playSong(popularSongs[0], popularSongs)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => toggleFollowArtist(artist.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                following
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'border-zinc-300 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{following ? 'Following' : 'Follow'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Popular Songs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Popular</h2>
        {popularSongs.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No tracks available yet.</p>
        ) : (
          <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
            {popularSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={popularSongs}
                onAddToPlaylist={setModalSong}
              />
            ))}
          </div>
        )}
      </section>

      {/* Albums & Singles */}
      {artistAlbums.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {artistAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {relatedArtists.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Fans also like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedArtists.map((rel) => (
              <ArtistCard key={rel.id} artist={rel} />
            ))}
          </div>
        </section>
      )}

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
