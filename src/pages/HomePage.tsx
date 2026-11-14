import { Play, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlbumCard } from '../components/AlbumCard';
import { ArtistCard } from '../components/ArtistCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PlaylistCard } from '../components/PlaylistCard';
import { PlaylistModal } from '../components/PlaylistModal';
import { SongCard } from '../components/SongCard';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { MOOD_GENRE_CATEGORIES } from '../data/catalog';
import { getTimeGreeting } from '../lib/format';
import type { Song } from '../types/music';

export function HomePage() {
  const { user } = useAuth();
  const {
    songs,
    artists,
    albums,
    curatedPlaylists,
    recentlyPlayed,
    recommendation,
    isLoadingCatalog,
    catalogError,
    reloadCatalog,
    getSongById,
  } = useLibrary();
  const { playSong } = usePlayer();
  const navigate = useNavigate();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const greeting = useMemo(
    () => getTimeGreeting(new Date(), user?.full_name),
    [user?.full_name]
  );

  const recentSongs = useMemo(() => {
    const unique = new Map<string, Song>();
    for (const entry of recentlyPlayed) {
      const s = getSongById(entry.song_id);
      if (s && !unique.has(s.id)) unique.set(s.id, s);
    }
    if (unique.size === 0) {
      songs.slice(0, 6).forEach((s) => unique.set(s.id, s));
    }
    return Array.from(unique.values()).slice(0, 8);
  }, [getSongById, recentlyPlayed, songs]);

  const trendingSongs = useMemo(
    () => [...songs].sort((a, b) => b.popularity - a.popularity).slice(0, 10),
    [songs]
  );

  const madeForYou = useMemo(() => curatedPlaylists.slice(0, 5), [curatedPlaylists]);
  const recommendedPlaylists = useMemo(() => curatedPlaylists.slice(5, 10), [curatedPlaylists]);
  const popularArtists = useMemo(
    () => [...artists].sort((a, b) => b.monthly_listeners - a.monthly_listeners).slice(0, 8),
    [artists]
  );
  const newReleases = useMemo(
    () => [...albums].sort((a, b) => b.release_year - a.release_year).slice(0, 8),
    [albums]
  );

  if (isLoadingCatalog) {
    return <LoadingSkeleton />;
  }

  if (catalogError) {
    return (
      <EmptyState
        title="Unable to load songs"
        description={catalogError}
        actionLabel="Try again"
        onAction={reloadCatalog}
      />
    );
  }

  const featuredSong = trendingSongs[0];

  return (
    <div className="space-y-10">
      {/* Greeting & Hero Spotlight */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-white/[0.08]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Soundify — Your music. Your mood. Your world.
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white text-balance">
            {greeting}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Discover nocturnal synth sessions, intimate acoustic recordings, and playlists tailored to your listening rhythm.
          </p>
        </div>

        {featuredSong && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => playSong(featuredSong, trendingSongs)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Trending Mix</span>
            </button>
            <Link
              to="/search"
              className="px-4 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-[#191D26] hover:bg-zinc-200 dark:hover:bg-[#232835] text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              Explore Catalog
            </Link>
          </div>
        )}
      </section>

      {/* Personalization Section */}
      {recommendation && recommendation.songs.length > 0 && (
        <section aria-labelledby="rec-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <h2 id="rec-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
                {recommendation.reason}
              </h2>
            </div>
            <Link
              to={`/search?q=${encodeURIComponent(recommendation.genreOrArtist)}`}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 whitespace-nowrap"
            >
              See more
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
            {recommendation.songs.map((song) => (
              <div key={song.id} className="w-44 sm:w-48 shrink-0">
                <SongCard
                  song={song}
                  queueContext={recommendation.songs}
                  onAddToPlaylist={setModalSong}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recently Played */}
      <section aria-labelledby="recent-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="recent-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
            Recently Played
          </h2>
          <Link
            to="/recently-played"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 whitespace-nowrap"
          >
            View history
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {recentSongs.map((song) => (
            <div key={song.id} className="w-44 sm:w-48 shrink-0">
              <SongCard
                song={song}
                queueContext={recentSongs}
                onAddToPlaylist={setModalSong}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Made For You */}
      <section aria-labelledby="made-for-you-heading" className="space-y-4">
        <h2 id="made-for-you-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
          Made For You
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {madeForYou.map((playlist) => (
            <div key={playlist.id} className="w-44 sm:w-52 shrink-0">
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section aria-labelledby="trending-heading" className="space-y-4">
        <h2 id="trending-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
          Trending Now
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {trendingSongs.map((song) => (
            <div key={song.id} className="w-44 sm:w-48 shrink-0">
              <SongCard
                song={song}
                queueContext={trendingSongs}
                onAddToPlaylist={setModalSong}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section aria-labelledby="artists-heading" className="space-y-4">
        <h2 id="artists-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
          Popular Artists
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {popularArtists.map((artist) => (
            <div key={artist.id} className="w-40 sm:w-44 shrink-0">
              <ArtistCard artist={artist} />
            </div>
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section aria-labelledby="releases-heading" className="space-y-4">
        <h2 id="releases-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
          New Releases
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {newReleases.map((album) => (
            <div key={album.id} className="w-44 sm:w-48 shrink-0">
              <AlbumCard album={album} />
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Playlists */}
      <section aria-labelledby="recommended-playlists-heading" className="space-y-4">
        <h2
          id="recommended-playlists-heading"
          className="text-xl font-bold text-zinc-900 dark:text-white"
        >
          Recommended Playlists
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 soundify-scroll">
          {recommendedPlaylists.map((playlist) => (
            <div key={playlist.id} className="w-44 sm:w-52 shrink-0">
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      </section>

      {/* Mood & Genre */}
      <section aria-labelledby="mood-genre-heading" className="space-y-4">
        <h2 id="mood-genre-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
          Mood &amp; Genre
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 soundify-scroll">
          {MOOD_GENRE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => navigate(`/search?q=${encodeURIComponent(category)}`)}
              className="px-5 py-3.5 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] hover:border-amber-500/60 hover:bg-amber-500/5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <PlaylistModal song={modalSong} onClose={() => setModalSong(null)} />
    </div>
  );
}
