export type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';

export const AX: readonly AxisKey[] = ['A', 'B', 'C', 'D', 'E'] as const;

export type Response = 1 | 2 | 3 | 4 | 5;
export type Responses = Record<string, Response>;

export type Axis = {
  label: string;
  minus: string;
  plus: string;
  color: string;
  dark: string;
  tint: string;
  kanji_plus: string;
  kanji_minus: string;
  letter_plus: string;
  letter_minus: string;
  en_plus: string;
  en_minus: string;
};

export type Question = {
  id: string;
  axis: AxisKey;
  reversed: boolean;
  scenario: string;
  options: [string, string, string, string, string];
};

export type Division = {
  dept: string;
  name: string;
  en: string;
  about?: string;
} & Record<AxisKey, number>;

export type Archetype = { name: string; desc: string };

export type ResolvedArchetype = Archetype & { code: string };

export type RankedDivision = Division & {
  user: Record<AxisKey, number>;
  fit: number;
};

export type AxisDescTier =
  | 'strong_plus'
  | 'mild_plus'
  | 'neutral'
  | 'mild_minus'
  | 'strong_minus';

export type AxisDescTiers = Record<AxisDescTier, string>;
