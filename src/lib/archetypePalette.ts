import { AX } from '../data/types';
import type { AxisKey } from '../data/types';

export type Blob = {
  /** Any CSS color: hex or `var(...)`. */
  color: string;
  opacity: number;
  /** CSS length / percentage strings, applied as inline-style left/top. */
  left: string;
  top: string;
  size: string;
};

export type HeroPalette = {
  /** Linear gradient consumed by `style={{ background }}`. */
  baseGradient: string;
  blobs: [Blob, Blob, Blob];
};

// Mid-tone axis colors — same hex values as the --A-mid / --B-mid / ... tokens.
const AXIS_MID: Record<AxisKey, string> = {
  A: '#E8534A',
  B: '#4A90D9',
  C: '#4CAF7D',
  D: '#9B59B6',
  E: '#F5A623',
};

// Letter → axis key (mirror of AXES[ax].letter_plus / letter_minus).
const LETTER_TO_AXIS: Record<string, AxisKey> = {
  D: 'A', F: 'A',
  A: 'B', P: 'B',
  S: 'C', R: 'C',
  C: 'D', I: 'D',
  G: 'E', X: 'E',
};

const PLUS_LETTERS: Record<AxisKey, string> = {
  A: 'D', B: 'A', C: 'S', D: 'C', E: 'G',
};

const FALLBACK: HeroPalette = {
  baseGradient: 'linear-gradient(135deg, #0F1428 0%, #1C2340 55%, #2A2454 100%)',
  blobs: [
    { color: AXIS_MID.B, opacity: 0.32, left: '-120px', top: '-120px', size: '540px' },
    { color: AXIS_MID.D, opacity: 0.34, left: 'calc(100% - 400px)', top: 'calc(100% - 360px)', size: '480px' },
    { color: '#4A90D9', opacity: 0.22, left: '60%', top: '10%', size: '340px' },
  ],
};

/**
 * Map an archetype code (e.g. `'DASCG'`) to a hero-band palette: a base
 * gradient plus three watercolor blobs that pick up the archetype's
 * dominant axis tints. Deterministic per code.
 */
export function archetypePalette(code: string): HeroPalette {
  if (code.length !== 5) return FALLBACK;

  const decoded: Array<{ axis: AxisKey; isPlus: boolean }> = [];
  for (let i = 0; i < 5; i++) {
    const letter = code[i];
    const axis = LETTER_TO_AXIS[letter];
    if (!axis) return FALLBACK;
    decoded.push({ axis, isPlus: PLUS_LETTERS[axis] === letter });
  }

  const ordered = AX.map((ax) => ({
    axis: ax,
    isPlus: decoded[AX.indexOf(ax)].isPlus,
  }));

  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const jitter = (hash % 1000) / 1000;

  const warmth =
    (ordered[0].isPlus ? 1 : 0) +
    (ordered[2].isPlus ? 1 : 0); // 0..2

  const baseGradient =
    warmth >= 2
      ? `linear-gradient(135deg, #2C1F32 0%, #4A2B3D 55%, #6E3F47 100%)`
      : warmth === 1
        ? `linear-gradient(135deg, #1A1612 0%, #2D241E 50%, #3D3027 100%)`
        : `linear-gradient(135deg, #0F1428 0%, #1C2340 55%, #2A2454 100%)`;

  const a = ordered[0].axis;
  const b = ordered[1].axis;
  const c = ordered[2].axis;

  const blobs: [Blob, Blob, Blob] = [
    {
      color: AXIS_MID[a],
      opacity: 0.42 + (jitter * 0.06),
      left: `${-120 - Math.round(jitter * 30)}px`,
      top: `${-120 - Math.round(jitter * 30)}px`,
      size: '540px',
    },
    {
      color: AXIS_MID[c],
      opacity: 0.38 + ((1 - jitter) * 0.06),
      left: `calc(100% - ${400 + Math.round(jitter * 60)}px)`,
      top: `calc(100% - ${360 + Math.round((1 - jitter) * 60)}px)`,
      size: '480px',
    },
    {
      color: AXIS_MID[b],
      opacity: 0.24 + (jitter * 0.04),
      left: `${50 + Math.round(jitter * 20)}%`,
      top: `${5 + Math.round(jitter * 12)}%`,
      size: '340px',
    },
  ];

  return { baseGradient, blobs };
}
