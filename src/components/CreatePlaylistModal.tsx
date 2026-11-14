import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { createArtworkDataUri, GENERATED_MEDIA } from '../lib/artwork';
import { ArtworkImage } from './ArtworkImage';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COVER_CHOICES = [
  { label: 'Nocturnal', url: GENERATED_MEDIA.coverMidnightDrive },
  { label: 'Acoustic', url: GENERATED_MEDIA.coverGoldenHour },
  { label: 'Coastal', url: GENERATED_MEDIA.coverCoastalEcho },
  { label: 'Geometric', url: createArtworkDataUri('studio-mix-amber', 'playlist') },
];

export function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const navigate = useNavigate();
  const { createPlaylist } = useLibrary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(COVER_CHOICES[0].url);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a playlist name.');
      return;
    }

    setError('');
    setSubmitting(true);
    const created = await createPlaylist({
      name: cleanName,
      description: description.trim() || 'Custom Soundify playlist',
      cover_url: selectedCover,
    });
    setSubmitting(false);

    if (created) {
      setName('');
      setDescription('');
      onClose();
      navigate(`/playlist/${created.id}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#151821] border border-zinc-200 dark:border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <h2 id="create-playlist-heading" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Create playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create playlist modal"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="playlist-name-input" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Playlist name
            </label>
            <input
              id="playlist-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Evening Synth Sessions"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
          </div>

          <div>
            <label htmlFor="playlist-desc-input" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              Description
            </label>
            <textarea
              id="playlist-desc-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mood or theme for this playlist..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-[#0B0D11] border border-zinc-300 dark:border-white/10 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Cover artwork</p>
            <div className="grid grid-cols-4 gap-3">
              {COVER_CHOICES.map((choice) => {
                const active = selectedCover === choice.url;
                return (
                  <button
                    key={choice.label}
                    type="button"
                    onClick={() => setSelectedCover(choice.url)}
                    className={`rounded-xl overflow-hidden border-2 transition-all text-left ${
                      active
                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div className="aspect-square">
                      <ArtworkImage src={choice.url} alt={choice.label} rounded="md" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-zinc-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              {submitting ? 'Creating...' : 'Create playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
