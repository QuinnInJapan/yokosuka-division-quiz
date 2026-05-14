import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AdminButton,
  AdminSelect,
  Breadcrumbs,
  DirectoryRow,
  FormFooter,
  SectionHeader,
  ValidationSummary,
} from './adminUi';

describe('admin UI primitives', () => {
  it('renders semantic button variants without sharing the same class token', () => {
    const primary = renderToStaticMarkup(<AdminButton variant="primary">課を保存</AdminButton>);
    const secondary = renderToStaticMarkup(<AdminButton variant="secondary">課を追加</AdminButton>);
    const tertiary = renderToStaticMarkup(<AdminButton variant="tertiary">既存の課を編集する</AdminButton>);
    const danger = renderToStaticMarkup(<AdminButton variant="danger">この課を削除する</AdminButton>);

    expect(primary).toContain('課を保存');
    expect(secondary).toContain('課を追加');
    expect(tertiary).toContain('既存の課を編集する');
    expect(danger).toContain('この課を削除する');
    expect(primary).toContain('adminButtonPrimary');
    expect(secondary).toContain('adminButtonSecondary');
    expect(tertiary).toContain('adminButtonTertiary');
    expect(danger).toContain('adminButtonDanger');
  });

  it('renders a form footer with one primary save action', () => {
    const html = renderToStaticMarkup(<FormFooter onSave={() => undefined} saveLabel="設問を保存" />);

    expect(html.match(/設問を保存/g)).toHaveLength(1);
    expect(html).toContain('adminButtonPrimary');
    expect(html).not.toContain('保存する');
    expect(html).not.toContain('保存して一覧へ戻る');
    expect(html).not.toContain('保存して続けて編集');
  });

  it('renders custom selects without native select markup', () => {
    const html = renderToStaticMarkup(
      <AdminSelect
        ariaLabel="部"
        value="市長室"
        onChange={() => undefined}
        options={[
          { value: '市長室', label: '市長室' },
          { value: '__new_department__', label: '新しい部を作成', intent: 'action' },
        ]}
      />,
    );

    expect(html).toContain('adminSelect');
    expect(html).toContain('aria-haspopup="listbox"');
    expect(html).toContain('市長室');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('<option');
  });

  it('renders section header action separately from the title', () => {
    const html = renderToStaticMarkup(
      <SectionHeader
        title="課データ"
        action={<AdminButton variant="secondary">課を追加</AdminButton>}
      />,
    );

    expect(html).toContain('課データ');
    expect(html).toContain('課を追加');
    expect(html).toContain('sectionHeader');
  });

  it('renders breadcrumbs with clickable ancestors and plain current item', () => {
    const html = renderToStaticMarkup(
      <Breadcrumbs
        items={[
          { label: 'アーキタイプ', onClick: () => undefined },
          { label: '秩序の番人' },
        ]}
      />,
    );

    expect(html).toContain('aria-label="現在位置"');
    expect(html).toContain('<button');
    expect(html).toContain('アーキタイプ');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('秩序の番人');
  });

  it('renders clickable directory rows as full-row buttons', () => {
    const html = renderToStaticMarkup(
      <DirectoryRow
        onClick={() => undefined}
        action={<button type="button" aria-label="秘書課を削除">×</button>}
      >
        <span>秘書課</span>
      </DirectoryRow>,
    );

    expect(html).toContain('<button');
    expect(html).toContain('directoryRowButton');
    expect(html).toContain('directoryRowAction');
    expect(html).toContain('aria-label="秘書課を削除"');
    expect(html).toContain('秘書課');
  });

  it('keeps validation summary hidden until requested', () => {
    const hidden = renderToStaticMarkup(<ValidationSummary show={false} issues={['部を入力してください。']} />);
    const visible = renderToStaticMarkup(<ValidationSummary show issues={['部を入力してください。']} />);

    expect(hidden).toBe('');
    expect(visible).toContain('入力内容を確認してください。');
    expect(visible).toContain('部を入力してください。');
  });
});
