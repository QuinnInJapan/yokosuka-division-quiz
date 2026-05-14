import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_CONFIG,
  DEFAULT_RUNTIME_CONFIG,
  loadRuntimeConfig,
  normalizeAppConfig,
} from './appConfig';

describe('normalizeAppConfig', () => {
  it('loads ordered questions without question IDs or questionOrder', () => {
    const runtime = normalizeAppConfig(DEFAULT_CONFIG);

    expect(runtime.questions).toHaveLength(DEFAULT_CONFIG.questions.length);
    expect(runtime.questions[0].axis).toBe(DEFAULT_CONFIG.questions[0].axis);
    expect('id' in runtime.questions[0]).toBe(false);
    expect('questionOrder' in runtime).toBe(false);
    expect('questionMap' in runtime).toBe(false);
  });

  it('turns the default JSON-shaped config into runtime lookup data', () => {
    const config = normalizeAppConfig(DEFAULT_CONFIG);

    expect(config.version).toBe(1);
    expect(config.questions.length).toBe(DEFAULT_CONFIG.questions.length);
    expect(config.divisions.length).toBeGreaterThan(100);
    expect(config.archetypes.DASCG.name).toBe('街のよろず屋');
    expect('en' in config.divisions[0]).toBe(false);
    expect('en_plus' in config.axes.A).toBe(false);
    expect('en_minus' in config.axes.A).toBe(false);
  });

  it('omits legacy axis kanji and letter fields from runtime config', () => {
    const config = normalizeAppConfig(DEFAULT_CONFIG);
    const axis = config.axes.A as Record<string, unknown>;

    expect(axis.kanji_plus).toBeUndefined();
    expect(axis.kanji_minus).toBeUndefined();
    expect(axis.letter_plus).toBeUndefined();
    expect(axis.letter_minus).toBeUndefined();
  });

  it('rejects configs without questions', () => {
    const config = {
      ...DEFAULT_CONFIG,
      questions: [],
    };

    expect(() => normalizeAppConfig(config)).toThrow(/questions must be a non-empty array/);
  });
});

describe('loadRuntimeConfig', () => {
  it('loads valid external JSON when it is available', async () => {
    const external = {
      ...DEFAULT_CONFIG,
      divisions: [
        {
          dept: 'テスト部',
          name: 'テスト課',
          A: 10,
          B: 6,
          C: 0,
          D: -4,
          E: -10,
          about: '外部JSONから読み込まれた課です。',
        },
      ],
    };
    const fetchConfig = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => external,
    });

    const config = await loadRuntimeConfig(fetchConfig);

    expect(fetchConfig).toHaveBeenCalledWith('app-config.json', { cache: 'no-cache' });
    expect(config.divisions).toHaveLength(1);
    expect(config.divisions[0].name).toBe('テスト課');
    expect(config.divisions[0].A).toBe(2);
    expect(config.divisions[0].E).toBe(-2);
  });

  it('falls back to bundled defaults when external JSON is missing', async () => {
    const fetchConfig = vi.fn().mockResolvedValue({ ok: false });

    const config = await loadRuntimeConfig(fetchConfig);

    expect(config).toBe(DEFAULT_RUNTIME_CONFIG);
  });

  it('falls back to bundled defaults when external JSON is invalid', async () => {
    const fetchConfig = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: 1 }),
    });

    const config = await loadRuntimeConfig(fetchConfig);

    expect(config).toBe(DEFAULT_RUNTIME_CONFIG);
  });
});
