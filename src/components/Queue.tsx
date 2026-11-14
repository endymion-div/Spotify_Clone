import { ArrowDown, ArrowUp, ListMusic, Play, Trash2, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../lib/format';
import { ArtworkImage } from './ArtworkImage';

export function Queue() {
  const {
    queue,
    currentIndex,
    currentSong,
    isQueueOpen,
    setQueueOpen,
    playSong,
    removeFromQueue,
    reorderQueue,
    clearQueue,
  } = usePlayer();

  if (!isQueueOpen) return null;

  const upcomingItems = queue
    .map((song, idx) => ({ song, idx }))
    .filter(({ idx }) => idx > currentIndex);

  return (
    <aside
      aria-label="Playback queue"
      className="fixed top-0 right-0 bottom-0 sm:bottom-[84px] lg:static lg:h-full w-full sm:w-88 lg:w-84 xl:w-88 lg:shrink-0 z-40 lg:z-10 bg-white dark:bg-[#11141A] border-l border-zinc-200 dark:border-white/10 shadow-2xl lg:shadow-none flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Queue</h2>
        </div>
        <div className="flex items-center gap-2">
          {upcomingItems.length > 0 && (
            <button
              type="button"
              onClick={clearQueue}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setQueueOpen(false)}
            aria-label="Close queue panel"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 soundify-scroll">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
            Now Playing
          </h3>
          {currentSong ? (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0">
                <ArtworkImage src={currentSong.cover_url} alt={currentSong.title} rounded="md" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                  {currentSong.artist_name}
                </p>
              </div>
              <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                {formatDuration(currentSong.duration)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">No active track selected.</p>
          )}
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
            Next Up ({upcomingItems.length})
          </h3>
          {upcomingItems.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4">
              Your upcoming queue is empty. Add songs from any playlist or album.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {upcomingItems.map(({ song, idx }, position) => (
                <li
                  key={`${song.id}-${idx}`}
                  className="group flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => playSong(song, queue)}
                    aria-label={`Play ${song.title} from queue`}
                    className="relative w-10 h-10 rounded-md overflow-hidden shrink-0"
                  >
                    <ArtworkImage src={song.cover_url} alt={song.title} rounded="md" />
                    <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-3.5 h-3.5 text-white fill-current" />
                    </span>
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => playSong(song, queue)}
                      className="text-left text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate block w-full hover:text-amber-500"
                    >
                      {song.title}
                    </button>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {song.artist_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={position === 0}
                      onClick={() => reorderQueue(idx, idx - 1)}
                      aria-label={`Move ${song.title} up in queue`}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === queue.length - 1}
                      onClick={() => reorderQueue(idx, idx + 1)}
                      aria-label={`Move ${song.title} down in queue`}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(idx)}
                      aria-label={`Remove ${song.title} from queue`}
                      className="p-1 rounded text-zinc-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
