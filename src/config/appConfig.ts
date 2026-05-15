import { TYPES } from '../data/archetypes';
import { AXES } from '../data/axes';
import { AX, type Archetype, type Axis, type AxisDescTiers, type AxisKey, type ConfigDivision, type Division, type Question } from '../data/types';
import { AXIS_DESC } from '../data/descriptions';
import { DIVISIONS } from '../data/divisions';
import { QUESTIONS } from '../data/questions';
import { AXIS_MAX, AXIS_MIN, roundAxisValue } from '../data/axisScale';

const DESC_TIERS = [
  'strong_plus',
  'mild_plus',
  'neutral',
  'mild_minus',
  'strong_minus',
] as const;

export type AppConfig = {
  version: 1;
  axes: Record<AxisKey, Axis>;
  questions: readonly Question[];
  divisions: readonly ConfigDivision[];
  archetypes: Record<string, Archetype>;
  axisDescriptions: Record<AxisKey, AxisDescTiers>;
};

export type RuntimeConfig = Omit<AppConfig, 'divisions'> & {
  divisions: readonly Division[];
};

const GLOBAL_CONFIG_KEY = '__YOKOSUKA_APP_CONFIG__';

export const DEFAULT_CONFIG: AppConfig = {
  version: 1,
  axes: AXES,
  questions: QUESTIONS,
  divisions: DIVISIONS.map(toConfigDivision),
  archetypes: TYPES,
  axisDescriptions: AXIS_DESC,
};

export function normalizeAppConfig(input: unknown): RuntimeConfig {
  if (!isRecord(input)) throw new Error('Config must be an object');
  if (input.version !== 1) throw new Error('Unsupported config version');

  const axes = validateAxes(input.axes);
  const questions = validateQuestions(input.questions);
  const divisions = validateDivisions(input.divisions);
  const archetypes = validateArchetypes(input.archetypes);
  const axisDescriptions = validateAxisDescriptions(input.axisDescriptions);

  return {
    version: 1,
    axes,
    questions,
    divisions,
    archetypes,
    axisDescriptions,
  };
}

export const DEFAULT_RUNTIME_CONFIG = normalizeAppConfig(DEFAULT_CONFIG);

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  const globalConfig = readGlobalConfig();
  if (globalConfig !== undefined) {
    try {
      return normalizeAppConfig(globalConfig);
    } catch {
      return DEFAULT_RUNTIME_CONFIG;
    }
  }

  return DEFAULT_RUNTIME_CONFIG;
}

function readGlobalConfig(): unknown {
  return (globalThis as Record<string, unknown>)[GLOBAL_CONFIG_KEY];
}

function validateAxes(value: unknown): Record<AxisKey, Axis> {
  if (!isRecord(value)) throw new Error('axes must be an object');
  const axes = {} as Record<AxisKey, Axis>;
  for (const key of AX) {
    const axis = value[key];
    if (!isRecord(axis)) throw new Error(`Axis ${key} must be an object`);
    axes[key] = {
      label: requireString(axis.label, `axes.${key}.label`),
      minus: requireString(axis.minus, `axes.${key}.minus`),
      plus: requireString(axis.plus, `axes.${key}.plus`),
      color: requireString(axis.color, `axes.${key}.color`),
      dark: requireString(axis.dark, `axes.${key}.dark`),
      tint: requireString(axis.tint, `axes.${key}.tint`),
    };
  }
  return axes;
}

function validateQuestions(value: unknown): Question[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('questions must be a non-empty array');
  }
  return value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`questions.${index} must be an object`);
    const axis = requireAxisKey(item.axis, `questions.${index}.axis`);
    if (typeof item.reversed !== 'boolean') {
      throw new Error(`questions.${index}.reversed must be boolean`);
    }
    const options = item.options;
    if (!Array.isArray(options) || options.length !== 5) {
      throw new Error(`questions.${index}.options must have 5 entries`);
    }
    return {
      axis,
      reversed: item.reversed,
      scenario: requireString(item.scenario, `questions.${index}.scenario`),
      options: options.map((option, optionIndex) =>
        requireString(option, `questions.${index}.options.${optionIndex}`),
      ) as Question['options'],
    };
  });
}

function validateDivisions(value: unknown): Division[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('divisions must be a non-empty array');
  }
  const seen = new Set<string>();
  return value.map((item, index) => {
    if (!isRecord(item)) throw new Error(`divisions.${index} must be an object`);
    const dept = requireString(item.dept, `divisions.${index}.dept`);
    const name = requireString(item.name, `divisions.${index}.name`);
    const key = `${dept.trim()}::${name.trim()}`;
    if (seen.has(key)) throw new Error(`Duplicate division: ${dept} ${name}`);
    seen.add(key);
    return {
      dept,
      name,
      about: item.about === undefined ? undefined : requireString(item.about, `divisions.${index}.about`),
      A: configWeightToRuntime(requireConfigWeight(item.A, `divisions.${index}.A`)),
      B: configWeightToRuntime(requireConfigWeight(item.B, `divisions.${index}.B`)),
      C: configWeightToRuntime(requireConfigWeight(item.C, `divisions.${index}.C`)),
      D: configWeightToRuntime(requireConfigWeight(item.D, `divisions.${index}.D`)),
      E: configWeightToRuntime(requireConfigWeight(item.E, `divisions.${index}.E`)),
    };
  });
}

function validateArchetypes(value: unknown): Record<string, Archetype> {
  if (!isRecord(value)) throw new Error('archetypes must be an object');
  const archetypes: Record<string, Archetype> = {};
  for (const [code, item] of Object.entries(value)) {
    if (!isRecord(item)) throw new Error(`archetypes.${code} must be an object`);
    const nameBreakAt = item.nameBreakAt;
    if (nameBreakAt !== undefined && !Number.isInteger(nameBreakAt)) {
      throw new Error(`archetypes.${code}.nameBreakAt must be an integer`);
    }
    const normalizedNameBreakAt =
      nameBreakAt === undefined ? undefined : Number(nameBreakAt);
    archetypes[code] = {
      name: requireString(item.name, `archetypes.${code}.name`),
      desc: requireString(item.desc, `archetypes.${code}.desc`),
      ...(normalizedNameBreakAt === undefined ? {} : { nameBreakAt: normalizedNameBreakAt }),
    };
  }
  return archetypes;
}

function validateAxisDescriptions(value: unknown): Record<AxisKey, AxisDescTiers> {
  if (!isRecord(value)) throw new Error('axisDescriptions must be an object');
  const descriptions = {} as Record<AxisKey, AxisDescTiers>;
  for (const axis of AX) {
    const tiers = value[axis];
    if (!isRecord(tiers)) throw new Error(`axisDescriptions.${axis} must be an object`);
    descriptions[axis] = Object.fromEntries(
      DESC_TIERS.map(tier => [
        tier,
        requireString(tiers[tier], `axisDescriptions.${axis}.${tier}`),
      ]),
    ) as AxisDescTiers;
  }
  return descriptions;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function requireAxisKey(value: unknown, label: string): AxisKey {
  if (AX.includes(value as AxisKey)) return value as AxisKey;
  throw new Error(`${label} must be one of ${AX.join(', ')}`);
}

function requireConfigWeight(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
  if (value < AXIS_MIN || value > AXIS_MAX) {
    throw new Error(`${label} must be between ${AXIS_MIN} and ${AXIS_MAX}`);
  }
  return value;
}

export function configWeightToRuntime(weight: number): number {
  return weight;
}

export function runtimeWeightToConfig(weight: number): number {
  return roundAxisValue(weight);
}

function toConfigDivision(division: Division): ConfigDivision {
  return {
    dept: division.dept,
    name: division.name,
    about: division.about,
    A: runtimeWeightToConfig(division.A),
    B: runtimeWeightToConfig(division.B),
    C: runtimeWeightToConfig(division.C),
    D: runtimeWeightToConfig(division.D),
    E: runtimeWeightToConfig(division.E),
  };
}
