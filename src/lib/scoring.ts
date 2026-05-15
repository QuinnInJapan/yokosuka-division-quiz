import type { AxisKey, Responses, Response, Division, RankedDivision, ResolvedArchetype } from '../data/types';
import { AX } from '../data/types';
import { DEFAULT_RUNTIME_CONFIG, type RuntimeConfig } from '../config/appConfig';
import { AXIS_ABS_MAX, AXIS_RANGE } from '../data/axisScale';

export function scoreResp(r: Response, reversed: boolean): number {
  const v = (r - 3) * (AXIS_ABS_MAX / 2);
  return reversed ? (v === 0 ? 0 : -v) : v;
}

export function axisScores(
  resp: Responses,
  config: RuntimeConfig = DEFAULT_RUNTIME_CONFIG,
): Record<AxisKey, number> {
  const buckets: Record<AxisKey, number[]> = { A: [], B: [], C: [], D: [], E: [] };
  for (const [index, r] of Object.entries(resp)) {
    const q = config.questions[Number(index)];
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

export const MAX_D = Math.sqrt(AX.length * (AXIS_RANGE ** 2));

const ARCHETYPE_CODE_LETTERS: Record<AxisKey, { plus: string; minus: string }> = {
  A: { plus: 'D', minus: 'F' },
  B: { plus: 'A', minus: 'P' },
  C: { plus: 'S', minus: 'R' },
  D: { plus: 'C', minus: 'I' },
  E: { plus: 'G', minus: 'X' },
};

export function dist(
  u: Record<AxisKey, number>,
  d: Division | Record<AxisKey, number>,
): number {
  return Math.sqrt(AX.reduce((s, ax) => s + (u[ax] - d[ax]) ** 2, 0));
}

export function fitPct(d: number): number {
  return Math.round((1 - d / MAX_D) * 1000) / 10;
}

export function rankAll(
  resp: Responses,
  config: RuntimeConfig = DEFAULT_RUNTIME_CONFIG,
): RankedDivision[] {
  const u = axisScores(resp, config);
  return config.divisions
    .map((d): RankedDivision => ({ ...d, user: u, fit: fitPct(dist(u, d)) }))
    .sort((a, b) => b.fit - a.fit);
}

export function determineType(
  userScores: Record<AxisKey, number>,
  config: RuntimeConfig = DEFAULT_RUNTIME_CONFIG,
): ResolvedArchetype {
  const code = AX.map(ax =>
    userScores[ax] >= 0 ? ARCHETYPE_CODE_LETTERS[ax].plus : ARCHETYPE_CODE_LETTERS[ax].minus,
  ).join('');
  const t = config.archetypes[code] ?? {
    name: '探究者',
    desc: 'あなたは独自のバランス感覚を持つタイプです。',
  };
  return { code, ...t };
}

export function scoreToPct(score: number): { pct: number; isPlus: boolean } {
  const isPlus = score >= 0;
  const pct = Math.round(50 + (Math.abs(score) / AXIS_ABS_MAX) * 50);
  return { pct, isPlus };
}

export function fitColor(p: number): { text: string; fill: string; bg: string } {
  if (p >= 80) return { text: '#1E7345', fill: '#4CAF7D', bg: '#ECF8F1' };
  if (p >= 60) return { text: '#2E6DB4', fill: '#4A90D9', bg: '#EBF3FC' };
  if (p >= 45) return { text: '#A16207', fill: '#EAB308', bg: '#FEF9C3' };
  return { text: '#C0392B', fill: '#E8534A', bg: '#FFF0EE' };
}

export function fitTierLabel(p: number): string {
  if (p >= 80) return '高';
  if (p >= 60) return '良';
  if (p >= 45) return '中';
  return '低';
}
