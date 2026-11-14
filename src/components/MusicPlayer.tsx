import {
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtworkImage } from './ArtworkImage';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeat,
    isQueueOpen,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setQueueOpen,
    setFullScreenOpen,
  } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();

  const liked = currentSong ? isSongLiked(currentSong.id) : false;

  return (
    <footer
      aria-label="Music player"
      className="hidden md:grid grid-cols-[minmax(220px,1fr)_minmax(340px,1.5fr)_minmax(220px,1fr)] items-center gap-4 h-[84px] px-5 bg-white/95 dark:bg-[#0E1117]/95 backdrop-blur-md border-t border-zinc-200 dark:border-white/[0.08] z-30 shrink-0"
    >
      {/* Left: Track info & like */}
      <div className="flex items-center gap-3 min-w-0">
        {currentSong ? (
          <>
            <button
              type="button"
              onClick={() => setFullScreenOpen(true)}
              aria-label="Expand player view"
              className="w-12 h-12 rounded-lg overflow-hidden shrink-0 ring-1 ring-black/10 dark:ring-white/10 hover:opacity-90 transition-opacity"
            >
              <ArtworkImage src={currentSong.cover_url} alt={currentSong.title} rounded="lg" />
            </button>
            <div className="min-w-0">
              <Link
                to={`/album/${currentSong.album_id}`}
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:underline truncate block"
              >
                {currentSong.title}
              </Link>
              <Link
                to={`/artist/${currentSong.artist_id}`}
                className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline truncate block"
              >
                {currentSong.artist_name}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => toggleLikeSong(currentSong.id)}
              aria-label={liked ? `Unlike ${currentSong.title}` : `Like ${currentSong.title}`}
              className={`p-2 rounded-lg transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                liked ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Select a song to start listening</p>
        )}
      </div>

      {/* Center: Playback controls & Progress */}
      <div className="flex flex-col items-center justify-center gap-1.5 max-w-xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
            aria-pressed={shuffle}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              shuffle
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            aria-label="Previous track"
            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            aria-label="Next track"
            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={`Repeat mode: ${repeat}`}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              repeat !== 'off'
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
      </div>

      {/* Right: Queue, Volume, Expand */}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setQueueOpen(!isQueueOpen)}
          aria-label="Toggle queue panel"
          aria-pressed={isQueueOpen}
          className={`p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            isQueueOpen
              ? 'text-amber-500 bg-amber-500/10'
              : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />

        <button
          type="button"
          onClick={() => setFullScreenOpen(true)}
          aria-label="Open full-screen player"
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
