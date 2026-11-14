import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatCompactNumber } from '../lib/format';
import type { Artist } from '../types/music';
import { ArtworkImage } from './ArtworkImage';

export function ArtistCard({ artist }: { artist: Artist }) {
  const { songs } = useLibrary();
  const { playSong } = usePlayer();

  const handlePlayArtist = () => {
    const artistTracks = songs
      .filter((s) => s.artist_id === artist.id)
      .sort((a, b) => b.popularity - a.popularity);
    if (artistTracks.length > 0) {
      playSong(artistTracks[0], artistTracks);
    }
  };

  return (
    <article className="group flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200/80 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 transition-colors">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-3 rounded-full overflow-hidden bg-zinc-900">
        <Link to={`/artist/${artist.id}`} className="block w-full h-full">
          <ArtworkImage src={artist.image_url} alt={artist.name} rounded="full" />
        </Link>
        <button
          type="button"
          onClick={handlePlayArtist}
          aria-label={`Play top tracks by ${artist.name}`}
          className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center shadow-lg opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>

      <Link
        to={`/artist/${artist.id}`}
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 truncate max-w-full transition-colors"
      >
        {artist.name}
      </Link>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-full">
        {artist.genre} <span aria-hidden="true">·</span> {formatCompactNumber(artist.monthly_listeners)} listeners
      </p>
    </article>
  );
}
