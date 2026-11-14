import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { computeRecommendations, reorderList } from '../lib/format';
import { DEMO_USER_ID, musicService } from '../services/musicService';
import type {
  Album,
  Artist,
  Playlist,
  RecentlyPlayedEntry,
  RecommendationGroup,
  Song,
} from '../types/music';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface LibraryContextValue {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  curatedPlaylists: Playlist[];
  userPlaylists: Playlist[];
  allPlaylists: Playlist[];
  likedSongIds: string[];
  recentlyPlayed: RecentlyPlayedEntry[];
  followedArtistIds: string[];
  recentSearches: string[];
  isLoadingCatalog: boolean;
  catalogError: string | null;
  recommendation: RecommendationGroup | null;
  getSongById: (id: string) => Song | undefined;
  isSongLiked: (songId: string) => boolean;
  isArtistFollowed: (artistId: string) => boolean;
  toggleLikeSong: (songId: string) => Promise<void>;
  toggleFollowArtist: (artistId: string) => void;
  recordPlay: (songId: string) => Promise<void>;
  createPlaylist: (input: { name: string; description: string; cover_url: string }) => Promise<Playlist | null>;
  renamePlaylist: (playlistId: string, name: string, description: string) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
  reorderPlaylistSongs: (playlistId: string, fromIndex: number, toIndex: number) => Promise<void>;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  reloadCatalog: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextValue | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user, settings, addNotification } = useAuth();
  const { showToast } = useToast();

  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [curatedPlaylists, setCuratedPlaylists] = useState<Playlist[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedEntry[]>([]);
  const [followedArtistIds, setFollowedArtistIds] = useState<string[]>(() =>
    musicService.loadFollowedArtists()
  );
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    musicService.loadRecentSearches()
  );
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoadingCatalog(true);
    setCatalogError(null);
    try {
      const catalog = await musicService.fetchCatalog();
      setSongs(catalog.songs);
      setArtists(catalog.artists);
      setAlbums(catalog.albums);
      setCuratedPlaylists(catalog.curatedPlaylists);
    } catch {
      setCatalogError('Unable to load songs. Please try again.');
      showToast('Unable to load songs. Please try again.', 'error');
    } finally {
      setIsLoadingCatalog(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    let active = true;
    const activeUserId = user?.id ?? DEMO_USER_ID;

    async function loadUserData() {
      const [pls, likes, recent] = await Promise.all([
        musicService.fetchUserPlaylists(activeUserId),
        musicService.fetchLikedSongIds(activeUserId),
        musicService.fetchRecentlyPlayed(activeUserId),
      ]);
      if (active) {
        setUserPlaylists(pls);
        setLikedSongIds(likes);
        setRecentlyPlayed(recent);
      }
    }

    loadUserData();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const songMap = useMemo(() => new Map(songs.map((s) => [s.id, s])), [songs]);
  const getSongById = useCallback((id: string) => songMap.get(id), [songMap]);

  const allPlaylists = useMemo(
    () => [...userPlaylists, ...curatedPlaylists],
    [userPlaylists, curatedPlaylists]
  );

  const isSongLiked = useCallback(
    (songId: string) => likedSongIds.includes(songId),
    [likedSongIds]
  );

  const isArtistFollowed = useCallback(
    (artistId: string) => followedArtistIds.includes(artistId),
    [followedArtistIds]
  );

  const toggleLikeSong = useCallback(
    async (songId: string) => {
      if (!user) {
        showToast('Please log in to save liked songs.', 'warning');
        return;
      }
      const currentlyLiked = likedSongIds.includes(songId);
      const nextLiked = !currentlyLiked;
      setLikedSongIds((prev) =>
        nextLiked ? Array.from(new Set([songId, ...prev])) : prev.filter((id) => id !== songId)
      );
      await musicService.setLikedSong(user.id, songId, nextLiked);
      const song = songMap.get(songId);
      showToast(
        nextLiked
          ? `Added "${song?.title ?? 'track'}" to Liked Songs.`
          : `Removed "${song?.title ?? 'track'}" from Liked Songs.`,
        'info'
      );
    },
    [likedSongIds, showToast, songMap, user]
  );

  const toggleFollowArtist = useCallback(
    (artistId: string) => {
      const following = followedArtistIds.includes(artistId);
      const next = following
        ? followedArtistIds.filter((id) => id !== artistId)
        : [...followedArtistIds, artistId];
      setFollowedArtistIds(next);
      musicService.saveFollowedArtists(next);
      showToast(following ? 'Unfollowed artist.' : 'Following artist.', 'info');
    },
    [followedArtistIds, showToast]
  );

  const recordPlay = useCallback(
    async (songId: string) => {
      if (settings.private_session) return;
      const activeUserId = user?.id ?? DEMO_USER_ID;
      const updated = await musicService.recordRecentlyPlayed(activeUserId, songId);
      setRecentlyPlayed(updated);
    },
    [settings.private_session, user?.id]
  );

  const createPlaylist = useCallback(
    async (input: { name: string; description: string; cover_url: string }) => {
      if (!user) {
        showToast('Please log in to create a playlist.', 'warning');
        return null;
      }
      const created = await musicService.createPlaylist(user.id, user.full_name, input);
      setUserPlaylists((prev) => [created, ...prev]);
      addNotification({
        title: 'New playlist created',
        message: `"${created.name}" is ready for your tracks.`,
        type: 'playlist',
        href: `/playlist/${created.id}`,
      });
      showToast(`Created playlist "${created.name}".`, 'success');
      return created;
    },
    [addNotification, showToast, user]
  );

  const renamePlaylist = useCallback(
    async (playlistId: string, name: string, description: string) => {
      if (!user) return;
      setUserPlaylists((prev) =>
        prev.map((pl) =>
          pl.id === playlistId
            ? { ...pl, name, description, updated_at: new Date().toISOString() }
            : pl
        )
      );
      await musicService.updatePlaylistMeta(user.id, playlistId, { name, description });
      addNotification({
        title: 'Playlist updated',
        message: `Updated details for "${name}".`,
        type: 'playlist',
        href: `/playlist/${playlistId}`,
      });
      showToast('Playlist details updated.', 'success');
    },
    [addNotification, showToast, user]
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      if (!user) return;
      setUserPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      await musicService.deletePlaylist(user.id, playlistId);
      showToast('Playlist deleted.', 'info');
    },
    [showToast, user]
  );

  const addSongToPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!user) {
        showToast('Please log in to add songs to playlists.', 'warning');
        return;
      }
      const target = userPlaylists.find((pl) => pl.id === playlistId);
      if (!target) return;
      if (target.song_ids.includes(songId)) {
        showToast('Song is already in this playlist.', 'info');
        return;
      }
      const nextIds = [...target.song_ids, songId];
      setUserPlaylists((prev) =>
        prev.map((pl) =>
          pl.id === playlistId
            ? { ...pl, song_ids: nextIds, updated_at: new Date().toISOString() }
            : pl
        )
      );
      await musicService.syncPlaylistSongs(user.id, playlistId, nextIds);
      const song = songMap.get(songId);
      showToast(`Added "${song?.title ?? 'song'}" to ${target.name}.`, 'success');
    },
    [showToast, songMap, user, userPlaylists]
  );

  const removeSongFromPlaylist = useCallback(
    async (playlistId: string, songId: string) => {
      if (!user) return;
      const target = userPlaylists.find((pl) => pl.id === playlistId);
      if (!target) return;
      const nextIds = target.song_ids.filter((id) => id !== songId);
      setUserPlaylists((prev) =>
        prev.map((pl) => (pl.id === playlistId ? { ...pl, song_ids: nextIds } : pl))
      );
      await musicService.syncPlaylistSongs(user.id, playlistId, nextIds);
      showToast('Removed track from playlist.', 'info');
    },
    [showToast, user, userPlaylists]
  );

  const reorderPlaylistSongs = useCallback(
    async (playlistId: string, fromIndex: number, toIndex: number) => {
      if (!user) return;
      const target = userPlaylists.find((pl) => pl.id === playlistId);
      if (!target) return;
      const nextIds = reorderList(target.song_ids, fromIndex, toIndex);
      setUserPlaylists((prev) =>
        prev.map((pl) => (pl.id === playlistId ? { ...pl, song_ids: nextIds } : pl))
      );
      await musicService.syncPlaylistSongs(user.id, playlistId, nextIds);
    },
    [user, userPlaylists]
  );

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      musicService.saveRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    musicService.saveRecentSearches([]);
  }, []);

  const recommendation = useMemo(
    () =>
      computeRecommendations({
        songs,
        likedSongIds,
        recentlyPlayed,
      }),
    [likedSongIds, recentlyPlayed, songs]
  );

  return (
    <LibraryContext.Provider
      value={{
        songs,
        artists,
        albums,
        curatedPlaylists,
        userPlaylists,
        allPlaylists,
        likedSongIds,
        recentlyPlayed,
        followedArtistIds,
        recentSearches,
        isLoadingCatalog,
        catalogError,
        recommendation,
        getSongById,
        isSongLiked,
        isArtistFollowed,
        toggleLikeSong,
        toggleFollowArtist,
        recordPlay,
        createPlaylist,
        renamePlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        reorderPlaylistSongs,
        addRecentSearch,
        clearRecentSearches,
        reloadCatalog: loadAll,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return ctx;
}
