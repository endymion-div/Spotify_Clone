export type LibraryFilterType = 'all' | 'playlists' | 'songs' | 'albums' | 'artists';
export type LibrarySortType = 'recent' | 'alphabetical' | 'played';

interface LibraryFiltersProps {
  filter: LibraryFilterType;
  onFilterChange: (filter: LibraryFilterType) => void;
  sort: LibrarySortType;
  onSortChange: (sort: LibrarySortType) => void;
}

const FILTER_OPTIONS: { id: LibraryFilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'songs', label: 'Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
];

export function LibraryFilters({
  filter,
  onFilterChange,
  sort,
  onSortChange,
}: LibraryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/70 dark:bg-[#13161C] border border-zinc-300/60 dark:border-white/[0.06] overflow-x-auto">
        {FILTER_OPTIONS.map((opt) => {
          const active = filter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFilterChange(opt.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                active
                  ? 'bg-white dark:bg-amber-500 text-zinc-900 dark:text-zinc-950 shadow-sm font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <label htmlFor="library-sort" className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
          Sort by
        </label>
        <select
          id="library-sort"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as LibrarySortType)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="recent">Recently added</option>
          <option value="alphabetical">Alphabetical</option>
          <option value="played">Recently played</option>
        </select>
      </div>
    </div>
  );
}
