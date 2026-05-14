import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, normalizeAppConfig } from './appConfig';
import {
  ADMIN_DRAFT_KEY,
  exportAdminConfig,
  parseAdminConfigJson,
  validateAdminConfig,
} from './adminConfig';

describe('parseAdminConfigJson', () => {
  it('parses and normalizes valid JSON', () => {
    const result = parseAdminConfigJson(JSON.stringify(DEFAULT_CONFIG));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.config.divisions.length).toBe(DEFAULT_CONFIG.divisions.length);
      expect(result.config.questions.length).toBe(DEFAULT_CONFIG.questions.length);
    }
  });

  it('returns a blocking error for invalid JSON text', () => {
    const result = parseAdminConfigJson('{invalid');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].message).toContain('JSON');
    }
  });
});

describe('validateAdminConfig', () => {
  it('accepts legacy imported questions with IDs while normalizing them away', () => {
    const config = {
      ...DEFAULT_CONFIG,
      questions: DEFAULT_CONFIG.questions.map((question, index) => ({
        ...question,
        id: `legacy-${index + 1}`,
      })),
      questionOrder: ['legacy-1'],
    } as unknown;

    const result = validateAdminConfig(config);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect('id' in result.config.questions[0]).toBe(false);
      expect('questionOrder' in result.config).toBe(false);
    }
  });

  it('rejects weights outside -10..10', () => {
    const config = {
      ...DEFAULT_CONFIG,
      divisions: [{ ...DEFAULT_CONFIG.divisions[0], A: 11 }],
    };

    const result = validateAdminConfig(config);

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.message.includes('-10〜10'))).toBe(true);
  });

  it('rejects weights that are not integer values', () => {
    const config = {
      ...DEFAULT_CONFIG,
      divisions: [{ ...DEFAULT_CONFIG.divisions[0], A: 7.5 }],
    };

    const result = validateAdminConfig(config);

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.message.includes('整数'))).toBe(true);
  });

  it('requires user-facing text fields', () => {
    const config = {
      ...DEFAULT_CONFIG,
      divisions: [{ ...DEFAULT_CONFIG.divisions[0], name: '' }],
    };

    const result = validateAdminConfig(config);

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.path === 'divisions.0.name')).toBe(true);
  });

  it('rejects duplicate division department and name pairs', () => {
    const first = DEFAULT_CONFIG.divisions[0];
    const config = {
      ...DEFAULT_CONFIG,
      divisions: [
        first,
        { ...DEFAULT_CONFIG.divisions[1], dept: ` ${first.dept} `, name: first.name },
      ],
    };

    const result = validateAdminConfig(config);

    expect(result.ok).toBe(false);
    expect(result.errors.some(error => error.message.includes('部・課名'))).toBe(true);
  });
});

describe('exportAdminConfig', () => {
  it('exports normalized JSON that runtime config can load', () => {
    const json = exportAdminConfig(DEFAULT_CONFIG);
    const parsed = JSON.parse(json);
    const runtime = normalizeAppConfig(parsed);

    expect(parsed.questionMap).toBeUndefined();
    expect(parsed.questionOrder).toBeUndefined();
    expect(parsed.questions[0].id).toBeUndefined();
    expect(parsed.divisions[0].en).toBeUndefined();
    expect(parsed.axes.A.en_plus).toBeUndefined();
    expect(parsed.axes.A.en_minus).toBeUndefined();
    const axis = parsed.axes.A as Record<string, unknown>;
    expect(axis.kanji_plus).toBeUndefined();
    expect(axis.kanji_minus).toBeUndefined();
    expect(axis.letter_plus).toBeUndefined();
    expect(axis.letter_minus).toBeUndefined();
    expect(runtime.divisions.length).toBe(DEFAULT_CONFIG.divisions.length);
  });

  it('uses a stable localStorage key', () => {
    expect(ADMIN_DRAFT_KEY).toBe('yokosuka-quiz-admin-draft-v2');
  });
});
