import { describe, it, expect } from 'vitest';
import { TYPES } from '../data/archetypes';
import { sukarinImages, sukarinSrc } from './sukarinImages';

describe('sukarinImages', () => {
  it('resolves a non-empty URL for every archetype code', () => {
    const codes = Object.keys(TYPES);
    expect(codes.length).toBe(32);
    for (const code of codes) {
      const url = sukarinImages[code];
      expect(url, `missing image for code ${code}`).toBeTruthy();
      expect(url, `empty image url for code ${code}`).not.toBe('');
    }
  });

  it('sukarinSrc returns undefined for unknown codes', () => {
    expect(sukarinSrc('ZZZZZ')).toBeUndefined();
  });
});
