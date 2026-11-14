import { Search } from 'lucide-react';
import type { SearchResultBundle, Song } from '../types/music';
import { AlbumCard } from './AlbumCard';
import { ArtistCard } from './ArtistCard';
import { EmptyState } from './EmptyState';
import { PlaylistCard } from './PlaylistCard';
import { SongRow } from './SongRow';

interface SearchResultsProps {
  query: string;
  results: SearchResultBundle;
  activeCategory: 'all' | 'songs' | 'artists' | 'albums' | 'playlists';
  onAddToPlaylist: (song: Song) => void;
  onClearSearch: () => void;
}

export function SearchResults({
  query,
  results,
  activeCategory,
  onAddToPlaylist,
  onClearSearch,
}: SearchResultsProps) {
  const totalCount =
    results.songs.length +
    results.artists.length +
    results.albums.length +
    results.playlists.length;

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Search className="w-6 h-6" />}
        title={`No results found for "${query}"`}
        description="Try searching by song title, artist name like Nova Lane or Aarav Sen, album, or mood."
        actionLabel="Clear search"
        onAction={onClearSearch}
      />
    );
  }

  const showSongs = (activeCategory === 'all' || activeCategory === 'songs') && results.songs.length > 0;
  const showArtists = (activeCategory === 'all' || activeCategory === 'artists') && results.artists.length > 0;
  const showAlbums = (activeCategory === 'all' || activeCategory === 'albums') && results.albums.length > 0;
  const showPlaylists =
    (activeCategory === 'all' || activeCategory === 'playlists') && results.playlists.length > 0;

  return (
    <div className="space-y-8">
      {showSongs && (
        <section aria-labelledby="search-songs-heading">
          <h2 id="search-songs-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Songs ({results.songs.length})
          </h2>
          <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
            {results.songs.slice(0, activeCategory === 'songs' ? 30 : 6).map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={results.songs}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}

      {showArtists && (
        <section aria-labelledby="search-artists-heading">
          <h2 id="search-artists-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Artists ({results.artists.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section aria-labelledby="search-albums-heading">
          <h2 id="search-albums-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Albums ({results.albums.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {showPlaylists && (
        <section aria-labelledby="search-playlists-heading">
          <h2 id="search-playlists-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Playlists ({results.playlists.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
