import { AX, type AxisKey } from '../data/types';
import {
  normalizeAppConfig,
  runtimeWeightToConfig,
  type AppConfig,
  type RuntimeConfig,
} from './appConfig';
import { AXIS_MAX, AXIS_MIN } from '../data/axisScale';

const AXIS_FIELDS = [
  'label',
  'minus',
  'plus',
  'color',
  'dark',
  'tint',
] as const;

const DESC_TIERS = [
  'strong_plus',
  'mild_plus',
  'neutral',
  'mild_minus',
  'strong_minus',
] as const;

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export const ADMIN_DRAFT_KEY = 'yokosuka-quiz-admin-draft-v3';

export type AdminValidationError = {
  path: string;
  message: string;
};

export type AdminValidationResult =
  | { ok: true; config: RuntimeConfig; errors: [] }
  | { ok: false; config?: RuntimeConfig; errors: AdminValidationError[] };

export function parseAdminConfigJson(text: string): AdminValidationResult {
  try {
    return validateAdminConfig(JSON.parse(text));
  } catch (error) {
    return {
      ok: false,
      errors: [{
        path: 'JSON',
        message: error instanceof SyntaxError
          ? 'JSONの形式が正しくありません。括弧、カンマ、引用符を確認してください。'
          : messageFromError(error),
      }],
    };
  }
}

export function validateAdminConfig(input: unknown): AdminValidationResult {
  const errors: AdminValidationError[] = collectAdminErrors(input);
  let config: RuntimeConfig | undefined;

  try {
    config = normalizeAppConfig(input);
  } catch (error) {
    errors.push({ path: '設定ファイル', message: messageFromError(error) });
  }

  if (errors.length > 0) {
    return { ok: false, config, errors };
  }
  return { ok: true, config: config!, errors: [] };
}

export function exportAdminConfigJs(input: AppConfig): string {
  return [
    '/* 横須賀市役所 部署タイプ診断 設定ファイル */',
    `window.__YOKOSUKA_APP_CONFIG__ = ${JSON.stringify(toExportableAppConfig(input), null, 2)};`,
    '',
  ].join('\n');
}

function toExportableAppConfig(input: AppConfig): AppConfig {
  const config = normalizeAppConfig(input);
  return {
    version: 1,
    axes: config.axes,
    questions: config.questions,
    divisions: config.divisions.map(division => ({
      dept: division.dept,
      name: division.name,
      about: division.about,
      A: runtimeWeightToConfig(division.A),
      B: runtimeWeightToConfig(division.B),
      C: runtimeWeightToConfig(division.C),
      D: runtimeWeightToConfig(division.D),
      E: runtimeWeightToConfig(division.E),
    })),
    archetypes: config.archetypes,
    axisDescriptions: config.axisDescriptions,
  };
}

export function runtimeToAppConfig(config: RuntimeConfig): AppConfig {
  return {
    version: 1,
    axes: config.axes,
    questions: config.questions,
    divisions: config.divisions.map(division => ({
      dept: division.dept,
      name: division.name,
      about: division.about,
      A: runtimeWeightToConfig(division.A),
      B: runtimeWeightToConfig(division.B),
      C: runtimeWeightToConfig(division.C),
      D: runtimeWeightToConfig(division.D),
      E: runtimeWeightToConfig(division.E),
    })),
    archetypes: config.archetypes,
    axisDescriptions: config.axisDescriptions,
  };
}

function collectAdminErrors(input: unknown): AdminValidationError[] {
  const errors: AdminValidationError[] = [];
  if (!isRecord(input)) return errors;

  if (isRecord(input.axes)) {
    for (const axis of AX) {
      const item = input.axes[axis];
      if (!isRecord(item)) continue;
      for (const field of AXIS_FIELDS) {
        requireAdminText(item[field], `axes.${axis}.${field}`, `5軸 ${axis} ${field}`, errors);
      }
      for (const field of ['color', 'dark', 'tint'] as const) {
        const value = item[field];
        if (typeof value === 'string' && value.length > 0 && !HEX_COLOR_RE.test(value)) {
          errors.push({ path: `axes.${axis}.${field}`, message: `5軸 ${axis} ${field}は#RRGGBB形式で入力してください。` });
        }
      }
    }
  }

  if (Array.isArray(input.divisions)) {
    const seenDivisions = new Map<string, number>();
    input.divisions.forEach((division, index) => {
      if (!isRecord(division)) return;
      requireAdminText(division.dept, `divisions.${index}.dept`, `課データ ${index + 1}行目 部`, errors);
      requireAdminText(division.name, `divisions.${index}.name`, `課データ ${index + 1}行目 課名`, errors);
      requireAdminText(division.about, `divisions.${index}.about`, `課データ ${index + 1}行目 説明文`, errors);
      if (typeof division.dept === 'string' && typeof division.name === 'string') {
        const key = divisionIdentity(division.dept, division.name);
        if (key !== '::') {
          const firstIndex = seenDivisions.get(key);
          if (firstIndex !== undefined) {
            errors.push({
              path: `divisions.${index}.name`,
              message: `課データ ${index + 1}行目は${firstIndex + 1}行目と同じ部・課名です。部と課名の組み合わせは重複できません。`,
            });
          } else {
            seenDivisions.set(key, index);
          }
        }
      }
      for (const axis of AX) {
        const weight = division[axis];
        const label = `課データ ${index + 1}行目 ${axis}`;
        if (typeof weight !== 'number' || !Number.isFinite(weight)) {
          errors.push({ path: `divisions.${index}.${axis}`, message: `${label}は${AXIS_MIN}〜${AXIS_MAX}の整数で入力してください。` });
          continue;
        }
        if (!Number.isInteger(weight)) {
          errors.push({ path: `divisions.${index}.${axis}`, message: `${label}は整数で入力してください。` });
        }
        if (weight < AXIS_MIN || weight > AXIS_MAX) {
          errors.push({ path: `divisions.${index}.${axis}`, message: `${label}は${AXIS_MIN}〜${AXIS_MAX}の範囲で入力してください。` });
        }
      }
    });
  }

  if (Array.isArray(input.questions)) {
    input.questions.forEach((question, index) => {
      if (!isRecord(question)) return;
      if (!AX.includes(question.axis as AxisKey)) {
        errors.push({ path: `questions.${index}.axis`, message: `設問 ${index + 1}の軸を選択してください。` });
      }
      if (typeof question.reversed !== 'boolean') {
        errors.push({ path: `questions.${index}.reversed`, message: `設問 ${index + 1}の方向を選択してください。` });
      }
      requireAdminText(question.scenario, `questions.${index}.scenario`, `設問 ${index + 1} 設問文`, errors);
      if (Array.isArray(question.options)) {
        question.options.forEach((option, optionIndex) => {
          requireAdminText(option, `questions.${index}.options.${optionIndex}`, `設問 ${index + 1} 選択肢${optionIndex + 1}`, errors);
        });
      }
    });
  }

  if (isRecord(input.archetypes)) {
    for (const [code, archetype] of Object.entries(input.archetypes)) {
      if (!isRecord(archetype)) continue;
      requireAdminText(archetype.name, `archetypes.${code}.name`, `アーキタイプ ${code} 名称`, errors);
      requireAdminText(archetype.desc, `archetypes.${code}.desc`, `アーキタイプ ${code} 説明文`, errors);
      const nameBreakAt = archetype.nameBreakAt;
      if (nameBreakAt !== undefined) {
        if (typeof nameBreakAt !== 'number' || !Number.isInteger(nameBreakAt) || nameBreakAt <= 0) {
          errors.push({ path: `archetypes.${code}.nameBreakAt`, message: `アーキタイプ ${code}の改行位置は空欄または1以上の整数で入力してください。` });
        } else if (typeof archetype.name === 'string' && nameBreakAt >= archetype.name.length) {
          errors.push({ path: `archetypes.${code}.nameBreakAt`, message: `アーキタイプ ${code}の改行位置は名称の文字数より小さくしてください。` });
        }
      }
    }
  }

  if (isRecord(input.axisDescriptions)) {
    for (const axis of AX) {
      const descriptions = input.axisDescriptions[axis];
      if (!isRecord(descriptions)) continue;
      for (const tier of DESC_TIERS) {
        requireAdminText(descriptions[tier], `axisDescriptions.${axis}.${tier}`, `5軸 ${axis} ${tier}`, errors);
      }
    }
  }

  return errors;
}

function requireAdminText(
  value: unknown,
  path: string,
  label: string,
  errors: AdminValidationError[],
): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push({ path, message: `${label}を入力してください。` });
  }
}

function divisionIdentity(dept: string, name: string): string {
  return `${dept.trim()}::${name.trim()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value);
}

function messageFromError(error: unknown): string {
  if (!(error instanceof Error)) return '設定内容を確認できませんでした。';
  const message = error.message;
  if (message === 'Config must be an object') return '設定ファイル全体はJSONオブジェクトにしてください。';
  if (message === 'Unsupported config version') return '設定ファイルのバージョンに対応していません。';
  if (message.includes('must be a non-empty array')) return '必要な一覧データが空、または配列形式ではありません。';
  if (message.includes('must be an object')) return '必要な項目がオブジェクト形式ではありません。';
  if (message.includes('must be a non-empty string')) return '必須の文字項目に未入力があります。';
  if (message.includes('must be one of')) return '選択項目の値が正しくありません。';
  if (message.includes('must have 5 entries')) return '設問の選択肢は5件入力してください。';
  if (message.includes('must be boolean')) return '設問の方向を選択してください。';
  if (message.includes('Duplicate division')) return '部と課名の組み合わせが重複しています。';
  if (message.includes('must be an integer')) return '数値項目は整数で入力してください。';
  if (message.includes(`must be between ${AXIS_MIN} and ${AXIS_MAX}`)) return `課データのA〜Eは${AXIS_MIN}〜${AXIS_MAX}の整数で入力してください。`;
  return message;
}
