import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getPlayableAudioUrl } from '../lib/audioSynth';
import { pickNextQueueIndex, pickPrevQueueIndex, reorderList } from '../lib/format';
import type { RepeatMode, Song } from '../types/music';
import { useAuth } from './AuthContext';
import { useLibrary } from './LibraryContext';
import { useToast } from './ToastContext';

const PLAYER_STORAGE_KEY = 'soundify_player_state_v1';

interface PersistedPlayerState {
  songId: string | null;
  queueIds: string[];
  currentTime: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
}

interface PlayerContextValue {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  isQueueOpen: boolean;
  isFullScreenOpen: boolean;
  playSong: (song: Song, queueSongs?: Song[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setQueueOpen: (open: boolean) => void;
  setFullScreenOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function loadPersistedPlayer(): PersistedPlayerState {
  try {
    const raw = localStorage.getItem(PLAYER_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedPlayerState;
  } catch {
    // ignore storage errors
  }
  return {
    songId: 'sng-1',
    queueIds: ['sng-1', 'sng-2', 'sng-3', 'sng-5', 'sng-8'],
    currentTime: 0,
    volume: 0.78,
    isMuted: false,
    shuffle: false,
    repeat: 'off',
  };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { songs, recordPlay } = useLibrary();
  const { settings } = useAuth();
  const { showToast } = useToast();

  const initial = useRef<PersistedPlayerState>(loadPersistedPlayer());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<number | null>(initial.current.currentTime || null);
  const hasHydratedRef = useRef(false);

  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initial.current.currentTime || 0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initial.current.volume ?? 0.78);
  const [isMuted, setIsMuted] = useState(Boolean(initial.current.isMuted));
  const [shuffle, setShuffle] = useState(Boolean(initial.current.shuffle));
  const [repeat, setRepeat] = useState<RepeatMode>(initial.current.repeat ?? 'off');
  const [isQueueOpen, setQueueOpen] = useState(false);
  const [isFullScreenOpen, setFullScreenOpen] = useState(false);

  const currentSong = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  // Hydrate initial song & queue once catalog is loaded
  useEffect(() => {
    if (hasHydratedRef.current || songs.length === 0) return;
    hasHydratedRef.current = true;

    const songMap = new Map(songs.map((s) => [s.id, s]));
    const restoredQueue = initial.current.queueIds
      .map((id) => songMap.get(id))
      .filter((s): s is Song => Boolean(s));

    const finalQueue = restoredQueue.length > 0 ? restoredQueue : songs.slice(0, 6);
    const targetIndex = initial.current.songId
      ? finalQueue.findIndex((s) => s.id === initial.current.songId)
      : 0;

    setQueue(finalQueue);
    const idx = targetIndex >= 0 ? targetIndex : 0;
    setCurrentIndex(idx);
    if (finalQueue[idx]) {
      setDuration(finalQueue[idx].duration);
    }
  }, [songs]);

  // Persist playback state cleanly
  useEffect(() => {
    if (!hasHydratedRef.current) return;
    const payload: PersistedPlayerState = {
      songId: currentSong?.id ?? null,
      queueIds: queue.map((s) => s.id),
      currentTime,
      volume,
      isMuted,
      shuffle,
      repeat,
    };
    try {
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore quota errors
    }
  }, [currentSong?.id, currentTime, isMuted, queue, repeat, shuffle, volume]);

  // Create persistent single HTMLAudioElement
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Keep volume & mute synchronized with HTMLAudioElement
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  const handleTrackEndRef = useRef<() => void>(() => {});

  // Wire audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      if (pendingSeekRef.current !== null && pendingSeekRef.current > 0) {
        const clamped = Math.min(pendingSeekRef.current, audio.duration || pendingSeekRef.current);
        audio.currentTime = clamped;
        setCurrentTime(clamped);
        pendingSeekRef.current = null;
      }
    };

    const onEnded = () => {
      handleTrackEndRef.current();
    };

    const onError = () => {
      setIsPlaying(false);
      showToast('This song is currently unavailable.', 'error');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [showToast]);

  // Load currentSong into audio element whenever song changes
  const lastLoadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (lastLoadedIdRef.current !== currentSong.id) {
      lastLoadedIdRef.current = currentSong.id;
      const src = getPlayableAudioUrl(currentSong);
      audio.src = src;
      setDuration(currentSong.duration);
      if (pendingSeekRef.current === null) {
        setCurrentTime(0);
      }
      if (isPlaying) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentSong, isPlaying]);

  const playSong = useCallback(
    (song: Song, queueSongs?: Song[]) => {
      const nextQueue = queueSongs && queueSongs.length > 0 ? queueSongs : queue.length > 0 ? queue : [song];
      let idx = nextQueue.findIndex((s) => s.id === song.id);
      let finalQueue = nextQueue;

      if (idx === -1) {
        finalQueue = [song, ...nextQueue];
        idx = 0;
      }

      pendingSeekRef.current = null;
      setQueue(finalQueue);
      setCurrentIndex(idx);
      setIsPlaying(true);

      if (audioRef.current) {
        if (lastLoadedIdRef.current === song.id) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => setIsPlaying(false));
        } else {
          lastLoadedIdRef.current = song.id;
          audioRef.current.src = getPlayableAudioUrl(song);
          audioRef.current.play().catch(() => setIsPlaying(false));
        }
      }

      recordPlay(song.id);
    },
    [queue, recordPlay]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!currentSong) {
      if (songs.length > 0) {
        playSong(songs[0], songs.slice(0, 8));
      }
      return;
    }
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src) {
        audio.src = getPlayableAudioUrl(currentSong);
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          showToast('Unable to start audio playback. Click play again.', 'warning');
        });
    }
  }, [currentSong, isPlaying, playSong, showToast, songs]);

  const playNext = useCallback(() => {
    const nextIdx = pickNextQueueIndex({
      currentIndex,
      queueLength: queue.length,
      shuffle,
      repeat,
    });

    if (nextIdx === null) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setCurrentTime(0);
      return;
    }

    const nextSong = queue[nextIdx];
    if (!nextSong) return;
    pendingSeekRef.current = null;
    setCurrentIndex(nextIdx);
    setIsPlaying(true);
    if (audioRef.current) {
      lastLoadedIdRef.current = nextSong.id;
      audioRef.current.src = getPlayableAudioUrl(nextSong);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    recordPlay(nextSong.id);
  }, [currentIndex, queue, recordPlay, repeat, shuffle]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const prevIdx = pickPrevQueueIndex({
      currentIndex,
      queueLength: queue.length,
      repeat,
    });
    if (prevIdx === null) return;
    const prevSong = queue[prevIdx];
    if (!prevSong) return;

    pendingSeekRef.current = null;
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
    if (audioRef.current) {
      lastLoadedIdRef.current = prevSong.id;
      audioRef.current.src = getPlayableAudioUrl(prevSong);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    recordPlay(prevSong.id);
  }, [currentIndex, queue, recordPlay, repeat]);

  useEffect(() => {
    handleTrackEndRef.current = () => {
      if (repeat === 'one' || settings.autoplay) {
        playNext();
      } else {
        setIsPlaying(false);
      }
    };
  }, [playNext, repeat, settings.autoplay]);

  const seek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(duration || currentSong?.duration || 0, seconds));
      setCurrentTime(clamped);
      if (audioRef.current && audioRef.current.readyState >= 1) {
        audioRef.current.currentTime = clamped;
      } else {
        pendingSeekRef.current = clamped;
      }
    },
    [currentSong?.duration, duration]
  );

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0) setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const next = !prev;
      showToast(next ? 'Shuffle enabled.' : 'Shuffle disabled.', 'info');
      return next;
    });
  }, [showToast]);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => {
      const next: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      const label =
        next === 'off' ? 'Repeat off' : next === 'all' ? 'Repeating queue' : 'Repeating current song';
      showToast(label, 'info');
      return next;
    });
  }, [showToast]);

  const addToQueue = useCallback(
    (song: Song) => {
      setQueue((prev) => [...prev, song]);
      showToast(`Added "${song.title}" to queue.`, 'info');
    },
    [showToast]
  );

  const removeFromQueue = useCallback(
    (index: number) => {
      setQueue((prev) => {
        if (index < 0 || index >= prev.length) return prev;
        const next = prev.filter((_, i) => i !== index);
        if (index < currentIndex) {
          setCurrentIndex((ci) => Math.max(0, ci - 1));
        } else if (index === currentIndex) {
          if (next.length === 0) {
            setCurrentIndex(-1);
            setIsPlaying(false);
            if (audioRef.current) audioRef.current.pause();
          } else {
            const clampedIdx = Math.min(currentIndex, next.length - 1);
            setCurrentIndex(clampedIdx);
          }
        }
        return next;
      });
    },
    [currentIndex]
  );

  const reorderQueue = useCallback(
    (fromIndex: number, toIndex: number) => {
      setQueue((prev) => {
        const next = reorderList(prev, fromIndex, toIndex);
        if (currentIndex === fromIndex) {
          setCurrentIndex(toIndex);
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          setCurrentIndex(currentIndex - 1);
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          setCurrentIndex(currentIndex + 1);
        }
        return next;
      });
    },
    [currentIndex]
  );

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
      setCurrentIndex(0);
    } else {
      setQueue([]);
      setCurrentIndex(-1);
    }
    showToast('Cleared upcoming queue.', 'info');
  }, [currentSong, showToast]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        currentTime,
        duration,
        volume,
        isMuted,
        shuffle,
        repeat,
        isQueueOpen,
        isFullScreenOpen,
        playSong,
        togglePlayPause,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeat,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setQueueOpen,
        setFullScreenOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return ctx;
}
