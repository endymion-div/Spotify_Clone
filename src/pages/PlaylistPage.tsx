import { Edit3, Heart, Play, Plus, Shuffle, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArtworkImage } from '../components/ArtworkImage';
import { EmptyState } from '../components/EmptyState';
import { SongRow } from '../components/SongRow';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration, formatTotalDuration } from '../lib/format';
import type { Song } from '../types/music';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    allPlaylists,
    songs,
    getSongById,
    renamePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    reorderPlaylistSongs,
  } = useLibrary();
  const { playSong } = usePlayer();

  const playlist = useMemo(
    () => allPlaylists.find((p) => p.id === id),
    [allPlaylists, id]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [songQuery, setSongQuery] = useState('');
  const [likedPlaylist, setLikedPlaylist] = useState(false);

  const tracks = useMemo(() => {
    if (!playlist) return [];
    return playlist.song_ids
      .map((sid) => getSongById(sid))
      .filter((s): s is Song => Boolean(s));
  }, [getSongById, playlist]);

  const totalSeconds = useMemo(
    () => tracks.reduce((sum, t) => sum + t.duration, 0),
    [tracks]
  );

  const candidateSongs = useMemo(() => {
    const q = songQuery.trim().toLowerCase();
    const existing = new Set(playlist?.song_ids ?? []);
    return songs.filter((s) => {
      if (existing.has(s.id)) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist_name.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    });
  }, [playlist?.song_ids, songQuery, songs]);

  if (!playlist) {
    return (
      <EmptyState
        title="Playlist not found"
        description="This playlist may have been removed or is unavailable."
        actionLabel="Back to library"
        onAction={() => navigate('/library')}
      />
    );
  }

  const isOwner = Boolean(user && !playlist.is_curated && playlist.creator_id === user.id);

  const openEdit = () => {
    setEditName(playlist.name);
    setEditDescription(playlist.description);
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await renamePlaylist(playlist.id, editName.trim(), editDescription.trim());
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deletePlaylist(playlist.id);
    navigate('/library');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end gap-6 p-6 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08]">
        <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-xl overflow-hidden shadow-xl shrink-0">
          <ArtworkImage src={playlist.cover_url} alt={playlist.name} rounded="xl" />
        </div>

        <div className="space-y-2.5 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {playlist.is_curated ? 'Curated Playlist' : 'Personal Playlist'}
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {playlist.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            {playlist.description}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-tabular">
            Created by {playlist.creator_name} <span aria-hidden="true">·</span> {tracks.length}{' '}
            {tracks.length === 1 ? 'song' : 'songs'} <span aria-hidden="true">·</span>{' '}
            {formatTotalDuration(totalSeconds)}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {tracks.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => playSong(tracks[0], tracks)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    playSong(shuffled[0], shuffled);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-200/80 dark:bg-[#191D26] hover:bg-zinc-200 dark:hover:bg-[#232835] text-zinc-900 dark:text-zinc-100 text-sm font-medium transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setLikedPlaylist((prev) => !prev)}
              aria-label={likedPlaylist ? 'Unlike playlist' : 'Like playlist'}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                likedPlaylist
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                  : 'border-zinc-300 dark:border-white/15 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05]'
              }`}
            >
              <Heart className={`w-4 h-4 ${likedPlaylist ? 'fill-current' : ''}`} />
              <span>{likedPlaylist ? 'Saved' : 'Save'}</span>
            </button>

            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAddSongs((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05] text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add songs</span>
                </button>
                <button
                  type="button"
                  onClick={openEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-white/15 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.05] text-sm font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Inline Rename Form */}
      {isEditing && isOwner && (
        <form
          onSubmit={handleSaveEdit}
          className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-amber-500/40 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Edit playlist</h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              aria-label="Cancel editing"
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-pl-name" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                Name
              </label>
              <input
                id="edit-pl-name"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="edit-pl-desc" className="block text-xs font-medium text-zinc-600 dark:text-zinc-300 mb-1">
                Description
              </label>
              <input
                id="edit-pl-desc"
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold"
            >
              Save changes
            </button>
          </div>
        </form>
      )}

      {/* Tracklist */}
      {tracks.length === 0 ? (
        <EmptyState
          title="This playlist has no songs yet"
          description={
            isOwner
              ? 'Search for songs below and add them to build your playlist.'
              : 'No tracks have been added to this playlist yet.'
          }
          actionLabel={isOwner ? 'Browse songs to add' : undefined}
          onAction={isOwner ? () => setShowAddSongs(true) : undefined}
        />
      ) : (
        <div className="rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.06] divide-y divide-zinc-100 dark:divide-white/[0.04] p-2">
          {tracks.map((song, idx) => (
            <SongRow
              key={`${song.id}-${idx}`}
              song={song}
              index={idx}
              queueContext={tracks}
              onRemoveFromPlaylist={
                isOwner ? () => removeSongFromPlaylist(playlist.id, song.id) : undefined
              }
              onMoveUp={
                isOwner && idx > 0
                  ? () => reorderPlaylistSongs(playlist.id, idx, idx - 1)
                  : undefined
              }
              onMoveDown={
                isOwner && idx < tracks.length - 1
                  ? () => reorderPlaylistSongs(playlist.id, idx, idx + 1)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Add Songs Browser for Owner */}
      {isOwner && (showAddSongs || tracks.length === 0) && (
        <section className="p-5 rounded-2xl bg-white dark:bg-[#13161C] border border-zinc-200 dark:border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">
              Let&apos;s find something for your playlist
            </h2>
            <input
              type="search"
              value={songQuery}
              onChange={(e) => setSongQuery(e.target.value)}
              placeholder="Filter catalog songs..."
              aria-label="Filter songs to add to playlist"
              className="px-3.5 py-2 rounded-lg bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-zinc-100 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-white/[0.04] max-h-80 overflow-y-auto soundify-scroll">
            {candidateSongs.slice(0, 12).map((song) => (
              <div key={song.id} className="flex items-center justify-between gap-3 py-2.5 px-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0">
                    <ArtworkImage src={song.cover_url} alt={song.title} rounded="md" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {song.artist_name} <span aria-hidden="true">·</span>{' '}
                      <span className="font-mono-tabular">{formatDuration(song.duration)}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addSongToPlaylist(playlist.id, song.id)}
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-white/15 hover:border-amber-500 hover:bg-amber-500 hover:text-zinc-950 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors whitespace-nowrap shrink-0"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
