import { Heart, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { EmptyState } from '../components/EmptyState';
import {
  LibraryFilters,
  type LibraryFilterType,
  type LibrarySortType,
} from '../components/LibraryFilters';
import { PlaylistCard } from '../components/PlaylistCard';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongRow } from '../components/SongRow';
import { useLibrary } from '../context/LibraryContext';
import type { Song } from '../types/music';

interface LayoutOutletContext {
  openCreatePlaylist: () => void;
}

export function LibraryPage() {
  const { openCreatePlaylist } = useOutletContext<LayoutOutletContext>();
  const {
    songs,
    albums,
    artists,
    userPlaylists,
    curatedPlaylists,
    likedSongIds,
    followedArtistIds,
    recentlyPlayed,
    getSongById,
  } = useLibrary();

  const [filter, setFilter] = useState<LibraryFilterType>('all');
  const [sort, setSort] = useState<LibrarySortType>('recent');
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const likedSongs = useMemo(
    () => likedSongIds.map((id) => getSongById(id)).filter((s): s is Song => Boolean(s)),
    [getSongById, likedSongIds]
  );

  const followedArtists = useMemo(
    () => artists.filter((a) => followedArtistIds.includes(a.id)),
    [artists, followedArtistIds]
  );

  const sortedPlaylists = useMemo(() => {
    const combined = [...userPlaylists, ...curatedPlaylists.slice(0, 4)];
    if (sort === 'alphabetical') {
      return [...combined].sort((a, b) => a.name.localeCompare(b.name));
    }
    return combined;
  }, [curatedPlaylists, sort, userPlaylists]);

  const sortedSongs = useMemo(() => {
    const base = [...likedSongs];
    if (sort === 'alphabetical') {
      return base.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === 'played') {
      const playOrder = new Map(recentlyPlayed.map((r, i) => [r.song_id, i]));
      return base.sort((a, b) => (playOrder.get(a.id) ?? 999) - (playOrder.get(b.id) ?? 999));
    }
    return base;
  }, [likedSongs, recentlyPlayed, sort]);

  const sortedAlbums = useMemo(() => {
    if (sort === 'alphabetical') return [...albums].sort((a, b) => a.title.localeCompare(b.title));
    return albums;
  }, [albums, sort]);

  const sortedArtists = useMemo(() => {
    const list = followedArtists.length > 0 ? followedArtists : artists.slice(0, 5);
    if (sort === 'alphabetical') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [artists, followedArtists, sort]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Your Library
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Playlists, liked songs, albums, and artists you follow.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreatePlaylist}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New playlist</span>
        </button>
      </div>

      <LibraryFilters
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
      />

      {/* Quick Spotlight: Liked Songs & Recently Played */}
      {filter === 'all' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/liked"
            className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 border border-amber-500/25 hover:border-amber-500/50 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Collection
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Liked Songs</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {likedSongs.length} saved tracks
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </Link>

          <Link
            to="/recently-played"
            className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                History
              </p>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
                Recently Played
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                {recentlyPlayed.length} recent sessions
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              View all
            </span>
          </Link>
        </div>
      )}

      {(filter === 'all' || filter === 'playlists') && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Playlists</h2>
          {sortedPlaylists.length === 0 ? (
            <EmptyState
              title="No playlists yet"
              description="Create your first Soundify playlist to organize your favorite tracks."
              actionLabel="Create playlist"
              onAction={openCreatePlaylist}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sortedPlaylists.map((pl) => (
                <PlaylistCard key={pl.id} playlist={pl} />
              ))}
            </div>
          )}
        </section>
      )}

      {(filter === 'all' || filter === 'songs') && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Saved Songs ({sortedSongs.length})
          </h2>
          {sortedSongs.length === 0 ? (
            <EmptyState
              title="No liked songs yet"
              description="Tap the heart icon on any track to keep it in your library."
            />
          ) : (
            <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
              {sortedSongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  queueContext={sortedSongs.length ? sortedSongs : songs}
                  onAddToPlaylist={setModalSong}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {(filter === 'all' || filter === 'albums') && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedAlbums.slice(0, 10).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {(filter === 'all' || filter === 'artists') && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sortedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
