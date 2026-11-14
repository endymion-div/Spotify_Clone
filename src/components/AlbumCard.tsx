import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import type { Album } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

export function AlbumCard({ album }: { album: Album }) {
  const { songs } = useLibrary();
  const { playSong } = usePlayer();

  const handleQuickPlay = () => {
    const albumTracks = songs
      .filter((s) => s.album_id === album.id)
      .sort((a, b) => a.track_number - b.track_number);
    if (albumTracks.length > 0) {
      playSong(albumTracks[0], albumTracks);
    }
  };

  return (
    <article className="group flex flex-col p-3.5 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200/80 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 transition-colors">
      <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden bg-zinc-900">
        <Link to={`/album/${album.id}`} className="block w-full h-full">
          <ArtworkImage src={album.cover_url} alt={`${album.title} album artwork`} rounded="lg" />
        </Link>
        <button
          type="button"
          onClick={handleQuickPlay}
          aria-label={`Play album ${album.title}`}
          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>

      <Link
        to={`/album/${album.id}`}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 truncate transition-colors"
      >
        {album.title}
      </Link>
      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
        <Link to={`/artist/${album.artist_id}`} className="hover:underline truncate">
          {album.artist_name}
        </Link>
        <span aria-hidden="true">·</span>
        <span className="font-mono-tabular shrink-0">{album.release_year}</span>
      </div>
    </article>
  );
}
