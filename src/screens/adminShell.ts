export type AdminSection = 'divisions' | 'questions' | 'archetypes' | 'axes' | 'json';

export const ADMIN_SECTION_STORAGE_KEY = 'yokosuka-division-quiz-admin-section';

export const ADMIN_SECTIONS: readonly { id: AdminSection; label: string }[] = [
  { id: 'divisions', label: '課データ' },
  { id: 'questions', label: '設問' },
  { id: 'archetypes', label: 'アーキタイプ' },
  { id: 'axes', label: '5軸・説明文' },
  { id: 'json', label: '書き出し確認' },
];

export function isAdminSection(value: unknown): value is AdminSection {
  return ADMIN_SECTIONS.some(section => section.id === value);
}

export function getInitialAdminSection(
  storage?: Pick<Storage, 'getItem'> | null,
): AdminSection {
  const source = storage ?? (typeof window === 'undefined' ? null : window.localStorage);
  const saved = source?.getItem(ADMIN_SECTION_STORAGE_KEY);
  return isAdminSection(saved) ? saved : 'divisions';
}
