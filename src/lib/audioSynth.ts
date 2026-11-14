import type { Song } from '../types/music';

const blobUrlCache = new Map<string, string>();

const GENRE_CHORD_MAP: Record<string, number[][]> = {
  Electronic: [
    [1.0, 1.189, 1.498, 1.782],
    [0.891, 1.059, 1.335, 1.587],
    [0.794, 1.0, 1.189, 1.498],
    [0.749, 0.891, 1.122, 1.335],
  ],
  Indie: [
    [1.0, 1.26, 1.498, 1.888],
    [0.749, 0.944, 1.122, 1.414],
    [0.891, 1.059, 1.335, 1.587],
    [0.667, 0.841, 1.0, 1.26],
  ],
  Chill: [
    [1.0, 1.189, 1.498, 1.782],
    [0.667, 0.794, 1.0, 1.189],
    [0.749, 0.944, 1.122, 1.414],
    [0.891, 1.059, 1.335, 1.587],
  ],
  Classical: [
    [1.0, 1.26, 1.498, 2.0],
    [0.749, 1.0, 1.26, 1.498],
    [0.891, 1.122, 1.335, 1.682],
    [1.0, 1.26, 1.498, 1.888],
  ],
  Pop: [
    [1.0, 1.26, 1.498, 1.782],
    [0.749, 0.944, 1.122, 1.498],
    [0.891, 1.059, 1.335, 1.682],
    [0.667, 0.841, 1.0, 1.335],
  ],
  Rock: [
    [1.0, 1.498, 2.0, 2.245],
    [0.891, 1.335, 1.782, 2.0],
    [0.749, 1.122, 1.498, 1.782],
    [0.891, 1.335, 1.782, 2.245],
  ],
};

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Generates a real playable PCM WAV Blob URL matching the song's exact duration,
 * harmonic root, tempo, and genre progression so HTML5 <audio> supports genuine
 * playback, seeking, volume, and end-of-track events without external CORS failures.
 */
export function getPlayableAudioUrl(song: Song): string {
  // If an explicit local /audio/*.wav asset exists and is requested, support it,
  // while keeping synth:// tracks procedurally synthesized at full duration.
  if (song.audio_url && !song.audio_url.startsWith('synth://')) {
    return song.audio_url;
  }

  const cached = blobUrlCache.get(song.id);
  if (cached) return cached;

  const sampleRate = 11025;
  const durationSeconds = Math.max(10, Math.min(420, Math.round(song.duration || 180)));
  const totalSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // RIFF / WAV Header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  const rootHz = song.key_hz ?? 196; // G3 default warm register
  const bpm = song.bpm ?? 100;
  const beatDur = 60 / bpm;
  const barDur = beatDur * 4;
  const chords = GENRE_CHORD_MAP[song.genre] ?? GENRE_CHORD_MAP.Electronic;
  const twoPi = Math.PI * 2;
  const isPercussive = song.genre === 'Electronic' || song.genre === 'Pop' || song.genre === 'Rock';

  const pcm = new Int16Array(buffer, 44, totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const barIndex = Math.floor(t / barDur) % chords.length;
    const barTime = t % barDur;
    const beatTime = t % beatDur;
    const chord = chords[barIndex];

    // Smooth warm pad envelope per bar
    const padEnv =
      Math.min(1, barTime * 2.2) * Math.min(1, Math.max(0, (barDur - barTime) * 2.5 + 0.35));

    // Sub-bass + warm pad triad
    const f0 = rootHz * 0.5 * chord[0];
    const f1 = rootHz * chord[1];
    const f2 = rootHz * chord[2];
    const f3 = rootHz * 1.5 * chord[3];

    let sample =
      0.26 * Math.sin(twoPi * f0 * t) +
      0.16 * Math.sin(twoPi * f1 * t) * padEnv +
      0.13 * Math.sin(twoPi * f2 * t) * padEnv;

    // Gentle arpeggiated melody pulse on each eighth/quarter note
    const arpStep = Math.floor(t / (beatDur * 0.5)) % chord.length;
    const arpTime = t % (beatDur * 0.5);
    const arpEnv = Math.exp(-arpTime * 6.5);
    sample += 0.14 * Math.sin(twoPi * (rootHz * 2 * chord[arpStep]) * t) * arpEnv;

    // Subtle harmonic shimmer
    sample += 0.05 * Math.sin(twoPi * f3 * t) * padEnv;

    // Soft pulse kick on quarter beats for rhythmic genres
    if (isPercussive && beatTime < 0.14) {
      const kickEnv = Math.exp(-beatTime * 28);
      const kickFreq = 52 + 85 * Math.exp(-beatTime * 35);
      sample += 0.22 * Math.sin(twoPi * kickFreq * beatTime) * kickEnv;
    }

    // Master fade in / fade out (1.2s)
    const masterFade =
      Math.min(1, t / 0.8) * Math.min(1, Math.max(0, (durationSeconds - t) / 1.2));

    const clamped = Math.max(-0.92, Math.min(0.92, sample * masterFade));
    pcm[i] = (clamped * 32767) | 0;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(song.id, url);
  return url;
}
