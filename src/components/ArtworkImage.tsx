import { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface ArtworkImageProps {
  src?: string;
  alt: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function ArtworkImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  rounded = 'lg',
}: ArtworkImageProps) {
  const [failed, setFailed] = useState(false);

  const radiusClass =
    rounded === 'full'
      ? 'rounded-full'
      : rounded === 'xl'
        ? 'rounded-xl'
        : rounded === 'lg'
          ? 'rounded-lg'
          : rounded === 'md'
            ? 'rounded-md'
            : 'rounded';

  if (!src || failed) {
    return (
      <div
        className={`${className} ${radiusClass} bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-amber-500/80 border border-white/10`}
        role="img"
        aria-label={alt}
      >
        <Disc3 className="w-1/3 h-1/3" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} ${radiusClass}`}
    />
  );
}
