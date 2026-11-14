import { formatDuration } from '../lib/format';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  compact?: boolean;
}

export function ProgressBar({ currentTime, duration, onSeek, compact = false }: ProgressBarProps) {
  const safeDuration = Math.max(1, duration || 1);
  const clampedTime = Math.min(currentTime, safeDuration);
  const percent = Math.min(100, Math.max(0, (clampedTime / safeDuration) * 100));

  return (
    <div className="flex items-center gap-2.5 w-full">
      {!compact && (
        <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 w-10 text-right shrink-0">
          {formatDuration(clampedTime)}
        </span>
      )}
      <div className="relative flex-1 flex items-center h-5 group">
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-[width] duration-75"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={safeDuration}
          step={0.5}
          value={clampedTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Seek audio position"
          className="soundify-slider absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
      {!compact && (
        <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 w-10 shrink-0">
          {formatDuration(safeDuration)}
        </span>
      )}
    </div>
  );
}
