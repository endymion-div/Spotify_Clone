import type {
  Album,
  Artist,
  Playlist,
  RecentlyPlayedEntry,
  RecommendationGroup,
  SearchResultBundle,
  Song,
} from '../types/music';

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTotalDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0 min';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  const secs = Math.floor(totalSeconds % 60);
  if (mins === 0) return `${secs} sec`;
  return `${mins} min ${secs} sec`;
}

export function formatCompactNumber(num: number): string {
  if (!Number.isFinite(num) || num < 0) return '0';
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num.toLocaleString('en-US');
}

export function getTimeGreeting(date: Date = new Date(), userName?: string): string {
  const hour = date.getHours();
  let prefix = 'Good evening';
  if (hour >= 5 && hour < 12) prefix = 'Good morning';
  else if (hour >= 12 && hour < 17) prefix = 'Good afternoon';

  const firstName = userName?.trim().split(/\s+/)[0];
  return firstName ? `${prefix}, ${firstName}` : prefix;
}

export function searchCatalog(
  query: string,
  catalog: {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlist[];
  }
): SearchResultBundle {
  const q = query.trim().toLowerCase();
  if (!q) {
    return { songs: [], artists: [], albums: [], playlists: [] };
  }

  const songs = catalog.songs.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.artist_name.toLowerCase().includes(q) ||
      s.album_title.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q) ||
      s.mood.toLowerCase().includes(q)
  );

  const artists = catalog.artists.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.genre.toLowerCase().includes(q)
  );

  const albums = catalog.albums.filter(
    (al) =>
      al.title.toLowerCase().includes(q) ||
      al.artist_name.toLowerCase().includes(q) ||
      al.genre.toLowerCase().includes(q)
  );

  const playlists = catalog.playlists.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.creator_name.toLowerCase().includes(q)
  );

  return { songs, artists, albums, playlists };
}

export function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function pickNextQueueIndex(params: {
  currentIndex: number;
  queueLength: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  rng?: () => number;
}): number | null {
  const { currentIndex, queueLength, shuffle, repeat, rng = Math.random } = params;
  if (queueLength <= 0) return null;
  if (repeat === 'one') return currentIndex >= 0 ? currentIndex : 0;

  if (shuffle && queueLength > 1) {
    let candidate = Math.floor(rng() * queueLength);
    if (candidate === currentIndex) {
      candidate = (currentIndex + 1) % queueLength;
    }
    return candidate;
  }

  const next = currentIndex + 1;
  if (next < queueLength) return next;
  if (repeat === 'all') return 0;
  return null;
}

export function pickPrevQueueIndex(params: {
  currentIndex: number;
  queueLength: number;
  repeat: 'off' | 'all' | 'one';
}): number | null {
  const { currentIndex, queueLength, repeat } = params;
  if (queueLength <= 0) return null;
  if (currentIndex > 0) return currentIndex - 1;
  if (repeat === 'all') return queueLength - 1;
  return 0;
}

export function computeRecommendations(params: {
  songs: Song[];
  likedSongIds: string[];
  recentlyPlayed: RecentlyPlayedEntry[];
}): RecommendationGroup | null {
  const { songs, likedSongIds, recentlyPlayed } = params;
  if (songs.length === 0) return null;

  const songById = new Map(songs.map((s) => [s.id, s]));
  const genreWeights = new Map<string, number>();
  const interactedSongIds = new Set<string>();

  for (const id of likedSongIds) {
    const song = songById.get(id);
    if (song) {
      interactedSongIds.add(id);
      genreWeights.set(song.genre, (genreWeights.get(song.genre) ?? 0) + 2);
    }
  }

  for (const entry of recentlyPlayed.slice(0, 15)) {
    const song = songById.get(entry.song_id);
    if (song) {
      interactedSongIds.add(entry.song_id);
      genreWeights.set(song.genre, (genreWeights.get(song.genre) ?? 0) + 1);
    }
  }

  if (genreWeights.size === 0) {
    return {
      reason: 'Trending electronic & indie picks for your first session',
      genreOrArtist: 'Electronic',
      songs: songs.filter((s) => s.genre === 'Electronic' || s.genre === 'Indie').slice(0, 6),
    };
  }

  let topGenre = 'Electronic';
  let topScore = -1;
  for (const [genre, score] of genreWeights.entries()) {
    if (score > topScore) {
      topScore = score;
      topGenre = genre;
    }
  }

  const candidates = songs
    .filter((s) => s.genre === topGenre)
    .sort((a, b) => {
      const aUnheard = interactedSongIds.has(a.id) ? 0 : 1;
      const bUnheard = interactedSongIds.has(b.id) ? 0 : 1;
      if (aUnheard !== bUnheard) return bUnheard - aUnheard;
      return b.popularity - a.popularity;
    });

  const fallback = songs
    .filter((s) => s.genre !== topGenre)
    .sort((a, b) => b.popularity - a.popularity);

  const recommended = [...candidates, ...fallback].slice(0, 6);

  return {
    reason: `Because you listened to ${topGenre}`,
    genreOrArtist: topGenre,
    songs: recommended,
  };
}
