import { describe, expect, it } from 'vitest';

import {
  ADMIN_SECTIONS,
  getInitialAdminSection,
  isAdminSection,
} from './adminShell';

describe('admin shell navigation', () => {
  it('defines the task sections without the legacy overview tab', () => {
    expect(ADMIN_SECTIONS.map((section) => section.id)).toEqual([
      'divisions',
      'questions',
      'archetypes',
      'axes',
      'json',
      'manual',
    ]);
    expect(isAdminSection('overview')).toBe(false);
    expect(isAdminSection('manual')).toBe(true);
  });

  it('restores the last valid section from storage', () => {
    const storage = {
      getItem: () => 'questions',
    };

    expect(getInitialAdminSection(storage)).toBe('questions');
  });

  it('falls back to 課データ when storage is empty or stale', () => {
    expect(getInitialAdminSection({ getItem: () => null })).toBe('divisions');
    expect(getInitialAdminSection({ getItem: () => 'overview' })).toBe('divisions');
  });

  it('keeps 使い方 as the bottom sidebar item', () => {
    expect(ADMIN_SECTIONS.at(-1)).toEqual({
      id: 'manual',
      label: '使い方',
    });
  });

  it('keeps 書き出し確認 as the finalization section', () => {
    expect(ADMIN_SECTIONS.find(section => section.id === 'json')).toEqual({
      id: 'json',
      label: '書き出し確認',
    });
  });
});
