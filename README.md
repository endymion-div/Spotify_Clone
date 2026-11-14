# Soundify

**Your music. Your mood. Your world.**

A modern, full-stack Spotify-style music streaming web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Supabase**. Soundify features original branding, a responsive dark-and-light studio interface, real-time catalog search, personalized recommendations, playlist management, and genuine HTML5 audio playback with an integrated queue and mobile mini-player.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Supabase Configuration & Database Setup](#supabase-configuration--database-setup)
- [Demo Account & Dual-Mode Persistence](#demo-account--dual-mode-persistence)
- [Running Locally & Production Build](#running-locally--production-build)
- [Deployment & GitHub Setup](#deployment--github-setup)
- [Future Improvements](#future-improvements)

---

## Project Overview

Soundify is designed as a clean, production-structured streaming application suitable for portfolio review and real-world deployment. Every track, artist, album, and playlist in the default catalog uses original fictional data and procedurally synthesized multi-genre WAV audio streams so playback, seeking, volume, shuffle, and repeat work reliably out of the box with zero copyrighted assets or external audio dependencies.

---

## Features

- **Home Discovery**: Time-aware dynamic greeting, personalized recommendations (*"Because you listened to..."*), Recently Played, Made For You, Trending Now, Popular Artists, New Releases, Recommended Playlists, and Mood & Genre browsing.
- **Real-Time Search**: Instant client-side filtering across Songs, Artists, Albums, and Playlists with category tabs, recent searches, and suggestions.
- **Full HTML5 Audio Player**: Synchronized persistent bottom player with play/pause, previous/next, draggable progress seek bar, volume/mute control, shuffle, repeat (`off`, `all`, `one`), autoplay, and playback state persistence.
- **Queue Management**: Slide-over Queue panel displaying Now Playing and Next Up with play, reorder, remove, and clear actions.
- **Playlists & Favorites**: Create, rename, and delete custom playlists; add, remove, and reorder tracks; like/unlike songs with total duration metrics.
- **Artist & Album Pages**: Dedicated detail pages with verified artist metadata, monthly listeners, follow toggles, related artists, and album tracklists.
- **Authentication & User Profile**: Sign up, sign in, password recovery, protected routes (`/library`, `/liked`, `/playlist/:id`, `/profile`, `/settings`), and editable listener profile.
- **Settings & Notifications**: Live Dark / Light / System appearance switching, streaming quality selector, private session toggle, and interactive unread notification center.
- **Responsive Mobile Experience**: Mobile drawer navigation, fixed bottom tab bar, compact `MiniPlayer`, and expandable `FullScreenPlayer`.

---

## Screenshots

Add screenshots of your running build inside `docs/screenshots/` and link them here before publishing:

```markdown
![Home Discovery View](docs/screenshots/home-dark.png)
![Search & Queue View](docs/screenshots/search-queue.png)
![Mobile Full-Screen Player](docs/screenshots/mobile-player.png)
```

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **Audio Engine**: HTML5 `<audio>` backed by a deterministic multi-genre PCM WAV synthesizer (`src/lib/audioSynth.ts`) and local asset support (`public/audio/`)
- **Testing**: Node built-in test runner (`node:test`) with `tsx`

---

## Architecture

Soundify separates UI presentation from state and persistence:

1. **Pure Domain Logic (`src/lib/format.ts`)**: Deterministic search, queue index selection, list reordering, recommendation scoring, and duration formatting—unit-tested with `node:test`.
2. **Service Layer (`src/services/musicService.ts`)**: Dual-mode adapter that reads and writes to Supabase PostgreSQL when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, and transparently switches to browser `localStorage` persistence in Demo Mode when Supabase credentials are absent.
3. **Global Contexts (`src/context/`)**:
   - `AuthContext`: Session lifecycle, profile editing, settings/theme application, and notifications.
   - `LibraryContext`: Catalog loading, playlists, liked songs, listening history, and recommendations.
   - `PlayerContext`: Single persistent `HTMLAudioElement`, playback controls, queue state, and persistence.
   - `ToastContext`: Accessible status and error notifications.

---

## Folder Structure

```text
soundify/
├── public/
│   ├── audio/              # Static sample audio folder
│   └── images/             # Original Soundify SVG brand mark
├── src/
│   ├── assets/images/      # Generated cover and artist portrait artwork
│   ├── components/         # Modular UI components (MusicPlayer, Queue, Sidebar, etc.)
│   ├── context/            # Auth, Library, Player, and Toast contexts
│   ├── data/               # Original catalog (15 artists, 10 albums, 33 songs, 10 playlists)
│   ├── layouts/            # AppLayout shell
│   ├── lib/                # Pure utilities, WAV audio synthesizer, artwork & Supabase client
│   ├── pages/              # Route pages (Home, Search, Library, Artist, Album, Playlist, Auth)
│   ├── services/           # Dual-mode Supabase / Demo persistence service
│   ├── types/              # TypeScript interfaces
│   ├── App.tsx             # Router and provider tree
│   └── main.tsx            # Entry point
├── supabase/
│   ├── schema.sql          # PostgreSQL tables, indexes, RLS policies, signup trigger
│   └── seed.sql            # Seed script for artists, albums, and songs
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Installation

```bash
git clone https://github.com/<your-username>/soundify.git
cd soundify
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` (never commit `.env`):

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

If these values are left as placeholders or omitted, Soundify automatically runs in **Demo Mode** using local browser persistence.

---

## Supabase Configuration & Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run `supabase/schema.sql` to create all 9 tables (`profiles`, `artists`, `albums`, `songs`, `playlists`, `playlist_songs`, `liked_songs`, `recently_played`, `user_settings`), indexes, Row Level Security (RLS) policies, and the new-user profile trigger.
4. Run `supabase/seed.sql` to populate the initial catalog of artists, albums, and songs.
5. Copy your Project URL and Anon Public Key from **Project Settings -> API** into `.env`.

---

## Demo Account & Dual-Mode Persistence

- On `/login`, click **Continue with Demo Account** to test protected routes (`/library`, `/liked`, `/playlist/:id`, `/profile`, `/settings`) immediately without external credentials.
- No passwords are hardcoded in the repository. When connected to your own Supabase project, register a test account directly via `/signup` or the Supabase Authentication dashboard.

---

## Running Locally & Production Build

Start the development server:

```bash
npm run dev
```

Run unit tests:

```bash
npx --yes tsx --test src/lib/format.test.ts
```

Run TypeScript type check and build for production:

```bash
npm run lint
npm run build
```

---

## Deployment & GitHub Setup

1. Initialize and push to GitHub (verify `.env` is excluded by `.gitignore`):

```bash
git init
git add .
git commit -m "feat: initial Soundify music streaming application"
git branch -M main
git remote add origin https://github.com/<your-username>/soundify.git
git push -u origin main
```
[Live Demo] = https://soundify.ai.studio

2. Deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the platform's environment settings.

---

## Future Improvements

- Collaborative real-time playlists using Supabase Realtime channels
- Audio waveform scrubber preview and 5-band equalizer presets
- Lyrics synchronization view inside `FullScreenPlayer`
- Offline track caching via Service Worker
