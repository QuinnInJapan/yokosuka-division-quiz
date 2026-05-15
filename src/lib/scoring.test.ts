import { describe, it, expect } from 'vitest';
import { scoreResp, axisScores, dist, fitPct, rankAll, determineType } from './scoring';
import type { Responses, Division } from '../data/types';
import { DEFAULT_RUNTIME_CONFIG } from '../config/appConfig';

describe('scoreResp', () => {
  it('maps responses onto the -3..3 axis when not reversed', () => {
    expect(scoreResp(3, false)).toBe(0);
    expect(scoreResp(5, false)).toBe(3);
    expect(scoreResp(1, false)).toBe(-3);
  });
  it('maps responses onto the -3..3 axis when reversed', () => {
    expect(scoreResp(3, true)).toBe(0);
    expect(scoreResp(5, true)).toBe(-3);
    expect(scoreResp(1, true)).toBe(3);
  });
});

describe('axisScores', () => {
  it('returns 0 for every axis when no responses', () => {
    expect(axisScores({})).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  });
  it('averages signed responses per axis, honoring reversed flag', () => {
    const resp: Responses = { 0: 5, 10: 5 };
    expect(axisScores(resp).A).toBeCloseTo(0);
    expect(axisScores(resp).B).toBeCloseTo(0);
  });
  it('produces 3 when only positive non-reversed answer is provided for axis', () => {
    const resp: Responses = { 0: 5 };
    expect(axisScores(resp).A).toBeCloseTo(3);
  });
  it('produces -3 when reversed Q1 answered as 5', () => {
    const resp: Responses = { 10: 5 };
    expect(axisScores(resp).A).toBeCloseTo(-3);
  });
});

describe('dist', () => {
  const u = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const d: Division = { dept: 'X', name: 'Y', A: 0, B: 0, C: 0, D: 0, E: 0 };
  it('returns 0 for identical vectors', () => {
    expect(dist(u, d)).toBe(0);
  });
  it('is symmetric in shifted single axis', () => {
    const d2: Division = { ...d, A: 3 };
    expect(dist(u, d2)).toBeCloseTo(3);
  });
});

describe('fitPct', () => {
  it('returns 100 at distance 0', () => {
    expect(fitPct(0)).toBe(100);
  });
  it('returns 0 at maximum distance sqrt(180)', () => {
    expect(fitPct(Math.sqrt(180))).toBe(0);
  });
});

describe('rankAll', () => {
  it('returns ranked divisions sorted descending by fit', () => {
    const ranked = rankAll({ 0: 5 });
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].fit).toBeGreaterThanOrEqual(ranked[i + 1].fit);
    }
  });
  it('attaches user scores to every entry', () => {
    const ranked = rankAll({ 0: 5 });
    expect(ranked[0].user).toEqual({ A: 3, B: 0, C: 0, D: 0, E: 0 });
  });
  it('uses divisions from the provided runtime config', () => {
    const customConfig = {
      ...DEFAULT_RUNTIME_CONFIG,
      divisions: [
        { dept: 'X', name: 'A-fit', A: 3, B: 0, C: 0, D: 0, E: 0 },
        { dept: 'X', name: 'A-miss', A: -3, B: 0, C: 0, D: 0, E: 0 },
      ],
    };

    const ranked = rankAll({ 0: 5 }, customConfig);

    expect(ranked.map(r => r.name)).toEqual(['A-fit', 'A-miss']);
  });
});

describe('determineType', () => {
  it('all-positive scores produce DASCG ("街のよろず屋")', () => {
    const t = determineType({ A: 1, B: 1, C: 1, D: 1, E: 1 });
    expect(t.code).toBe('DASCG');
    expect(t.name).toBe('街のよろず屋');
  });
  it('all-zero scores still pick the positive-side archetype key → DASCG', () => {
    const t = determineType({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    expect(t.code).toBe('DASCG');
  });
  it('all-negative scores produce FPRIX ("戦略のアーキテクト")', () => {
    const t = determineType({ A: -1, B: -1, C: -1, D: -1, E: -1 });
    expect(t.code).toBe('FPRIX');
    expect(t.name).toBe('戦略のアーキテクト');
  });
  it('returns a fallback Archetype with code preserved when TYPES has no entry', () => {
    const t = determineType({ A: 1, B: -1, C: 1, D: -1, E: 1 });
    expect(t.code.length).toBe(5);
  });
  it('uses archetype names from the provided runtime config', () => {
    const customConfig = {
      ...DEFAULT_RUNTIME_CONFIG,
      archetypes: {
        ...DEFAULT_RUNTIME_CONFIG.archetypes,
        DASCG: { name: '外部タイプ', desc: '外部設定のタイプ説明' },
      },
    };

    const t = determineType({ A: 1, B: 1, C: 1, D: 1, E: 1 }, customConfig);

    expect(t.name).toBe('外部タイプ');
  });
});
