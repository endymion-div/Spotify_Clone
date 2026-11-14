import { Heart, Pause, Play, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../lib/format';
import type { Song } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
  onAddToPlaylist?: (song: Song) => void;
}

export function SongCard({ song, queueContext, onAddToPlaylist }: SongCardProps) {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const { isSongLiked, toggleLikeSong } = useLibrary();

  const isCurrent = currentSong?.id === song.id;
  const isActivePlaying = isCurrent && isPlaying;
  const liked = isSongLiked(song.id);

  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, queueContext);
    }
  };

  return (
    <article className="group flex flex-col p-3.5 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200/80 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 transition-colors">
      <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg bg-zinc-900">
        <ArtworkImage src={song.cover_url} alt={`${song.title} cover art`} rounded="lg" />
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isActivePlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            isActivePlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          {isActivePlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={handlePlay}
          className={`text-left text-sm font-semibold truncate block w-full transition-colors ${
            isCurrent
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400'
          }`}
        >
          {song.title}
        </button>
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 truncate">
          <Link
            to={`/artist/${song.artist_id}`}
            className="hover:underline truncate"
          >
            {song.artist_name}
          </Link>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular shrink-0">{formatDuration(song.duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/[0.05]">
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
          {song.genre}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleLikeSong(song.id)}
            aria-label={liked ? `Unlike ${song.title}` : `Like ${song.title}`}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              liked
                ? 'text-amber-500'
                : 'text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
          </button>
          {onAddToPlaylist && (
            <button
              type="button"
              onClick={() => onAddToPlaylist(song)}
              aria-label={`Add ${song.title} to playlist`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
