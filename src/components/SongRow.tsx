import { ArrowDown, ArrowUp, Heart, ListPlus, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../lib/format';
import type { Song } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

interface SongRowProps {
  song: Song;
  index: number;
  queueContext?: Song[];
  showAlbum?: boolean;
  onAddToPlaylist?: (song: Song) => void;
  onRemoveFromPlaylist?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function SongRow({
  song,
  index,
  queueContext,
  showAlbum = true,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onMoveUp,
  onMoveDown,
}: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlayPause, addToQueue } = usePlayer();
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
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isCurrent
          ? 'bg-amber-500/10 text-zinc-900 dark:text-zinc-100'
          : 'hover:bg-zinc-100 dark:hover:bg-white/[0.04]'
      }`}
    >
      <div className="w-7 flex items-center justify-center shrink-0">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={isActivePlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          {isActivePlaying ? (
            <Pause className="w-3.5 h-3.5 text-amber-500 fill-current" />
          ) : (
            <>
              <span className={`font-mono-tabular text-xs group-hover:hidden ${isCurrent ? 'text-amber-500 font-semibold' : ''}`}>
                {index + 1}
              </span>
              <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current text-zinc-900 dark:text-white" />
            </>
          )}
        </button>
      </div>

      <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden">
        <ArtworkImage src={song.cover_url} alt={`${song.title} cover`} rounded="md" />
      </div>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={handlePlay}
          className={`text-left text-sm font-medium truncate block max-w-full ${
            isCurrent ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {song.title}
        </button>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          <Link to={`/artist/${song.artist_id}`} className="hover:underline">
            {song.artist_name}
          </Link>
        </div>
      </div>

      {showAlbum && (
        <div className="hidden md:block w-44 lg:w-56 min-w-0">
          <Link
            to={`/album/${song.album_id}`}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:underline truncate block"
          >
            {song.album_title}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            aria-label={`Move ${song.title} up`}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            aria-label={`Move ${song.title} down`}
            className="p-1.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleLikeSong(song.id)}
          aria-label={liked ? `Unlike ${song.title}` : `Like ${song.title}`}
          className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
            liked ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          onClick={() => addToQueue(song)}
          aria-label={`Add ${song.title} to queue`}
          className="hidden sm:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <ListPlus className="w-4 h-4" />
        </button>
        {onAddToPlaylist && (
          <button
            type="button"
            onClick={() => onAddToPlaylist(song)}
            aria-label={`Add ${song.title} to playlist`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {onRemoveFromPlaylist && (
          <button
            type="button"
            onClick={onRemoveFromPlaylist}
            aria-label={`Remove ${song.title} from playlist`}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400 w-11 text-right">
          {formatDuration(song.duration)}
        </span>
      </div>
    </div>
  );
}
