export function CardSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-3 rounded-xl bg-white dark:bg-[#13161C] border border-zinc-200/80 dark:border-white/[0.06] animate-pulse"
        >
          <div className="aspect-square w-full rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-3" />
          <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
          <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function SongRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg bg-white/60 dark:bg-[#13161C]/70 animate-pulse"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-md bg-zinc-200 dark:bg-zinc-800 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-40 max-w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
          <div className="h-3 w-10 rounded bg-zinc-200 dark:bg-zinc-800 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading content">
      <div className="h-9 w-64 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <CardSkeletonGrid count={5} />
      <SongRowSkeleton count={5} />
    </div>
  );
}
