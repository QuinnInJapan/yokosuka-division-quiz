import { describe, it, expect } from 'vitest';
import { archetypePalette } from './archetypePalette';

describe('archetypePalette', () => {
  it('returns a base gradient and exactly 3 blobs for any 5-letter code', () => {
    const p = archetypePalette('DASCG');
    expect(p.baseGradient).toMatch(/linear-gradient/);
    expect(p.blobs).toHaveLength(3);
    for (const blob of p.blobs) {
      expect(blob.color).toMatch(/^#|^var\(/);
      expect(blob.opacity).toBeGreaterThan(0);
      expect(blob.opacity).toBeLessThanOrEqual(1);
      expect(typeof blob.left).toBe('string');
      expect(typeof blob.top).toBe('string');
    }
  });

  it('produces a stable result for the same code', () => {
    expect(archetypePalette('DASCG')).toEqual(archetypePalette('DASCG'));
  });

  it('produces a different result for archetypes with different dominant axes', () => {
    const warm = archetypePalette('DASCG');
    const cool = archetypePalette('FPRIX');
    expect(warm).not.toEqual(cool);
  });

  it('falls back gracefully for an unknown code', () => {
    const p = archetypePalette('ZZZZZ');
    expect(p.blobs).toHaveLength(3);
    expect(p.baseGradient).toMatch(/linear-gradient/);
  });
});
