import type { AxisKey, Responses, Response, Division, RankedDivision, ResolvedArchetype } from '../data/types';
import { AX } from '../data/types';
import { QMAP } from '../data/questions';
import { DIVISIONS } from '../data/divisions';
import { AXES } from '../data/axes';
import { TYPES } from '../data/archetypes';

export function scoreResp(r: Response, reversed: boolean): number {
  const v = r - 3;
  return reversed ? (v === 0 ? 0 : -v) : v;
}

export function axisScores(resp: Responses): Record<AxisKey, number> {
  const buckets: Record<AxisKey, number[]> = { A: [], B: [], C: [], D: [], E: [] };
  for (const [id, r] of Object.entries(resp)) {
    const q = QMAP[id];
    if (!q) continue;
    buckets[q.axis].push(scoreResp(r, q.reversed));
  }
  const out = {} as Record<AxisKey, number>;
  for (const ax of AX) {
    const a = buckets[ax];
    out[ax] = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  return out;
}

export const MAX_D = Math.sqrt(5 * 16);

export function dist(
  u: Record<AxisKey, number>,
  d: Division | Record<AxisKey, number>,
): number {
  return Math.sqrt(AX.reduce((s, ax) => s + (u[ax] - d[ax]) ** 2, 0));
}

export function fitPct(d: number): number {
  return Math.round((1 - d / MAX_D) * 1000) / 10;
}

export function rankAll(resp: Responses): RankedDivision[] {
  const u = axisScores(resp);
  return DIVISIONS
    .map((d): RankedDivision => ({ ...d, user: u, fit: fitPct(dist(u, d)) }))
    .sort((a, b) => b.fit - a.fit);
}

export function determineType(
  userScores: Record<AxisKey, number>,
): ResolvedArchetype {
  const code = AX.map(ax =>
    userScores[ax] >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus,
  ).join('');
  const t = TYPES[code] ?? {
    name: '探究者',
    desc: 'あなたは独自のバランス感覚を持つタイプです。',
  };
  return { code, ...t };
}

export function scoreToPct(score: number): { pct: number; isPlus: boolean } {
  const isPlus = score >= 0;
  const pct = Math.round(50 + (Math.abs(score) / 2) * 50);
  return { pct, isPlus };
}

export function fitColor(p: number): { text: string; fill: string; bg: string } {
  if (p >= 80) return { text: '#1E7345', fill: '#4CAF7D', bg: '#ECF8F1' };
  if (p >= 60) return { text: '#2E6DB4', fill: '#4A90D9', bg: '#EBF3FC' };
  if (p >= 45) return { text: '#9C6310', fill: '#F5A623', bg: '#FFF6E6' };
  return { text: '#C0392B', fill: '#E8534A', bg: '#FFF0EE' };
}
