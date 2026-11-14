import {
  ChevronDown,
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtworkImage } from './ArtworkImage';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export function FullScreenPlayer() {
  const {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    isFullScreenOpen,
    setFullScreenOpen,
    playSong,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();
  const [showQueueView, setShowQueueView] = useState(false);

  if (!isFullScreenOpen || !currentSong) return null;

  const liked = isSongLiked(currentSong.id);
  const upcoming = queue.map((s, idx) => ({ s, idx })).filter(({ idx }) => idx > currentIndex);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full-screen music player"
      className="fixed inset-0 z-50 bg-zinc-50 dark:bg-[#0B0D11] text-zinc-900 dark:text-zinc-100 flex flex-col"
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setFullScreenOpen(false)}
          aria-label="Minimize full-screen player"
          className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center hover:bg-zinc-200/70 dark:hover:bg-white/10 transition-colors"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center min-w-0 px-2">
          <p className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Playing from album
          </p>
          <p className="text-sm font-semibold truncate">{currentSong.album_title}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowQueueView((prev) => !prev)}
          aria-label={showQueueView ? 'Show artwork' : 'Show up next queue'}
          aria-pressed={showQueueView}
          className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors ${
            showQueueView
              ? 'bg-amber-500/15 text-amber-500'
              : 'hover:bg-zinc-200/70 dark:hover:bg-white/10'
          }`}
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center max-w-xl w-full mx-auto gap-6">
        {showQueueView ? (
          <div className="w-full space-y-3">
            <h2 className="text-base font-semibold">Up Next ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No upcoming songs in queue.
              </p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto soundify-scroll">
                {upcoming.map(({ s, idx }) => (
                  <li key={`${s.id}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => playSong(s, queue)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] text-left hover:border-amber-500/40"
                    >
                      <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                        <ArtworkImage src={s.cover_url} alt={s.title} rounded="md" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{s.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {s.artist_name}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10 dark:ring-white/10">
            <ArtworkImage src={currentSong.cover_url} alt={currentSong.title} rounded="xl" />
          </div>
        )}

        <div className="w-full flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{currentSong.title}</h1>
            <Link
              to={`/artist/${currentSong.artist_id}`}
              onClick={() => setFullScreenOpen(false)}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline truncate block"
            >
              {currentSong.artist_name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toggleLikeSong(currentSong.id)}
            aria-label={liked ? `Unlike ${currentSong.title}` : `Like ${currentSong.title}`}
            className={`min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center ${
              liked ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />

        <div className="w-full flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Toggle shuffle"
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${
              shuffle ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous song"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            aria-label="Next song"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={`Repeat mode: ${repeat}`}
            className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full ${
              repeat !== 'off' ? 'text-amber-500' : 'text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        <div className="w-full flex justify-center pt-1">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </div>
  );
}
