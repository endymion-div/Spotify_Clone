import { Heart, Pause, Play } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtworkImage } from './ArtworkImage';

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    setFullScreenOpen,
  } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();

  if (!currentSong) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const liked = isSongLiked(currentSong.id);

  return (
    <div className="md:hidden fixed left-0 right-0 bottom-[56px] z-30 bg-white/95 dark:bg-[#161A22]/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/10 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setFullScreenOpen(true)}
          aria-label={`Open full-screen player for ${currentSong.title}`}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
        >
          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
            <ArtworkImage src={currentSong.cover_url} alt={currentSong.title} rounded="md" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {currentSong.title}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              {currentSong.artist_name}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleLikeSong(currentSong.id)}
            aria-label={liked ? `Unlike ${currentSong.title}` : `Like ${currentSong.title}`}
            className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg ${
              liked ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-zinc-900 dark:text-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>
        </div>
      </div>

      <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full bg-amber-500 transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
