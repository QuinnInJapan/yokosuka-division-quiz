import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AdminManual } from './adminManual';

describe('AdminManual', () => {
  it('renders the full manual table of contents for all admin workflows', () => {
    const html = renderToStaticMarkup(<AdminManual />);

    expect(html).toContain('設定管理の使い方');
    expect(html).toContain('目次');
    expect(html).toContain('はじめに');
    expect(html).toContain('診断データの基本');
    expect(html).toContain('画面全体の見方');
    expect(html).toContain('課データを編集する');
    expect(html).toContain('設問を編集する');
    expect(html).toContain('アーキタイプを編集する');
    expect(html).toContain('5軸・説明文を編集する');
    expect(html).toContain('保存と書き出し');
    expect(html).toContain('入力内容に問題がある場合');
    expect(html).toContain('この使い方を印刷する');
    expect(html).toContain('href="#/admin"');
    expect(html).not.toContain('href="#manual-');
    expect(html).toContain('id="manual-divisions-7"');
    expect(html).toContain('id="manual-export-5"');
    expect(html).toContain('下書き');
    expect(html).toContain('保存しても利用者向け画面にはまだ反映されません');
    expect(html).toContain('app-config.json');
  });

  it('uses live highlighted examples instead of coordinate callouts over screenshots', () => {
    const html = renderToStaticMarkup(<AdminManual />);

    expect(html).toContain('manualFocus');
    expect(html).toContain('aria-label="強調1：使い方を開く"');
    expect(html).toContain('aria-label="強調1：新しい課を作る"');
    expect(html).toContain('aria-label="強調1：設問を増やす"');
    expect(html).toContain('aria-label="強調1：編集するアーキタイプを選ぶ"');
    expect(html).toContain('aria-label="強調1：編集する軸を選ぶ"');
    expect(html).toContain('aria-label="強調3：配布用ファイルを書き出す"');
    expect(html).toContain('data-focus-label="1"');
    expect(html).toContain('新しい課を作る');
    expect(html).toContain('編集する課を選ぶ');
    expect(html).toContain('基本情報を確認する');
    expect(html).toContain('途中の入力欄を省略');
    expect(html).toContain('C〜E軸と説明文');
    expect(html).toContain('最後に保存する');
    expect(html).toContain('課を保存');
    expect(html).toContain('新しい部を作成');
    expect(html).not.toContain('新しい部を入力する');
    expect(html).toContain('設問を保存');
    expect(html).toContain('アーキタイプを保存');
    expect(html).toContain('軸設定を保存');
    expect(html).toContain('ここで説明文の一部を省略');
    expect(html).toContain('通常、この確認欄を手で直す必要はありません');
    expect(html).toContain('書き出し前の確認');
    expect(html).not.toContain('data-focus-label="課を追加"');
    expect(html).not.toContain('data-focus-label="課の行"');
    expect(html).not.toContain('manualCallout');
    expect(html).not.toContain('赤枠：');
  });

  it('reuses admin UI styling in manual examples', () => {
    const html = renderToStaticMarkup(<AdminManual />);

    expect(html).toContain('adminButtonSecondary');
    expect(html).toContain('sectionHeader');
    expect(html).toContain('directoryRowButton');
    expect(html).toContain('divisionDirectoryRow');
    expect(html).toContain('questionOutlineRow');
    expect(html).toContain('archetypeDirectoryRow');
    expect(html).toContain('axisDirectoryRow');
  });

  it('keeps manual examples screenshot-like and noninteractive', () => {
    const html = renderToStaticMarkup(<AdminManual />);

    expect(html).not.toContain('<button');
    expect(html).not.toContain('<input');
    expect(html).not.toContain('<select');
    expect(html).not.toContain('<textarea');
    expect(html).toContain('manualStaticControl');
    expect(html).toContain('manualCutMarker');
  });
});
