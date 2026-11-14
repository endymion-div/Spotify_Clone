import coverMidnightDrive from '../assets/images/cover_midnight_drive_1794637358528.jpg';
import coverGoldenHour from '../assets/images/cover_golden_hour_1794637359084.jpg';
import coverCoastalEcho from '../assets/images/cover_coastal_echo_1794637358870.jpg';
import artistNovaLane from '../assets/images/artist_nova_lane_1794637359650.jpg';
import avatarSnehaProfile from '../assets/images/avatar_sneha_profile_1794637360787.jpg';

export const GENERATED_MEDIA = {
  coverMidnightDrive,
  coverGoldenHour,
  coverCoastalEcho,
  artistNovaLane,
  avatarSnehaProfile,
};

interface PaletteSpec {
  bg1: string;
  bg2: string;
  accent: string;
  ring: string;
}

const ARTWORK_PALETTES: PaletteSpec[] = [
  { bg1: '#18181B', bg2: '#27272A', accent: '#F59E0B', ring: '#FBBF24' },
  { bg1: '#0F172A', bg2: '#1E293B', accent: '#38BDF8', ring: '#7DD3FC' },
  { bg1: '#1C1917', bg2: '#292524', accent: '#FB7185', ring: '#FDA4AF' },
  { bg1: '#0C1A1A', bg2: '#132A2A', accent: '#2DD4BF', ring: '#5EEAD4' },
  { bg1: '#1F172A', bg2: '#2E2240', accent: '#F97316', ring: '#FDBA74' },
  { bg1: '#171717', bg2: '#262626', accent: '#EAB308', ring: '#FEF08A' },
  { bg1: '#111827', bg2: '#1F2937', accent: '#34D399', ring: '#6EE7B7' },
  { bg1: '#1B1418', bg2: '#2D1E26', accent: '#F43F5E', ring: '#FB7185' },
];

const svgCache = new Map<string, string>();

/**
 * Generates crisp, high-resolution deterministic geometric vinyl/studio SVG artwork
 * as an encoded data URI so zero external image URLs are required and no image ever breaks.
 */
export function createArtworkDataUri(seed: string, variant: 'album' | 'artist' | 'playlist' = 'album'): string {
  const cacheKey = `${variant}:${seed}`;
  const cached = svgCache.get(cacheKey);
  if (cached) return cached;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const palette = ARTWORK_PALETTES[hash % ARTWORK_PALETTES.length];
  const cx = 140 + (hash % 120);
  const cy = 140 + ((hash >> 4) % 120);
  const r1 = 80 + (hash % 60);
  const r2 = 34 + ((hash >> 6) % 36);
  const angle = (hash % 90) - 45;

  const shape =
    variant === 'artist'
      ? `<circle cx="200" cy="175" r="78" fill="${palette.accent}" fill-opacity="0.22"/>
         <circle cx="200" cy="175" r="56" stroke="${palette.ring}" stroke-width="2" fill="none" stroke-opacity="0.7"/>
         <path d="M90 360 C110 280 290 280 310 360" stroke="${palette.accent}" stroke-width="2.5" fill="${palette.accent}" fill-opacity="0.16"/>`
      : variant === 'playlist'
        ? `<g transform="rotate(${angle} 200 200)">
             <rect x="70" y="70" width="260" height="260" rx="28" stroke="${palette.accent}" stroke-width="2" fill="none" stroke-opacity="0.45"/>
             <rect x="115" y="115" width="170" height="170" rx="18" fill="${palette.accent}" fill-opacity="0.18"/>
             <circle cx="200" cy="200" r="46" stroke="${palette.ring}" stroke-width="3" fill="none"/>
           </g>`
        : `<circle cx="${cx}" cy="${cy}" r="${r1}" fill="${palette.accent}" fill-opacity="0.22"/>
           <circle cx="${cx}" cy="${cy}" r="${r1 + 26}" stroke="${palette.ring}" stroke-width="1.5" fill="none" stroke-opacity="0.4"/>
           <circle cx="200" cy="200" r="${r2}" fill="${palette.bg1}" stroke="${palette.accent}" stroke-width="2.5"/>
           <line x1="48" y1="320" x2="352" y2="320" stroke="${palette.ring}" stroke-opacity="0.25" stroke-width="1.5"/>
           <line x1="48" y1="338" x2="240" y2="338" stroke="${palette.accent}" stroke-opacity="0.55" stroke-width="3"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.bg1}"/>
        <stop offset="100%" stop-color="${palette.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    ${shape}
  </svg>`;

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  svgCache.set(cacheKey, uri);
  return uri;
}
