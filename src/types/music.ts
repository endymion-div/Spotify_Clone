export type RepeatMode = 'off' | 'all' | 'one';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface Artist {
  id: string;
  name: string;
  bio: string;
  genre: string;
  image_url: string;
  monthly_listeners: number;
  followers: number;
  verified: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  cover_url: string;
  release_year: number;
  genre: string;
  description?: string;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  album_id: string;
  album_title: string;
  genre: string;
  mood: string;
  duration: number; // seconds
  cover_url: string;
  audio_url: string;
  release_year: number;
  popularity: number; // 1-100
  track_number: number;
  key_hz?: number;
  bpm?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  creator_id: string;
  creator_name: string;
  is_public: boolean;
  is_curated?: boolean;
  song_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: ThemeMode;
  audio_quality: 'standard' | 'high' | 'lossless';
  autoplay: boolean;
  crossfade_seconds: number;
  email_notifications: boolean;
  push_notifications: boolean;
  private_session: boolean;
  show_listening_activity: boolean;
}

export interface RecentlyPlayedEntry {
  id: string;
  user_id: string;
  song_id: string;
  played_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'playlist' | 'recommendation' | 'account';
  read: boolean;
  created_at: string;
  href?: string;
}

export interface SearchResultBundle {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface RecommendationGroup {
  reason: string;
  genreOrArtist: string;
  songs: Song[];
}

export type ToastVariant = 'info' | 'success' | 'error' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}
