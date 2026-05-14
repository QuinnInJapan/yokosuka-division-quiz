# Admin Dashboard Manual Page Spec

## Summary

Create an in-app Japanese manual page for `/#/admin` that explains how nontechnical users understand and operate the admin dashboard. The manual should be a calm, government-office-style reference page: structured, direct, and visual. It should include a granular table of contents, concept explanations, workflow-by-workflow instructions, and precise live HTML examples with CSS focus outlines on the relevant UI elements.

This is a specification only. Implementation should not begin until this spec is reviewed.

## Audience

- Primary users: Japanese municipal staff who maintain quiz content.
- Technical comfort: low to moderate.
- Expected browser: Microsoft Edge on desktop.
- Expected task context: occasional content updates, not daily system administration.
- Manual readers are nontechnical users; manual maintainers are technical/project maintainers.
- The manual itself is not editable from the admin dashboard.

## Placement

Add a new admin sidebar destination:

- Label: `使い方`
- Required position: bottom of the sidebar, after `書き出し確認`
- Purpose: help users understand the dashboard before editing content.

The manual should live inside the admin workspace rather than opening a separate site. Users should be able to switch from the manual to editing sections using the existing sidebar. The same HTML page should be printable to PDF from the browser.

## Manual Ownership

The manual is source-controlled application content, not user-managed dashboard content.

Requirements:

- Do not add CRUD controls for the manual.
- Do not expose the manual text or screenshots in the admin editor.
- Developers/project maintainers update the manual by changing source files and screenshot assets.
- Nontechnical users only read the manual and use it as operational guidance.

## Page Title And Opening Copy

Title:

`設定管理の使い方`

Opening copy:

`この画面では、診断で使用する課データ、設問、アーキタイプ、5軸の説明文を編集できます。編集内容はブラウザ内の下書きとして保存されます。配布するときは「書き出し確認」から app-config.json を書き出してください。`

Copy rules:

- Keep prose concise.
- Use Japanese UI labels exactly as they appear in the app.
- Avoid technical terms such as `localStorage`, `schema`, `JSON database`, or `runtime`.
- Use `下書き`, `書き出し`, `配布用ファイル` instead.

## Table Of Contents

The manual must include this anchored table of contents near the top:

1. `はじめに`
   - `この管理画面でできること`
   - `下書きと配布用ファイルの違い`
   - `編集から配布までの流れ`
2. `診断データの基本`
   - `課データとは`
   - `部と課名とは`
   - `5軸とは`
   - `スコアとは`
   - `設問とは`
   - `回答5が示す特性とは`
   - `アーキタイプとは`
   - `説明文とは`
3. `画面全体の見方`
   - `左側メニュー`
   - `一覧画面`
   - `編集画面`
   - `番号付き説明の読み方`
   - `パンくず`
   - `下書き・検証表示`
4. `課データを編集する`
   - `課を探す`
   - `課を追加する`
   - `既存の課を編集する`
   - `部と課名を設定する`
   - `5軸の適性を調整する`
   - `説明文を書く`
   - `課を複製する`
   - `課を削除する`
5. `設問を編集する`
   - `設問を探す`
   - `設問を追加する`
   - `設問文を書く`
   - `選択肢を書く`
   - `設問の軸を選ぶ`
   - `回答5が示す特性を選ぶ`
   - `設問を削除する`
6. `アーキタイプを編集する`
   - `アーキタイプを探す`
   - `結果画面のプレビューを見る`
   - `名称を編集する`
   - `説明文を書く`
   - `アーキタイプを削除する`
7. `5軸・説明文を編集する`
   - `軸を選ぶ`
   - `軸名を編集する`
   - `左右の特性を編集する`
   - `色を編集する`
   - `診断説明文を書く`
8. `保存と書き出し`
   - `各編集画面で保存する`
   - `書き出し確認を開く`
   - `入力内容を確認する`
   - `app-config.jsonを書き出す`
   - `配布時のファイル名を確認する`
9. `入力内容に問題がある場合`
   - `赤く表示された項目を直す`
   - `必須項目を入力する`
   - `重複した部・課名を直す`
   - `保存できない場合`
   - `書き出しできない場合`
10. `この使い方を印刷する`
   - `ブラウザからPDFにする`
   - `印刷時の見え方を確認する`

Each table-of-contents item should jump to its section on the same page.

The table of contents should be visually scannable. Recommended structure:

- Top-level items as bold rows.
- Child items as indented text links under each top-level item.
- No collapsible behavior in the first version.
- Do not include sections that explain developer-only implementation details.

## Visual Example System

Prefer live HTML examples over screenshot overlays. A live example is a small static reproduction of the relevant UI, built from HTML/CSS and marked with a precise focus style on the element being explained.

These examples must look and feel like screenshots:

- They must be static and inert.
- Do not render real clickable buttons, links, inputs, selects, sliders, or hoverable rows inside examples.
- Use noninteractive elements styled with the same admin classes where possible.
- Disable pointer behavior for example controls with an explicit static class.
- Do not include hover effects or active interaction states in the examples.
- Number each highlighted element and explain the number in a nearby legend.
- The legend heading must explain the purpose of the highlighted element, not repeat the UI text.
- Examples should show contiguous screen regions, like cropped screenshots.
- Do not compress unrelated parts of a page into one artificial composite.
- If vertical content is omitted, show an explicit omission marker such as `ここで画面を省略` and state what continues below.

Rationale:

- CSS outlines attach to the exact element instead of relying on coordinate math.
- Examples scale and print more reliably than annotated screenshots.
- Focus labels can be made accessible with `aria-label`.
- The examples can reuse the admin dashboard's spacing, typography, button, list, and form language without showing a full noisy screen.
- Static examples avoid teaching users that the manual itself is editable.
- Contiguous examples help users recognize the real screen when they switch back to the editor.

Screenshots may still be used sparingly for broad context, but step-by-step instructions should use live examples where practical.

### Visual Coverage Matrix

Each procedure-oriented TOC item must have either a live HTML example, a simple diagram, or a screenshot when broad context is more useful than precision. Concept-only TOC items may be text-only if visuals would add noise.

| TOC item | Preferred visual | Required focus targets |
|---|---|---|
| `はじめに` → `この管理画面でできること` | Live mini shell | Sidebar, main content area |
| `はじめに` → `下書きと配布用ファイルの違い` | Text only, or small inline process diagram | `保存` → `下書き`, `書き出し` → `配布用ファイル` |
| `はじめに` → `編集から配布までの流れ` | Text only, or small numbered flow diagram | Edit, save, validation, export |
| `診断データの基本` → `課データとは` | Text definition or live 課 row example | 部, 課名, 説明文, 5軸の適性値 |
| `診断データの基本` → `部と課名とは` | Text definition or live 課 row example | 部, 課名, unique pair |
| `診断データの基本` → `5軸とは` | Live axis label example | 軸名, 左側の特性, 右側の特性 |
| `診断データの基本` → `スコアとは` | Live axis bar example | Axis bar, dot, displayed number |
| `診断データの基本` → `設問とは` | Live question form excerpt | 設問文, 選択肢, 軸 selector |
| `診断データの基本` → `回答5が示す特性とは` | Live question settings excerpt | `回答5が示す特性` selector |
| `診断データの基本` → `アーキタイプとは` | Live result preview excerpt | Result preview, name fields, description |
| `診断データの基本` → `説明文とは` | Text definition or live textarea examples | 課の説明文, アーキタイプ説明文, 診断説明文 |
| `画面全体の見方` → `左側メニュー` | Live mini shell | Sidebar nav |
| `画面全体の見方` → `一覧画面` | Live list example | List rows, add button |
| `画面全体の見方` → `編集画面` | Live form excerpt | Breadcrumb, fields, save button |
| `画面全体の見方` → `パンくず` | Live breadcrumb example | Breadcrumb |
| `画面全体の見方` → `下書き・検証表示` | Live sidebar footer excerpt | Sidebar footer |
| `課データを編集する` → `課を探す` | Live 課データ list | 部 grouping, 課 row |
| `課データを編集する` → `課を追加する` | Live 課データ list | `課を追加` |
| `課データを編集する` → `既存の課を編集する` | Live 課 edit excerpt | 部, 課名, 説明文 |
| `課データを編集する` → `部と課名を設定する` | Live 課 edit excerpt | 部 dropdown/text field, 課名 |
| `課データを編集する` → `5軸の適性を調整する` | Live axis bar example | Axis bar/dot |
| `課データを編集する` → `説明文を書く` | Live textarea example | 説明文 textarea |
| `課データを編集する` → `課を複製する` | Live edit footer excerpt | `この課を複製する` |
| `課データを編集する` → `課を削除する` | Static row-delete example | 削除 `×` |
| `設問を編集する` → `設問を探す` | Live 設問 list | Question row |
| `設問を編集する` → `設問を追加する` | Live 設問 list | `設問を追加` |
| `設問を編集する` → `設問文を編集する` | Live question form excerpt | 設問文 textarea |
| `設問を編集する` → `選択肢を編集する` | Live question form excerpt | Five option inputs |
| `設問を編集する` → `設問の軸を選ぶ` | Live question settings excerpt | 軸 selector |
| `設問を編集する` → `回答5が示す特性を選ぶ` | Live question settings excerpt | `回答5が示す特性` selector |
| `設問を編集する` → `設問を削除する` | Static row-delete example | 削除 `×` |
| `アーキタイプを編集する` → `アーキタイプを探す` | Live archetype list | Archetype row |
| `アーキタイプを編集する` → `結果画面のプレビューを見る` | Live result preview excerpt | Result preview |
| `アーキタイプを編集する` → `アーキタイプ名を編集する` | Live archetype form excerpt | 名称 1行目, 名称 2行目 |
| `アーキタイプを編集する` → `説明文を編集する` | Live archetype form excerpt | 説明文 textarea |
| `アーキタイプを編集する` → `アーキタイプを削除する` | Static row-delete example | 削除 `×` |
| `5軸・説明文を編集する` → `軸を選ぶ` | Live axis list | Axis row |
| `5軸・説明文を編集する` → `軸名と左右の特性を編集する` | Live axis form excerpt | 軸名, 左側の特性, 右側の特性 |
| `5軸・説明文を編集する` → `軸名を編集する` | Live axis form excerpt | 軸名 |
| `5軸・説明文を編集する` → `左右の特性を編集する` | Live axis form excerpt | 左側の特性, 右側の特性 |
| `5軸・説明文を編集する` → `色を編集する` | Live color field excerpt | Color pickers |
| `5軸・説明文を編集する` → `診断説明文を編集する` | Live description textarea excerpt | Tier description textareas |
| `保存と書き出し` → `各編集画面で保存する` | Live save button excerpt | Save button, draft explanation |
| `保存と書き出し` → `書き出し確認を開く` | Live sidebar/export excerpt | `書き出し確認` |
| `保存と書き出し` → `入力内容を確認する` | Live export screen excerpt | Validation area, JSON preview |
| `保存と書き出し` → `app-config.jsonを書き出す` | Live export screen excerpt | `app-config.jsonを書き出す` |
| `保存と書き出し` → `配布時のファイル名を確認する` | Text only or export excerpt | Export button or post-export copy |
| `入力内容に問題がある場合` → `赤く表示された項目を直す` | Live invalid field excerpt | Red invalid field |
| `入力内容に問題がある場合` → `必須項目を入力する` | Live invalid field excerpt | Required field |
| `入力内容に問題がある場合` → `重複した部・課名を直す` | Live duplicate-key excerpt | Duplicate warning |
| `入力内容に問題がある場合` → `保存できない場合` | Live validation excerpt | Validation summary |
| `入力内容に問題がある場合` → `書き出しできない場合` | Live export-blocked excerpt | Disabled/export-blocking state |
| `この使い方を印刷する` → `ブラウザからPDFにする` | Text only or print diagram | Browser print command |
| `この使い方を印刷する` → `印刷時の見え方を確認する` | Text only or print diagram | PDF preview checks |

### Focus Outline Style

Manual examples should highlight elements with CSS applied directly to the element:

```css
.manualFocus {
  outline: 2px solid #c62828;
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgb(198 40 40 / 8%);
}
```

Use `aria-label="強調：..."` on focused elements when the visual emphasis needs a screen-reader equivalent.

## Section Requirements

### 1. まず理解すること

Purpose:

Give users the minimum mental model before they begin editing.

Include:

#### この管理画面でできること

Explain that this dashboard edits the content used by the diagnosis:

- 課データ
- 設問
- アーキタイプ
- 5軸・説明文
- 配布用ファイルの書き出し

Suggested copy:

`この管理画面では、診断で使う文章や適性値を編集します。診断そのものを受ける画面ではなく、診断に表示される内容を準備するための画面です。`

#### 下書きと書き出しの違い

Explain browser draft vs deployable/exported file:

- `保存` means the draft inside the browser is updated.
- `書き出し` means creating a distribution file.
- Changes are not distributed until `app-config.json` is written out and placed in the distribution package.

Suggested copy:

`各編集画面で保存した内容は、まずブラウザ内の下書きに保存されます。利用者に配布するには、最後に「書き出し確認」で app-config.json を書き出してください。`

#### 編集から配布までの流れ

Explain the whole sequence:

1. 編集する項目を選ぶ。
2. 内容を修正する。
3. 各画面で保存する。
4. `書き出し確認`で問題がないか確認する。
5. `app-config.jsonを書き出す`。
6. 配布用ファイルとして差し替える。

Display this as a simple numbered process, not a dense paragraph.

### 2. 診断データの考え方

Purpose:

Explain the concepts inside the dashboard. This section is required because the edit screens use terms that are not self-evident to nontechnical users.

Recommended layout:

- Use a compact definition list or two-column table.
- Left column: term.
- Right column: plain-language explanation.
- Include a short example where useful.

#### 課データとは

Definition:

`診断結果でおすすめ候補として表示される課の情報です。部、課名、説明文、5軸の適性値を持ちます。`

Must explain:

- `部 + 課名` is the unique identity of a 課.
- 説明文 appears in the result detail.
- 5軸の適性値 determines how closely a user profile matches that 課.

#### 5軸とは

Definition:

`診断で使う5つのものさしです。各軸には、左側の特性と右側の特性があります。`

Must explain with examples from current data:

- `人との関わり方`: `制度・仕組み` vs. `市民対話`
- `仕事の進め方`: `政策立案` vs. `現場対応`
- `担う役割`: `ルール管理` vs. `市民支援`
- `変化への姿勢`: `革新推進` vs. `安定運営`
- `知識のスタイル`: `専門追求` vs. `幅広対応`

Clarify:

- Axes are not good/bad scales.
- Both sides are valid characteristics.
- The axis labels can be edited in `5軸・説明文`.

#### スコアとは

Definition:

`課データの5軸の適性値です。各軸で、どちらの特性にどの程度近いかを表します。`

Must explain:

- Each axis value is stored internally from `-10` to `+10`.
- In the admin UI, users adjust it by moving the dot on the axis bar.
- `0` means neutral.
- Larger absolute values mean stronger leaning.
- Negative/positive should be described as “left side/right side,” not as bad/good.

Suggested copy:

`点が中央にある場合は中立です。左に動かすほど左側の特性に近く、右に動かすほど右側の特性に近くなります。数字が大きいほど、その傾向が強いことを表します。`

#### 設問とは

Definition:

`利用者が診断で回答する質問です。各設問は、どれか1つの軸に結びついています。`

Must explain:

- 設問文 is the situation shown to the user.
- 選択肢 are the five response choices.
- The answer contributes to one of the five axes.

#### 回答5が示す特性とは

Definition:

`利用者が一番強く同意したときに、どちら側の特性として採点するかを指定する項目です。`

Must explain:

- This replaces the technical “reversed question” idea.
- If `回答5が示す特性` is `市民対話`, strong agreement adds toward that side.
- If it is `制度・仕組み`, strong agreement adds toward the opposite side.

Suggested copy:

`設問によっては、強く同意することが右側の特性を示す場合と、左側の特性を示す場合があります。この項目で、回答5がどちらの特性を表すかを選びます。`

#### アーキタイプとは

Definition:

`診断結果で表示される人物タイプです。5軸の回答傾向の組み合わせによって決まります。`

Must explain:

- There are fixed archetype codes internally.
- Users normally edit name and description, not the code.
- The preview shows how the result card will appear.

Suggested copy:

`アーキタイプは、利用者の回答傾向をわかりやすく伝えるための結果タイプです。管理画面では、名称と説明文を編集できます。`

#### 説明文とは

Definition:

`診断結果や課の詳細で利用者に表示される文章です。`

Must distinguish:

- 課データの説明文: a specific division’s result/detail description.
- アーキタイプの説明文: result type description.
- 5軸の診断説明文: explanation for each axis score tier.

### 3. 画面全体の見方

Purpose:

Explain the major regions of the admin dashboard before describing detailed editing.

Include:

- Sidebar: `課データ`, `設問`, `アーキタイプ`, `5軸・説明文`, `書き出し確認`, `使い方`
- Main content area: selected section appears here
- Breadcrumbs: shown on edit screens; first item returns to the list
- Draft/readiness state in sidebar footer

Screenshot:

- Use `01-overview.png`
- Red boxes around sidebar navigation and main content heading

Suggested copy:

`左側のメニューで編集する項目を選びます。右側には選択した項目の一覧または編集画面が表示されます。編集画面では、上部のパンくずから一覧に戻れます。`

### 4. 課データを編集する

Purpose:

Explain how to add, edit, duplicate, and delete 課 records.

List screen instructions:

1. `課データ`を開く。
2. 既存の課を編集するときは、課名の行をクリックする。
3. 新しい課を作るときは、`課を追加`をクリックする。
4. 課を削除するときは、行にマウスを重ねて赤い`×`をクリックする。

Edit screen instructions:

1. `部`と`課名`を確認する。
2. 新しい部を使う場合は`新しい部を入力する`をクリックする。
3. 5軸の適性は、各バーの点を動かして調整する。
4. `説明文`に結果画面で表示する文章を入力する。
5. `課を保存`をクリックする。

Duplicate instructions:

- Existing edit screen can keep `この課を複製する` as a low-frequency action.
- Manual should describe duplication as optional and secondary.

Screenshots:

- `02-division-list.png`
- `03-division-edit.png`

Callouts:

- `課を追加`
- Org list row
- Hover delete `×`
- Breadcrumb
- 5軸 sliders
- `課を保存`

### 5. 設問を編集する

Purpose:

Explain how to add, edit, and delete questions.

List screen instructions:

1. `設問`を開く。
2. 既存の設問を編集するときは、設問の行をクリックする。
3. 新しい設問を作るときは、`設問を追加`をクリックする。
4. 設問を削除するときは、行にマウスを重ねて赤い`×`をクリックする。

Edit screen instructions:

1. `軸`を選ぶ。
2. `回答5が示す特性`を選ぶ。
3. `設問文`を入力する。
4. 5つの選択肢を入力する。
5. `設問を保存`をクリックする。

Important explanation:

`回答5が示す特性`は、回答者が一番強く同意したときに、どちらの特性として採点するかを指定する項目です。

Screenshots:

- `04-question-list.png`
- `05-question-edit.png`

Callouts:

- `設問を追加`
- Question row
- Hover delete `×`
- Axis selector
- `回答5が示す特性`
- Option inputs
- `設問を保存`

### 6. アーキタイプを編集する

Purpose:

Explain how to edit result type names/descriptions and delete an archetype record.

List screen instructions:

1. `アーキタイプ`を開く。
2. 編集したいアーキタイプの行をクリックする。
3. 削除するときは、行にマウスを重ねて赤い`×`をクリックする。

Edit screen instructions:

1. プレビューで結果画面の見え方を確認する。
2. `名称 1行目`を入力する。
3. 必要に応じて`名称 2行目（任意）`を入力する。
4. `説明文`を入力する。
5. `アーキタイプを保存`をクリックする。

Important warning:

Deleting archetypes can affect result display. If deletion remains supported, the manual should include a note:

`削除したアーキタイプに該当する診断結果が出た場合、代替表示になる可能性があります。通常は削除ではなく、名称と説明文の修正を推奨します。`

Screenshots:

- `06-archetype-list.png`
- `07-archetype-edit.png`

Callouts:

- Archetype row
- Hover delete `×`
- Result preview
- Name fields
- Description field
- `アーキタイプを保存`

### 7. 5軸・説明文を編集する

Purpose:

Explain how to edit axis labels, colors, and description tiers.

List screen instructions:

1. `5軸・説明文`を開く。
2. 編集したい軸の行をクリックする。

Edit screen instructions:

1. プレビューで結果画面の見え方を確認する。
2. `軸名`、`左側の特性`、`右側の特性`を編集する。
3. `色`で基本色、濃色、背景色を選ぶ。
4. `診断説明文`で各段階の説明文を入力する。
5. `軸設定を保存`をクリックする。

Screenshots:

- `08-axis-edit.png`

Callouts:

- Preview area
- Axis label fields
- Color pickers
- Description textareas
- `軸設定を保存`

### 8. app-config.jsonを書き出す

Purpose:

Explain the distribution step clearly.

Instructions:

1. 編集が終わったら`書き出し確認`を開く。
2. 入力内容に問題がないことを確認する。
3. `app-config.jsonを書き出す`をクリックする。
4. 配布時はファイル名を`app-config.json`にする。
5. 既存の配布用ファイルと差し替える。

Screenshot:

- `09-export.png`

Callouts:

- Sidebar `書き出し確認`
- Export button
- Validation/error area
- JSON preview area

Suggested copy:

`この画面で保存した内容は、まずブラウザ内の下書きとして保存されます。実際に配布するには、最後に app-config.json を書き出してください。`

### 9. 入力内容に問題がある場合

Purpose:

Explain validation without overemphasizing error states.

Include:

- If a field is invalid, it turns red.
- Save may be blocked until required fields are filled.
- `書き出し確認` shows issues if export cannot proceed.

Common cases:

- 課データ: `部`、`課名`、`説明文`が空欄
- 課データ: 同じ`部 + 課名`が重複
- 課データ: 5軸の値が未設定
- 設問: 設問文または選択肢が空欄
- アーキタイプ: 名称または説明文が空欄
- 5軸: 色が正しい形式ではない、説明文が空欄

Suggested copy:

`赤く表示された項目を確認し、必要な内容を入力してください。問題が残っている場合は、書き出しボタンを押せません。`

## Visual Design Requirements

- Manual page should feel consistent with the admin dashboard: flat, restrained, Japanese-government-oriented.
- Avoid marketing-style hero sections.
- Use page hierarchy through spacing, headings, and numbered sections.
- Avoid excessive explanatory copy above screenshots.
- Screenshots should be large enough to read on desktop.
- Red boxes should be high contrast but not decorative.
- Cards should only be used for individual manual sections or figure blocks if needed.
- The on-screen HTML should also work as a clean print/PDF layout from Microsoft Edge.

## Print And PDF Requirements

The manual should be designed so that printing the HTML page from Microsoft Edge to PDF produces a usable document. This does not require server-side PDF generation.

Requirements:

- Add print CSS for the manual page.
- Use A4-friendly page sizing and margins.
- Hide navigation chrome that is not useful in a PDF, such as the admin sidebar, if it consumes too much horizontal space.
- Keep the manual title, table of contents, headings, body text, live examples, and focus outlines visible in print.
- Scale live examples to fit the printable page width.
- Avoid page breaks inside live example blocks when possible.
- Keep red focus outlines visible in print.
- Avoid sticky/fixed positioning in print output.
- Use white or near-white print backgrounds, even if the on-screen layout uses sidebar color.
- Include enough adjacent written instruction that a grayscale print is still understandable.

Recommended CSS direction:

```css
@media print {
  @page {
    size: A4;
    margin: 14mm;
  }

  .adminSidebar,
  .manualNonPrintAction {
    display: none;
  }

  .manualPage {
    max-width: none;
    color: #111827;
    background: #ffffff;
  }

  .manualExample {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .manualFocus {
    outline-color: #c62828;
    print-color-adjust: exact;
  }
}
```

## Accessibility Requirements

- Table of contents links must be keyboard accessible.
- Breadcrumb/sidebar navigation must remain unchanged.
- Any screenshots used for broad context must have meaningful `alt` text.
- Focus highlights in live examples must have a screen-reader equivalent when needed.
- Manual should not rely only on visual outlines; each example must have adjacent written instructions.

## Implementation Boundaries

Do not implement these during the spec phase:

- Authentication
- Backend storage
- Direct writing to deployed `app-config.json`
- Video walkthroughs
- Server-side PDF generation
- Admin editing tools for manual content

In scope:

- Browser print-to-PDF support through print-friendly HTML/CSS.

## Acceptance Criteria

- `使い方` appears as the bottom item in the admin sidebar.
- Opening `使い方` shows `設定管理の使い方`.
- The manual is read-only for nontechnical users and has no admin CRUD controls.
- Page includes a granular table of contents with all ten required top-level sections and concept subsections.
- Page explains `下書き`, `書き出し`, `課データ`, `5軸`, `スコア`, `設問`, `回答5が示す特性`, `アーキタイプ`, and `説明文`.
- Each major editing path has step-by-step Japanese instructions.
- Each major editing path includes at least one live example, simple diagram, or screenshot.
- Every procedure-oriented TOC item is mapped to a visual treatment in the visual coverage matrix.
- Any concept-only TOC item without a visual is explicitly marked as text-only in the visual coverage matrix.
- Live examples use CSS focus outlines on the relevant UI areas instead of coordinate-based boxes over screenshots.
- Live examples are static and inert: no real buttons, links, inputs, selects, sliders, row hover behavior, or interactive affordances.
- Highlighted elements use numbered markers, and each number maps to a nearby explanation that states the purpose of the element.
- Examples show contiguous screen regions; any omitted vertical content is explicitly labeled.
- Manual explains that browser save is a draft and distribution requires `app-config.json` export.
- Manual page prints cleanly from Microsoft Edge to PDF with readable text, visible examples, visible red focus outlines, and no clipped sidebar/content.
- Existing editing pages still work.
- `npm test`, `npm run build`, and `npm run build:single` pass after implementation.

## Open Questions

1. Should the manual include a warning that deleting archetypes can affect result display?
2. Should the manual include a visible `印刷する` button, or should users rely on the browser print command?
