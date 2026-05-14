# Admin Dashboard Design Principles and Design System

Date: 2026-05-14  
Area: `/#/admin` browser-only configuration dashboard  
Source: `2026-05-14-admin-dashboard-ux-review.md`

## Design Principles

### 1. Editing First, Export Last

The admin dashboard is a content-editing workspace. Users should spend most of their time finding records, editing fields, saving changes, and only then writing out `app-config.json`.

Rules:

- Normal editing pages must emphasize the active editing task.
- JSON export belongs to `書き出し確認`.
- The word and visual treatment for export must not compete with local save.

### 2. One View, One Primary Action

Each screen should have one obvious next action. If two blue buttons are visible, the hierarchy has failed.

Rules:

- Editors get one primary action: `保存する`.
- `書き出し確認` gets one primary action: `app-config.jsonを書き出す`.
- List pages may use one secondary action such as `新規作成`.
- Utility and destructive actions never use the primary style.

### 3. Button Appearance Must Encode Meaning

Button style should communicate action type before the user reads the label.

Rules:

- Solid blue means "perform the main action for this view."
- Outlined neutral means "start or open a non-destructive secondary flow."
- Text-style blue means "navigate or do a low-risk supporting action."
- Red means "this can remove or reset data."

### 4. Draft Save and JSON Export Are Different Concepts

The interface must preserve the distinction between saving to the browser draft and exporting the deployable JSON.

Rules:

- `保存する` means "save this editor's changes into the browser draft."
- `app-config.jsonを書き出す` means "download the deployable configuration file."
- Do not call export "save."
- Do not call browser draft autosave "export."

### 5. Navigation and Workspace Must Read As Separate Regions

The sidebar is persistent navigation. The main panel is the current task. Color and layout should make that distinction obvious.

Rules:

- Sidebar uses a muted blue-gray surface.
- Main content uses a white/off-white workspace surface.
- Sidebar typography is quieter than active page headings.
- Do not rely on only a border line to separate regions.

### 6. Progressive Disclosure Over Spreadsheet Density

The dashboard should help users find an item first, then edit it in a focused view.

Rules:

- Directory/list pages show only enough information to identify the record.
- Full editing controls live in editor views.
- Hidden details are acceptable; hidden primary actions are not.
- Rows should look clickable as full rows.

### 7. Validation Is Quiet Until Needed

The system should not make "normal" states feel noisy. Errors become visible when the user tries to save or export.

Rules:

- Do not show success/normal validation badges on ordinary pages unless they affect the next action.
- After a failed save/export, show one validation summary and inline field errors.
- Keep errors visible until corrected or the user leaves the editor.

### 8. Dangerous Actions Are Rare And Separated

Delete, discard, and reset actions should be visually and spatially isolated from normal editing.

Rules:

- Destructive actions live in a danger area or danger menu section.
- Confirmation copy names the exact scope of data affected.
- Danger actions are never colocated directly beside `保存する`.

### 9. Japanese Government Form, Not Generic SaaS

The visual language should be restrained, legible, and official without becoming a raw spreadsheet.

Rules:

- Use clear labels, direct Japanese, and moderate type weights.
- Prefer flat surfaces, strong alignment, and restrained color.
- Use spacing for grouping before adding borders.
- Avoid decorative chips, gradients, floating cards, and playful motion.

## Design Tokens

These tokens should be admin-local, either CSS custom properties in `Admin.module.css` or constants near the admin screen. Names are illustrative but should remain stable once implemented.

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--admin-page-bg` | `#f5f5f2` | Overall app background |
| `--admin-sidebar-bg` | `#e8eef5` | Persistent navigation surface |
| `--admin-sidebar-active-bg` | `#d8e2ee` | Active sidebar row |
| `--admin-content-bg` | `#fbfbf8` | Main workspace background |
| `--admin-panel-bg` | `#ffffff` | Form and list surfaces when needed |
| `--admin-text` | `#111827` | Primary text |
| `--admin-text-muted` | `#52606d` | Supporting text |
| `--admin-border` | `#cbd2da` | Default dividers and field borders |
| `--admin-border-strong` | `#9aa5b1` | Stronger controls and focus-adjacent lines |
| `--admin-primary` | `#2e6db4` | Primary action |
| `--admin-primary-hover` | `#245a98` | Primary hover |
| `--admin-danger` | `#9f1239` | Danger text/border |
| `--admin-danger-bg` | `#fff1f1` | Danger background |
| `--admin-success` | `#2f6b3f` | Success feedback |
| `--admin-warning-bg` | `#fff8df` | Warning feedback |

Color rules:

- Sidebar color is not a brand flourish; it is navigation separation.
- Axis colors from app config may appear in previews and domain controls, but not in global shell controls.
- Red is reserved for destructive actions and validation errors.

### Typography

| Token | Value | Use |
| --- | --- | --- |
| `--admin-font-body` | existing `var(--font)` | All admin UI |
| `--admin-size-xs` | `12px` | Metadata, helper labels |
| `--admin-size-sm` | `13px` | Secondary row text |
| `--admin-size-md` | `15px` | Body and form controls |
| `--admin-size-lg` | `18px` | Section subheads |
| `--admin-size-xl` | `24px` | Active section title |
| `--admin-size-shell-title` | `20px` | Persistent shell title |

Typography rules:

- Active section heading should be visually stronger than persistent shell labels.
- Avoid using very heavy weights on every row; use weight to identify interactive names and headings.
- Japanese labels should remain compact and direct.

### Spacing

Use an 8px-based scale:

| Token | Value |
| --- | --- |
| `--admin-space-1` | `4px` |
| `--admin-space-2` | `8px` |
| `--admin-space-3` | `12px` |
| `--admin-space-4` | `16px` |
| `--admin-space-5` | `24px` |
| `--admin-space-6` | `32px` |
| `--admin-space-7` | `40px` |

Spacing rules:

- Use vertical spacing to group related content before adding borders.
- Editor sections should have a consistent gap.
- Directory rows should have stable vertical rhythm and no layout shift on hover.

### Borders, Radius, and Shadow

| Token | Value | Use |
| --- | --- | --- |
| `--admin-border-width` | `1px` | Inputs, menus, subtle dividers |
| `--admin-radius-none` | `0` | Most admin controls |
| `--admin-radius-sm` | `2px` | Menus and buttons if needed |
| `--admin-shadow-menu` | `0 8px 20px rgb(15 23 42 / 12%)` | Floating utility menu only |

Rules:

- Default to square or near-square controls.
- Do not use rounded decorative cards.
- Shadows are only for overlays/menus, not page sections.

## Component System

### `AdminButton`

Purpose: one button primitive with semantic variants.

Variants:

- `primary`: solid blue, one per current view.
- `secondary`: neutral outline/fill for create/import/open.
- `tertiary`: text-like action for back/navigation/supporting actions.
- `danger`: red treatment for destructive actions.

Sizes:

- `md`: default form/page action.
- `sm`: compact row/menu action.

States:

- Default.
- Hover.
- Focus-visible.
- Disabled.

Rules:

- Do not style buttons by ad hoc class names.
- Do not put primary and danger actions in the same action group.
- Labels must be action verbs, not nouns.

Recommended labels:

- Primary save: `保存する`
- Primary export: `app-config.jsonを書き出す`
- Secondary create: `新規作成`
- Tertiary back: `一覧へ戻る`
- Danger delete: `削除する`

### `PageShell`

Purpose: persistent layout for sidebar navigation and main workspace.

Structure:

- Sidebar with muted background.
- Main workspace with content background.
- Header area that is quieter than the active section title.
- Utility menu separated from primary editing actions.

Rules:

- Sidebar should not scroll independently unless content height requires it.
- Content max width should support form readability, not full-screen spreadsheet density.
- Product/admin title is context, not the main task.

### `SidebarNav`

Purpose: stable navigation across admin sections.

Items:

- `課データ`
- `設問`
- `アーキタイプ`
- `5軸・説明文`
- `書き出し確認`

Rules:

- Active item uses muted fill, not CTA blue.
- Sidebar footer shows draft/readiness quietly.
- Do not put record counts in nav unless they become necessary for orientation.

### Global File Utilities

Decision: remove the global utility menu.

Rules:

- Editing pages should not expose import, draft discard, or reset actions.
- The only file-level action in the normal workflow is export from `書き出し確認`.
- Browser autosave remains internal system behavior, not a visible management task.

### `SectionHeader`

Purpose: identify the current task and expose one page-level action.

Patterns:

- List view: title left, one secondary create action right.
- Edit view: title with tertiary back action.
- Export view: title with primary export action.

Rules:

- Avoid descriptive filler under every header.
- Header title should be the active task, not the product name.

### `DirectoryList` and `DirectoryRow`

Purpose: scan and select records.

Rules:

- Entire row is clickable.
- Hover/focus state is visible.
- Row layout is stable.
- Row text should identify the record quickly.
- Avoid visible per-row edit buttons unless testing shows users miss row clickability.

Per-section row content:

- 課データ: department grouping, row shows 課名.
- 設問: question number, axis label, scenario preview.
- アーキタイプ: type name, short description, code as muted metadata.
- 5軸: axis code, axis label, trait-vs-trait text.

### `EditorLayout`

Purpose: one standard shape for focused editing.

Structure:

1. Tertiary `一覧へ戻る`.
2. Editor title.
3. Optional validation summary.
4. Form sections.
5. `FormFooter`.
6. Optional `DangerZone`.

Rules:

- All editors use explicit local form state.
- All editors use one `保存する`.
- Form sections use spacing-first grouping.
- Domain previews are allowed when they clarify the eventual user-facing output.

### `FormFooter`

Purpose: stable save placement.

Rules:

- Contains one primary `保存する`.
- May contain quiet saved/unsaved feedback.
- Does not contain delete/reset actions.
- Stays visually near the form end.

### `DangerZone`

Purpose: low-frequency destructive record actions.

Rules:

- Appears below the normal form footer.
- Uses red danger styling.
- Includes confirmation before mutation.
- Names the target record when possible.

### `ValidationSummary` and `InlineError`

Purpose: make errors discoverable after attempted save/export.

Rules:

- Hidden before attempted save/export.
- Summary appears near the top of the active editor or export page.
- Inline field error appears next to invalid fields.
- Invalid fields turn red.
- Errors remain visible until fixed or view is left.

## Page Patterns

### List Page Pattern

Use for:

- 課データ
- 設問
- アーキタイプ
- 5軸・説明文

Structure:

1. `SectionHeader`
2. Optional secondary create action
3. `DirectoryList`

Behavior:

- Clicking a row opens edit.
- Search/filter is omitted unless a section becomes too hard to scan.
- No validation-normal status is shown.

### Editor Page Pattern

Use for:

- 課データ create/edit/duplicate
- 設問 create/edit
- アーキタイプ edit
- 5軸 edit

Structure:

1. `一覧へ戻る`
2. Editor title
3. `ValidationSummary` after attempted save
4. Form sections
5. `保存する`
6. Optional `DangerZone`

Behavior:

- Save validates and writes to browser draft.
- Save stays on editor and shows success feedback.
- Back confirms if local edits are unsaved.

### Export Page Pattern

Use for:

- 書き出し確認

Structure:

1. Title
2. Validation summary if blocked
3. Primary export action
4. JSON preview

Behavior:

- Export is disabled while validation blocks it.
- Export success message states that the downloaded file should be named `app-config.json` for distribution.

## Microcopy Rules

### General

- Use direct Japanese.
- Prefer verbs over abstract nouns.
- Avoid explaining implementation details unless the user must act on them.

### Save and Export

Use:

- `保存する`
- `app-config.jsonを書き出す`
- `ブラウザ内の下書きに保存しました。`
- `配布用JSONを書き出しました。`

Avoid:

- `保存して一覧へ戻る`
- `保存して続けて編集`
- `設定を保存`
- `JSON保存`

### Navigation

Use:

- `一覧へ戻る`
- `新規作成`
- `既存の課を編集する`

### Danger

Use target-specific copy:

- `この課を削除する`
- `この設問を削除する`

Confirmations should name the affected object or scope.

## Accessibility Rules

- All clickable rows must be keyboard-focusable.
- Focus-visible styles must be stronger than hover styles.
- Color cannot be the only indicator of validation or active state.
- Inputs must have explicit labels.
- Error summaries should be announced near the top of the active form.
- Minimum click target height should be 36px for buttons and 44px for directory rows.
- Text should not rely on negative letter spacing or viewport-based font sizing.

## Implementation Guidance

### CSS Organization

At the top of `Admin.module.css`, define admin-local tokens:

```css
.page {
  --admin-page-bg: #f5f5f2;
  --admin-sidebar-bg: #e8eef5;
  --admin-sidebar-active-bg: #d8e2ee;
  --admin-content-bg: #fbfbf8;
  --admin-panel-bg: #ffffff;
  --admin-text: #111827;
  --admin-text-muted: #52606d;
  --admin-border: #cbd2da;
  --admin-primary: #2e6db4;
  --admin-primary-hover: #245a98;
  --admin-danger: #9f1239;
  --admin-danger-bg: #fff1f1;
}
```

Rules:

- Prefer token usage over raw color values.
- Remove legacy classes once no longer referenced.
- Keep admin styles local to the admin module.

### React Organization

Keep components admin-local unless another screen needs them.

Recommended order in `Admin.tsx`:

1. Types and constants.
2. Admin-local primitives.
3. Data conversion and validation helpers.
4. Main `Admin` component.
5. Section-specific rendering helpers if the file becomes too large.

Avoid introducing global component abstractions until the admin system stabilizes.

## Acceptance Criteria

- A reviewer can identify the primary action on each admin view within two seconds.
- No editor shows more than one primary button.
- Sidebar and main content are visually distinct at first glance.
- `保存する` and `app-config.jsonを書き出す` are never treated as the same kind of action.
- All editor screens share the same save/back/danger pattern.
- Destructive actions are visually separated from normal form actions.
- Directory rows clearly look clickable.
- Validation appears only after save/export attempt and uses the same pattern everywhere.
