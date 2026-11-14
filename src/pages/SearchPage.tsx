import { Clock, Compass, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PlaylistModal } from '../components/PlaylistModal';
import { SearchBar } from '../components/SearchBar';
import { SearchResults } from '../components/SearchResults';
import { useLibrary } from '../context/LibraryContext';
import { MOOD_GENRE_CATEGORIES } from '../data/catalog';
import { searchCatalog } from '../lib/format';
import type { Song } from '../types/music';

type SearchCategory = 'all' | 'songs' | 'artists' | 'albums' | 'playlists';

const SEARCH_SUGGESTIONS = ['Nova Lane', 'Aarav Sen', 'Midnight Drive', 'Electronic', 'Indie'];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';

  const {
    songs,
    artists,
    albums,
    allPlaylists,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    isLoadingCatalog,
  } = useLibrary();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<SearchCategory>('all');
  const [modalSong, setModalSong] = useState<Song | null>(null);

  useEffect(() => {
    const paramQ = searchParams.get('q') ?? '';
    setQuery(paramQ);
  }, [searchParams]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    if (next.trim()) {
      setSearchParams({ q: next }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleSelectSuggestion = (term: string) => {
    handleQueryChange(term);
    addRecentSearch(term);
  };

  const results = useMemo(
    () => searchCatalog(query, { songs, artists, albums, playlists: allPlaylists }),
    [albums, allPlaylists, artists, query, songs]
  );

  if (isLoadingCatalog) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Search</h1>
        <SearchBar
          value={query}
          onChange={handleQueryChange}
          onSubmit={(val) => addRecentSearch(val)}
          autoFocus
        />

        {query.trim() && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(['all', 'songs', 'artists', 'albums', 'playlists'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'bg-zinc-200/70 dark:bg-[#13161C] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-[#1E222B]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {query.trim() ? (
        <SearchResults
          query={query}
          results={results}
          activeCategory={category}
          onAddToPlaylist={setModalSong}
          onClearSearch={() => handleQueryChange('')}
        />
      ) : (
        <div className="space-y-8">
          {recentSearches.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Recent searches</span>
                </h2>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear history</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectSuggestion(term)}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] hover:border-amber-500/60 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
              Suggested searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSelectSuggestion(term)}
                  className="px-3.5 py-2 rounded-lg bg-zinc-200/70 dark:bg-[#191D26] hover:bg-amber-500 hover:text-zinc-950 text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Browse moods &amp; genres</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MOOD_GENRE_CATEGORIES.map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleSelectSuggestion(genre)}
                  className="p-4 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] hover:border-amber-500/60 text-left transition-colors"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{genre}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Explore {genre.toLowerCase()} tracks
                  </p>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
