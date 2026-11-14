-- Soundify PostgreSQL Schema for Supabase
-- Run this script in the Supabase SQL Editor before running seed.sql

create extension if not exists "pgcrypto";

-- 1. User Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text not null default '',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Artists
create table if not exists public.artists (
  id text primary key,
  name text not null,
  bio text not null default '',
  genre text not null,
  image_url text not null default '',
  monthly_listeners integer not null default 0,
  followers integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- 3. Albums
create table if not exists public.albums (
  id text primary key,
  title text not null,
  artist_id text not null references public.artists(id) on delete cascade,
  artist_name text not null,
  cover_url text not null default '',
  release_year integer not null,
  genre text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

-- 4. Songs
create table if not exists public.songs (
  id text primary key,
  title text not null,
  artist_id text not null references public.artists(id) on delete cascade,
  artist_name text not null,
  album_id text not null references public.albums(id) on delete cascade,
  album_title text not null,
  genre text not null,
  mood text not null default '',
  duration integer not null check (duration > 0),
  cover_url text not null default '',
  audio_url text not null,
  release_year integer not null,
  popularity integer not null default 50,
  track_number integer not null default 1,
  key_hz numeric,
  bpm integer,
  created_at timestamptz not null default now()
);

-- 5. Playlists
create table if not exists public.playlists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  cover_url text not null default '',
  creator_id uuid references public.profiles(id) on delete cascade,
  creator_name text not null default 'Soundify Listener',
  is_public boolean not null default true,
  is_curated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Playlist Songs (junction table with ordering)
create table if not exists public.playlist_songs (
  id uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  position integer not null default 0,
  added_at timestamptz not null default now(),
  unique (playlist_id, song_id)
);

-- 7. Liked Songs
create table if not exists public.liked_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  liked_at timestamptz not null default now(),
  unique (user_id, song_id)
);

-- 8. Recently Played
create table if not exists public.recently_played (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  song_id text not null references public.songs(id) on delete cascade,
  played_at timestamptz not null default now()
);

-- 9. User Settings
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  audio_quality text not null default 'high' check (audio_quality in ('standard', 'high', 'lossless')),
  autoplay boolean not null default true,
  crossfade_seconds integer not null default 3,
  email_notifications boolean not null default true,
  push_notifications boolean not null default true,
  private_session boolean not null default false,
  show_listening_activity boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Indexes for query performance
create index if not exists idx_songs_artist on public.songs(artist_id);
create index if not exists idx_songs_album on public.songs(album_id);
create index if not exists idx_songs_genre on public.songs(genre);
create index if not exists idx_playlist_songs_playlist on public.playlist_songs(playlist_id, position);
create index if not exists idx_liked_songs_user on public.liked_songs(user_id, liked_at desc);
create index if not exists idx_recently_played_user on public.recently_played(user_id, played_at desc);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.albums enable row level security;
alter table public.songs enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_songs enable row level security;
alter table public.liked_songs enable row level security;
alter table public.recently_played enable row level security;
alter table public.user_settings enable row level security;

-- Catalog tables: public read access
create policy "Public read artists" on public.artists for select using (true);
create policy "Public read albums" on public.albums for select using (true);
create policy "Public read songs" on public.songs for select using (true);

-- Profiles: users can view and update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Playlists: read public/curated or own; modify own only
create policy "Read public or own playlists" on public.playlists
  for select using (is_public = true or is_curated = true or auth.uid() = creator_id);
create policy "Insert own playlists" on public.playlists
  for insert with check (auth.uid() = creator_id);
create policy "Update own playlists" on public.playlists
  for update using (auth.uid() = creator_id);
create policy "Delete own playlists" on public.playlists
  for delete using (auth.uid() = creator_id);

-- Playlist songs: read if playlist readable; modify if playlist owned by user
create policy "Read accessible playlist songs" on public.playlist_songs
  for select using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and (p.is_public = true or p.is_curated = true or p.creator_id = auth.uid())
    )
  );
create policy "Modify own playlist songs" on public.playlist_songs
  for all using (
    exists (
      select 1 from public.playlists p
      where p.id = playlist_id and p.creator_id = auth.uid()
    )
  );

-- Liked songs: strictly user-scoped
create policy "Manage own liked songs" on public.liked_songs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Recently played: strictly user-scoped
create policy "Manage own recently played" on public.recently_played
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User settings: strictly user-scoped
create policy "Manage own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger to provision profile + settings on new auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
