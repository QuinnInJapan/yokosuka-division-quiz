export const AXIS_MIN = -3;
export const AXIS_MAX = 3;
export const AXIS_ABS_MAX = 3;
export const AXIS_RANGE = AXIS_MAX - AXIS_MIN;
export const AXIS_TICKS = [-3, -2, -1, 0, 1, 2, 3] as const;

export function clampAxisValue(value: number): number {
  return Math.max(AXIS_MIN, Math.min(AXIS_MAX, value));
}

export function roundAxisValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clampAxisValue(Math.round(value));
}

export function axisValueToPct(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return ((clampAxisValue(value) - AXIS_MIN) / AXIS_RANGE) * 100;
}
