import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeRecommendations,
  formatCompactNumber,
  formatDuration,
  formatTotalDuration,
  getTimeGreeting,
  pickNextQueueIndex,
  pickPrevQueueIndex,
  reorderList,
  searchCatalog,
} from './format';
import type { Album, Artist, Playlist, Song } from '../types/music';

test('formatDuration formats seconds as m:ss with leading zero on seconds', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(42), '0:42');
  assert.equal(formatDuration(222), '3:42');
  assert.equal(formatDuration(-5), '0:00');
});

test('formatTotalDuration formats minutes and hours cleanly', () => {
  assert.equal(formatTotalDuration(45), '45 sec');
  assert.equal(formatTotalDuration(185), '3 min 5 sec');
  assert.equal(formatTotalDuration(3720), '1 hr 2 min');
});

test('formatCompactNumber shortens thousands and millions cleanly', () => {
  assert.equal(formatCompactNumber(950), '950');
  assert.equal(formatCompactNumber(12400), '12.4K');
  assert.equal(formatCompactNumber(1200000), '1.2M');
});

test('getTimeGreeting uses morning, afternoon, evening and first name', () => {
  assert.equal(getTimeGreeting(new Date('2026-11-13T09:00:00'), 'Sneha Ghosh'), 'Good morning, Sneha');
  assert.equal(getTimeGreeting(new Date('2026-11-13T14:30:00'), 'Sneha'), 'Good afternoon, Sneha');
  assert.equal(getTimeGreeting(new Date('2026-11-13T20:15:00')), 'Good evening');
});

test('reorderList moves items accurately without mutating source', () => {
  const original = ['a', 'b', 'c', 'd'];
  const moved = reorderList(original, 0, 2);
  assert.deepEqual(moved, ['b', 'c', 'a', 'd']);
  assert.deepEqual(original, ['a', 'b', 'c', 'd']);
});

test('pickNextQueueIndex and pickPrevQueueIndex handle off, all, one, and shuffle', () => {
  assert.equal(pickNextQueueIndex({ currentIndex: 0, queueLength: 3, shuffle: false, repeat: 'off' }), 1);
  assert.equal(pickNextQueueIndex({ currentIndex: 2, queueLength: 3, shuffle: false, repeat: 'off' }), null);
  assert.equal(pickNextQueueIndex({ currentIndex: 2, queueLength: 3, shuffle: false, repeat: 'all' }), 0);
  assert.equal(pickNextQueueIndex({ currentIndex: 1, queueLength: 3, shuffle: false, repeat: 'one' }), 1);
  // Deterministic rng avoiding same index
  const shuffled = pickNextQueueIndex({
    currentIndex: 1,
    queueLength: 3,
    shuffle: true,
    repeat: 'off',
    rng: () => 0.4,
  });
  assert.notEqual(shuffled, 1);
  assert.equal(pickPrevQueueIndex({ currentIndex: 0, queueLength: 3, repeat: 'all' }), 2);
  assert.equal(pickPrevQueueIndex({ currentIndex: 0, queueLength: 3, repeat: 'off' }), 0);
});

test('searchCatalog matches songs, artists, albums, and playlists case-insensitively', () => {
  const songs: Song[] = [
    {
      id: 's1',
      title: 'Midnight Drive',
      artist_id: 'a1',
      artist_name: 'Nova Lane',
      album_id: 'al1',
      album_title: 'After Dark',
      genre: 'Electronic',
      mood: 'Road Trip',
      duration: 222,
      cover_url: '',
      audio_url: '',
      release_year: 2025,
      popularity: 95,
      track_number: 1,
    },
  ];
  const artists: Artist[] = [
    {
      id: 'a1',
      name: 'Nova Lane',
      bio: '',
      genre: 'Electronic',
      image_url: '',
      monthly_listeners: 1000,
      followers: 500,
      verified: true,
    },
  ];
  const albums: Album[] = [
    {
      id: 'al1',
      title: 'After Dark',
      artist_id: 'a1',
      artist_name: 'Nova Lane',
      cover_url: '',
      release_year: 2025,
      genre: 'Electronic',
    },
  ];
  const playlists: Playlist[] = [
    {
      id: 'p1',
      name: 'Night Drive Essentials',
      description: 'Electronic synth hits',
      cover_url: '',
      creator_id: 'u1',
      creator_name: 'Soundify',
      is_public: true,
      song_ids: ['s1'],
      created_at: '',
      updated_at: '',
    },
  ];

  const results = searchCatalog('nova', { songs, artists, albums, playlists });
  assert.equal(results.songs.length, 1);
  assert.equal(results.artists.length, 1);
  assert.equal(results.albums.length, 1);
  assert.equal(results.playlists.length, 0);
});

test('computeRecommendations prioritizes dominant genre from likes and history', () => {
  const songs: Song[] = [
    {
      id: 's1',
      title: 'Synth One',
      artist_id: 'a1',
      artist_name: 'Nova',
      album_id: 'al1',
      album_title: 'Dark',
      genre: 'Electronic',
      mood: 'Focus',
      duration: 180,
      cover_url: '',
      audio_url: '',
      release_year: 2025,
      popularity: 90,
      track_number: 1,
    },
    {
      id: 's2',
      title: 'Synth Two',
      artist_id: 'a1',
      artist_name: 'Nova',
      album_id: 'al1',
      album_title: 'Dark',
      genre: 'Electronic',
      mood: 'Chill',
      duration: 180,
      cover_url: '',
      audio_url: '',
      release_year: 2025,
      popularity: 85,
      track_number: 2,
    },
    {
      id: 's3',
      title: 'Piano Note',
      artist_id: 'a2',
      artist_name: 'Kieran',
      album_id: 'al2',
      album_title: 'Felt',
      genre: 'Classical',
      mood: 'Focus',
      duration: 200,
      cover_url: '',
      audio_url: '',
      release_year: 2025,
      popularity: 99,
      track_number: 1,
    },
  ];

  const rec = computeRecommendations({
    songs,
    likedSongIds: ['s1'],
    recentlyPlayed: [],
  });
  assert.ok(rec);
  assert.equal(rec.reason, 'Because you listened to Electronic');
  assert.equal(rec.songs[0].id, 's2'); // unheard track in top genre prioritized first
});
