import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import type { Playlist, Song } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const { getSongById } = useLibrary();
  const { playSong } = usePlayer();

  const handlePlayPlaylist = () => {
    const tracks = playlist.song_ids
      .map((id) => getSongById(id))
      .filter((s): s is Song => Boolean(s));
    if (tracks.length > 0) {
      playSong(tracks[0], tracks);
    }
  };

  return (
    <article className="group flex flex-col p-3.5 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200/80 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 transition-colors">
      <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden bg-zinc-900">
        <Link to={`/playlist/${playlist.id}`} className="block w-full h-full">
          <ArtworkImage src={playlist.cover_url} alt={`${playlist.name} playlist cover`} rounded="lg" />
        </Link>
        {playlist.song_ids.length > 0 && (
          <button
            type="button"
            onClick={handlePlayPlaylist}
            aria-label={`Play playlist ${playlist.name}`}
            className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        )}
      </div>

      <Link
        to={`/playlist/${playlist.id}`}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 truncate transition-colors"
      >
        {playlist.name}
      </Link>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
        {playlist.description || `By ${playlist.creator_name}`}
      </p>
    </article>
  );
}
