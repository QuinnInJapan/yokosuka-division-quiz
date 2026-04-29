import { describe, it, expect } from 'vitest';
import { scoreResp, axisScores, dist, fitPct, rankAll, determineType } from './scoring';
import type { Responses, Division } from '../data/types';

describe('scoreResp', () => {
  it('returns r-3 when not reversed', () => {
    expect(scoreResp(3, false)).toBe(0);
    expect(scoreResp(5, false)).toBe(2);
    expect(scoreResp(1, false)).toBe(-2);
  });
  it('returns -(r-3) when reversed', () => {
    expect(scoreResp(3, true)).toBe(0);
    expect(scoreResp(5, true)).toBe(-2);
    expect(scoreResp(1, true)).toBe(2);
  });
});

describe('axisScores', () => {
  it('returns 0 for every axis when no responses', () => {
    expect(axisScores({})).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  });
  it('averages signed responses per axis, honoring reversed flag', () => {
    const resp: Responses = { A1: 5, A3: 5 };
    expect(axisScores(resp).A).toBeCloseTo(0);
    expect(axisScores(resp).B).toBeCloseTo(0);
  });
  it('produces 2 when only positive non-reversed answer is provided for axis', () => {
    const resp: Responses = { A1: 5 };
    expect(axisScores(resp).A).toBeCloseTo(2);
  });
  it('produces -2 when reversed Q1 answered as 5', () => {
    const resp: Responses = { A3: 5 };
    expect(axisScores(resp).A).toBeCloseTo(-2);
  });
});

describe('dist', () => {
  const u = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const d: Division = { dept: 'X', name: 'Y', en: 'Z', A: 0, B: 0, C: 0, D: 0, E: 0 };
  it('returns 0 for identical vectors', () => {
    expect(dist(u, d)).toBe(0);
  });
  it('is symmetric in shifted single axis', () => {
    const d2: Division = { ...d, A: 2 };
    expect(dist(u, d2)).toBeCloseTo(2);
  });
});

describe('fitPct', () => {
  it('returns 100 at distance 0', () => {
    expect(fitPct(0)).toBe(100);
  });
  it('returns 0 at maximum distance sqrt(80)', () => {
    expect(fitPct(Math.sqrt(80))).toBe(0);
  });
});

describe('rankAll', () => {
  it('returns ranked divisions sorted descending by fit', () => {
    const ranked = rankAll({ A1: 5 });
    expect(ranked.length).toBeGreaterThan(0);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].fit).toBeGreaterThanOrEqual(ranked[i + 1].fit);
    }
  });
  it('attaches user scores to every entry', () => {
    const ranked = rankAll({ A1: 5 });
    expect(ranked[0].user).toEqual({ A: 2, B: 0, C: 0, D: 0, E: 0 });
  });
});

describe('determineType', () => {
  it('all-positive scores produce DASCG ("街のよろず屋")', () => {
    const t = determineType({ A: 1, B: 1, C: 1, D: 1, E: 1 });
    expect(t.code).toBe('DASCG');
    expect(t.name).toBe('街のよろず屋');
  });
  it('all-zero scores still pick letter_plus → DASCG', () => {
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
});
