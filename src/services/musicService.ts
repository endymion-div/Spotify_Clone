import { ALBUMS, ARTISTS, CURATED_PLAYLISTS, SONGS } from '../data/catalog';
import { GENERATED_MEDIA } from '../lib/artwork';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  Album,
  Artist,
  Playlist,
  RecentlyPlayedEntry,
  Song,
  UserProfile,
  UserSettings,
} from '../types/music';

const STORAGE_KEYS = {
  DEMO_USER: 'soundify_demo_user_v1',
  USER_PLAYLISTS: 'soundify_user_playlists_v1',
  LIKED_SONGS: 'soundify_liked_songs_v1',
  RECENTLY_PLAYED: 'soundify_recently_played_v1',
  SETTINGS: 'soundify_user_settings_v1',
  FOLLOWED_ARTISTS: 'soundify_followed_artists_v1',
  RECENT_SEARCHES: 'soundify_recent_searches_v1',
};

export const DEMO_USER_ID = 'demo-listener-sneha';

export function createDefaultProfile(
  id: string = DEMO_USER_ID,
  email: string = 'sneha@soundify.demo',
  fullName: string = 'Sneha'
): UserProfile {
  return {
    id,
    email,
    full_name: fullName,
    avatar_url: GENERATED_MEDIA.avatarSnehaProfile,
    bio: 'Exploring nocturnal electronics, acoustic storytelling, and focused ambient sessions.',
    created_at: '2026-01-15T09:30:00Z',
  };
}

export function createDefaultSettings(userId: string = DEMO_USER_ID): UserSettings {
  return {
    user_id: userId,
    theme: 'dark',
    audio_quality: 'high',
    autoplay: true,
    crossfade_seconds: 3,
    email_notifications: true,
    push_notifications: true,
    private_session: false,
    show_listening_activity: true,
  };
}

function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const musicService = {
  async fetchCatalog(): Promise<{
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    curatedPlaylists: Playlist[];
  }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const [artistsRes, albumsRes, songsRes] = await Promise.all([
          supabase.from('artists').select('*').order('monthly_listeners', { ascending: false }),
          supabase.from('albums').select('*').order('release_year', { ascending: false }),
          supabase.from('songs').select('*').order('popularity', { ascending: false }),
        ]);

        if (!artistsRes.error && !albumsRes.error && !songsRes.error && songsRes.data?.length) {
          return {
            artists: artistsRes.data as Artist[],
            albums: albumsRes.data as Album[],
            songs: songsRes.data as Song[],
            curatedPlaylists: CURATED_PLAYLISTS,
          };
        }
      } catch {
        // Gracefully fall back to bundled catalog if Supabase tables aren't seeded yet
      }
    }

    return {
      songs: SONGS,
      artists: ARTISTS,
      albums: ALBUMS,
      curatedPlaylists: CURATED_PLAYLISTS,
    };
  },

  async fetchUserPlaylists(userId: string): Promise<Playlist[]> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      const { data, error } = await supabase
        .from('playlists')
        .select('*, playlist_songs(song_id, position)')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: Record<string, unknown>) => {
          const ps = (row.playlist_songs as Array<{ song_id: string; position: number }> | null) ?? [];
          ps.sort((a, b) => a.position - b.position);
          return {
            id: String(row.id),
            name: String(row.name),
            description: String(row.description ?? ''),
            cover_url: String(row.cover_url ?? ''),
            creator_id: String(row.creator_id),
            creator_name: String(row.creator_name ?? 'Soundify Listener'),
            is_public: Boolean(row.is_public),
            is_curated: Boolean(row.is_curated),
            song_ids: ps.map((item) => item.song_id),
            created_at: String(row.created_at),
            updated_at: String(row.updated_at),
          };
        });
      }
    }

    const stored = safeJsonParse<Playlist[]>(localStorage.getItem(STORAGE_KEYS.USER_PLAYLISTS), []);
    if (stored.length === 0) {
      const starter: Playlist = {
        id: 'user-pl-1',
        name: 'Late Night Coding',
        description: 'Focus beats and nocturnal synths for evening builds.',
        cover_url: GENERATED_MEDIA.coverMidnightDrive,
        creator_id: userId,
        creator_name: 'Sneha',
        is_public: false,
        is_curated: false,
        song_ids: ['sng-1', 'sng-4', 'sng-14', 'sng-27'],
        created_at: '2026-10-12T18:00:00Z',
        updated_at: '2026-10-12T18:00:00Z',
      };
      localStorage.setItem(STORAGE_KEYS.USER_PLAYLISTS, JSON.stringify([starter]));
      return [starter];
    }
    return stored;
  },

  async saveUserPlaylists(playlists: Playlist[]): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.USER_PLAYLISTS, JSON.stringify(playlists));
  },

  async createPlaylist(
    userId: string,
    creatorName: string,
    input: { name: string; description: string; cover_url: string }
  ): Promise<Playlist> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name: input.name,
          description: input.description,
          cover_url: input.cover_url,
          creator_id: userId,
          creator_name: creatorName,
          is_public: true,
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          cover_url: data.cover_url,
          creator_id: data.creator_id,
          creator_name: data.creator_name,
          is_public: data.is_public,
          is_curated: false,
          song_ids: [],
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    }

    const now = new Date().toISOString();
    const created: Playlist = {
      id: `user-pl-${Date.now()}`,
      name: input.name,
      description: input.description,
      cover_url: input.cover_url,
      creator_id: userId,
      creator_name: creatorName,
      is_public: true,
      is_curated: false,
      song_ids: [],
      created_at: now,
      updated_at: now,
    };
    const current = await this.fetchUserPlaylists(userId);
    await this.saveUserPlaylists([created, ...current]);
    return created;
  },

  async updatePlaylistMeta(
    userId: string,
    playlistId: string,
    updates: { name: string; description: string }
  ): Promise<void> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      await supabase
        .from('playlists')
        .update({ name: updates.name, description: updates.description, updated_at: new Date().toISOString() })
        .eq('id', playlistId)
        .eq('creator_id', userId);
      return;
    }

    const current = await this.fetchUserPlaylists(userId);
    const next = current.map((pl) =>
      pl.id === playlistId
        ? { ...pl, name: updates.name, description: updates.description, updated_at: new Date().toISOString() }
        : pl
    );
    await this.saveUserPlaylists(next);
  },

  async deletePlaylist(userId: string, playlistId: string): Promise<void> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      await supabase.from('playlists').delete().eq('id', playlistId).eq('creator_id', userId);
      return;
    }

    const current = await this.fetchUserPlaylists(userId);
    await this.saveUserPlaylists(current.filter((pl) => pl.id !== playlistId));
  },

  async syncPlaylistSongs(userId: string, playlistId: string, songIds: string[]): Promise<void> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      await supabase.from('playlist_songs').delete().eq('playlist_id', playlistId);
      if (songIds.length > 0) {
        await supabase.from('playlist_songs').insert(
          songIds.map((songId, index) => ({
            playlist_id: playlistId,
            song_id: songId,
            position: index,
          }))
        );
      }
      return;
    }

    const current = await this.fetchUserPlaylists(userId);
    const next = current.map((pl) =>
      pl.id === playlistId
        ? { ...pl, song_ids: songIds, updated_at: new Date().toISOString() }
        : pl
    );
    await this.saveUserPlaylists(next);
  },

  async fetchLikedSongIds(userId: string): Promise<string[]> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      const { data, error } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', userId)
        .order('liked_at', { ascending: false });
      if (!error && data) {
        return data.map((row) => String(row.song_id));
      }
    }

    const stored = safeJsonParse<string[] | null>(localStorage.getItem(STORAGE_KEYS.LIKED_SONGS), null);
    if (stored === null) {
      const defaults = ['sng-1', 'sng-5', 'sng-8'];
      localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(defaults));
      return defaults;
    }
    return stored;
  },

  async setLikedSong(userId: string, songId: string, liked: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      if (liked) {
        await supabase.from('liked_songs').upsert({ user_id: userId, song_id: songId });
      } else {
        await supabase.from('liked_songs').delete().eq('user_id', userId).eq('song_id', songId);
      }
      return;
    }

    const existing = await this.fetchLikedSongIds(userId);
    const next = liked
      ? Array.from(new Set([songId, ...existing]))
      : existing.filter((id) => id !== songId);
    localStorage.setItem(STORAGE_KEYS.LIKED_SONGS, JSON.stringify(next));
  },

  async fetchRecentlyPlayed(userId: string): Promise<RecentlyPlayedEntry[]> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      const { data, error } = await supabase
        .from('recently_played')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(30);
      if (!error && data) return data as RecentlyPlayedEntry[];
    }

    const stored = safeJsonParse<RecentlyPlayedEntry[] | null>(
      localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED),
      null
    );
    if (stored === null) {
      const now = Date.now();
      const defaults: RecentlyPlayedEntry[] = [
        { id: 'rp-1', user_id: userId, song_id: 'sng-1', played_at: new Date(now - 600_000).toISOString() },
        { id: 'rp-2', user_id: userId, song_id: 'sng-5', played_at: new Date(now - 1_800_000).toISOString() },
        { id: 'rp-3', user_id: userId, song_id: 'sng-8', played_at: new Date(now - 3_600_000).toISOString() },
        { id: 'rp-4', user_id: userId, song_id: 'sng-11', played_at: new Date(now - 7_200_000).toISOString() },
      ];
      localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(defaults));
      return defaults;
    }
    return stored;
  },

  async recordRecentlyPlayed(userId: string, songId: string): Promise<RecentlyPlayedEntry[]> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      await supabase.from('recently_played').insert({ user_id: userId, song_id: songId });
      return this.fetchRecentlyPlayed(userId);
    }

    const current = await this.fetchRecentlyPlayed(userId);
    const filtered = current.filter((item) => item.song_id !== songId);
    const entry: RecentlyPlayedEntry = {
      id: `rp-${Date.now()}`,
      user_id: userId,
      song_id: songId,
      played_at: new Date().toISOString(),
    };
    const updated = [entry, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));
    return updated;
  },

  loadFollowedArtists(): string[] {
    return safeJsonParse<string[]>(localStorage.getItem(STORAGE_KEYS.FOLLOWED_ARTISTS), ['art-1', 'art-2']);
  },

  saveFollowedArtists(artistIds: string[]): void {
    localStorage.setItem(STORAGE_KEYS.FOLLOWED_ARTISTS, JSON.stringify(artistIds));
  },

  loadRecentSearches(): string[] {
    return safeJsonParse<string[]>(localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES), [
      'Nova Lane',
      'Electronic',
      'Midnight Drive',
    ]);
  },

  saveRecentSearches(searches: string[]): void {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(searches.slice(0, 8)));
  },

  loadDemoProfile(): UserProfile | null {
    return safeJsonParse<UserProfile | null>(localStorage.getItem(STORAGE_KEYS.DEMO_USER), null);
  },

  saveDemoProfile(profile: UserProfile | null): void {
    if (!profile) {
      localStorage.removeItem(STORAGE_KEYS.DEMO_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.DEMO_USER, JSON.stringify(profile));
    }
  },

  async loadSettings(userId: string): Promise<UserSettings> {
    if (isSupabaseConfigured && supabase && userId !== DEMO_USER_ID) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) return data as UserSettings;
    }

    return safeJsonParse<UserSettings>(
      localStorage.getItem(STORAGE_KEYS.SETTINGS),
      createDefaultSettings(userId)
    );
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (isSupabaseConfigured && supabase && settings.user_id !== DEMO_USER_ID) {
      await supabase.from('user_settings').upsert(settings);
    }
  },
};
