import { afterEach, describe, expect, it } from 'vitest';
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

  it('turns the default config object into runtime lookup data', () => {
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
  const globalConfig = globalThis as typeof globalThis & {
    __YOKOSUKA_APP_CONFIG__?: unknown;
  };

  afterEach(() => {
    delete globalConfig.__YOKOSUKA_APP_CONFIG__;
  });

  it('loads valid external app-config.js data when it is available', async () => {
    const external = {
      ...DEFAULT_CONFIG,
      divisions: [
        {
          dept: 'テスト部',
          name: 'テスト課',
          A: 3,
          B: 2,
          C: 0,
          D: -1,
          E: -3,
          about: 'app-config.jsから読み込まれた課です。',
        },
      ],
    };
    globalConfig.__YOKOSUKA_APP_CONFIG__ = external;

    const config = await loadRuntimeConfig();

    expect(config.divisions).toHaveLength(1);
    expect(config.divisions[0].name).toBe('テスト課');
    expect(config.divisions[0].A).toBe(3);
    expect(config.divisions[0].E).toBe(-3);
  });

  it('falls back to bundled defaults when app-config.js data is missing', async () => {
    const config = await loadRuntimeConfig();

    expect(config).toBe(DEFAULT_RUNTIME_CONFIG);
  });

  it('falls back to bundled defaults when app-config.js data is invalid', async () => {
    globalConfig.__YOKOSUKA_APP_CONFIG__ = { version: 1 };

    const config = await loadRuntimeConfig();

    expect(config).toBe(DEFAULT_RUNTIME_CONFIG);
  });
});
