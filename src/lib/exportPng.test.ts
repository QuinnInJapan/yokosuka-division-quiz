import { describe, it, expect } from 'vitest';
import { sanitizeFilename, formatDateForFilename, formatDateForDisplay, topNBestFits, bottomNWorstFits, formatPct, axisDotPct } from './exportPng';
import type { RankedDivision } from '../data/types';

describe('sanitizeFilename', () => {
  it('builds yokosuka-quiz-{type}-{date}.png with kana/kanji preserved', () => {
    const date = new Date(2026, 3, 30); // April 30, 2026 local
    expect(sanitizeFilename('街のよろず屋', date)).toBe('yokosuka-quiz-街のよろず屋-2026-04-30.png');
  });
  it('strips path separators and quotes from type name', () => {
    const date = new Date(2026, 0, 5);
    expect(sanitizeFilename('foo/bar"baz', date)).toBe('yokosuka-quiz-foobarbaz-2026-01-05.png');
  });
  it('keeps full-width punctuation that is filename-safe', () => {
    const date = new Date(2026, 0, 5);
    expect(sanitizeFilename('街・人', date)).toBe('yokosuka-quiz-街・人-2026-01-05.png');
  });
});

describe('formatDateForDisplay', () => {
  it('renders YYYY.MM.DD with zero-padding', () => {
    expect(formatDateForDisplay(new Date(2026, 3, 30))).toBe('2026.04.30');
    expect(formatDateForDisplay(new Date(2026, 0, 5))).toBe('2026.01.05');
  });
});

const mk = (name: string, fit: number): RankedDivision => ({
  dept: 'X', name, en: '', A: 0, B: 0, C: 0, D: 0, E: 0,
  user: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  fit,
});

describe('topNBestFits / bottomNWorstFits', () => {
  const ranked = [mk('a', 90), mk('b', 80), mk('c', 70), mk('d', 60), mk('e', 50), mk('f', 40), mk('g', 30)];
  it('returns first N with absolute ranks', () => {
    const top = topNBestFits(ranked, 3);
    expect(top.map(x => x.rank)).toEqual([1, 2, 3]);
    expect(top.map(x => x.name)).toEqual(['a', 'b', 'c']);
  });
  it('returns last N preserving original ordering with absolute ranks', () => {
    const bot = bottomNWorstFits(ranked, 3);
    expect(bot.map(x => x.rank)).toEqual([5, 6, 7]);
    expect(bot.map(x => x.name)).toEqual(['e', 'f', 'g']);
  });
  it('clamps when N > list length', () => {
    expect(topNBestFits(ranked.slice(0, 2), 5).length).toBe(2);
  });
});

describe('formatPct', () => {
  it('rounds to nearest int and appends %', () => {
    expect(formatPct(86.4)).toBe('86%');
    expect(formatPct(86.6)).toBe('87%');
    expect(formatPct(0)).toBe('0%');
  });
});

describe('axisDotPct', () => {
  it('maps -2..+2 to 0..100', () => {
    expect(axisDotPct(-2)).toBe(0);
    expect(axisDotPct(0)).toBe(50);
    expect(axisDotPct(2)).toBe(100);
  });
  it('clamps out-of-range values', () => {
    expect(axisDotPct(-3)).toBe(0);
    expect(axisDotPct(3)).toBe(100);
  });
});
