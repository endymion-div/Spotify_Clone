import { Volume1, Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;
  const percent = Math.round(effectiveVolume * 100);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        {effectiveVolume === 0 ? (
          <VolumeX className="w-4 h-4" />
        ) : effectiveVolume < 0.5 ? (
          <Volume1 className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
      <div className="relative w-24 h-5 flex items-center group">
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-zinc-700 dark:bg-zinc-200 group-hover:bg-amber-500 transition-colors"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="Audio volume"
          className="soundify-slider absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
    </div>
  );
}
