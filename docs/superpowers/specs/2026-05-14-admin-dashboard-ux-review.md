# Admin Dashboard UX Review and Redesign Proposal

Date: 2026-05-14  
Area: `/#/admin` browser-only configuration dashboard  
Audience: nontechnical Japanese administrative users maintaining `app-config.json`

## Summary

The admin panel is structurally better than the original spreadsheet-style editor, but the current interaction language is still unstable. A user cannot reliably infer whether a button saves local form edits, writes the deployable JSON, opens a utility, creates data, or performs a destructive action.

The next redesign should make the admin panel feel like a focused content-editing workspace:

- Editing data is the primary job.
- Exporting JSON is a finalization step.
- Each editor has one save action.
- Sidebar and content are visually separate regions.
- Buttons have one consistent semantic meaning across the app.

## Review Inputs

This review is based on:

- The current admin implementation in `src/screens/Admin.tsx`.
- The admin styles in `src/screens/Admin.module.css`.
- The admin validation/import/export helpers in `src/config/adminConfig.ts`.
- Independent read-only critiques from a UX reviewer agent and a UI/design-system reviewer agent.
- The current in-browser screenshot of the admin dashboard.

## Current Flow Map

### Global Shell

- User enters `/#/admin`.
- Last visited section is restored from `localStorage`, otherwise default is `課データ`.
- Sidebar contains:
  - `課データ`
  - `設問`
  - `アーキタイプ`
  - `5軸・説明文`
  - `書き出し確認`
- Sidebar footer shows draft and validation state.
- Header currently shows:
  - Product/admin title.
  - Compact save/status text.

### 課データ

- List view groups records by `部`, then shows each `課`.
- Clicking a 課 opens edit mode.
- `新規作成` opens create mode.
- Edit/create/duplicate form includes:
  - Basic information.
  - Five draggable axis sliders.
  - Result description textarea.
  - Two save buttons: `保存して一覧へ戻る`, `保存して続けて編集`.
  - Duplicate/delete actions in edit mode.
- Local form edits are not written to the draft until save.

### 設問

- List view shows question number, axis label, and scenario preview.
- Clicking a row opens edit mode.
- `新規作成` opens create mode.
- Edit/create form includes:
  - Axis and answer-direction settings.
  - Quiz-like scenario editor.
  - Five option inputs.
  - Two save buttons.
  - Delete action in edit mode.
- Local form edits are not written to the draft until save.

### アーキタイプ

- List view shows type name, description preview, and fixed code.
- Clicking a row opens edit mode.
- Edit form includes:
  - Result-preview surface.
  - Name line fields.
  - Description textarea.
- Edits update the draft immediately; there is no explicit save button.

### 5軸・説明文

- List view shows five fixed axes.
- Clicking a row opens edit mode.
- Edit form includes:
  - Axis label and trait names.
  - Color pickers.
  - Description tiers.
  - Code/symbol fields.
- Edits update the draft immediately; there is no explicit save button.

### 書き出し確認

- Shows validation errors if present.
- Shows normalized JSON preview.
- Provides `app-config.jsonを書き出す`.
- Export is disabled when admin validation has blocking errors.

## Findings From UX Review Agent

### High Risk

- Button semantics are inconsistent. Solid blue is used for global export and local saves, while secondary outlined buttons can mean continue editing, open menu, or utility.
- Save model is confusing. Some edits use local form save; some update draft immediately; export writes the deployable file.
- Global export competes with local editing and can read as the main save action.
- Sidebar/content distinction is too weak; the sidebar reads as another content column.

### Medium Risk

- Landing flow lacks a clear "what do I do now?" hierarchy.
- Directory lists are usable but text-heavy.
- Destructive and utility actions are not separated enough by scope or risk.
- Validation timing needs one predictable pattern.

### Recommended UX Fixes

- Define a stable button system.
- Replace dual save buttons with one `保存する`.
- Treat export as finalization, not ordinary saving.
- Give the sidebar a distinct surface color.
- Make every editor follow the same rhythm: back, title, form, one save, danger area.
- Keep validation quiet until save/export attempt, then show a concise banner and inline red fields.

## Findings From UI / Design-System Review Agent

### High Priority

- Button visual treatment does not encode intent reliably.
- Sidebar/content separation is too weak.
- Save flow is overcomplicated.
- Page hierarchy is title-heavy; the current task should dominate over the product title.

### Medium Priority

- Current primitives are useful names, but not yet a true component system.
- Directory click targets are visually ambiguous.
- Status text is over-visible.
- Spacing rhythm is uneven.

### Recommended UI Fixes

- Add admin-local component primitives:
  - `AdminButton`
  - `ActionGroup`
  - `PageShell`
  - `SectionHeader`
  - `FormFooter`
  - `DirectoryRow`
  - `InlineError`
  - `ValidationSummary`
- Give the sidebar a muted institutional blue-gray background.
- Keep content on white/off-white.
- Reserve solid blue for the single most important action in the current view.
- Make create/import secondary, back/navigation tertiary, and destructive actions red and separated.
- Reduce top header prominence.
- Use fewer horizontal rules and more spacing-based grouping.

## Consolidated Problems

### 1. Button Style Does Not Equal Button Meaning

Current button styles communicate emphasis but not stable semantics. A nontechnical user has to read every label carefully because style alone does not tell them whether an action saves, creates, exports, navigates, or destroys data.

### 2. There Are Too Many Save-Like Concepts

The app currently has:

- Browser draft autosave.
- Explicit form save for 課データ and 設問.
- Immediate draft updates for アーキタイプ and 5軸.
- JSON export for distribution.

These are technically distinct, but the UI does not help the user build that mental model.

### 3. Export Is Too Prominent During Editing

Export is a final packaging step, not the normal editing save. Putting a large export button in the global header makes it compete with the active content workflow.

### 4. The Sidebar Reads As Content

The left sidebar is structurally correct, but visually too similar to the page body. Because both areas are text-heavy and pale, the user sees a single large document instead of navigation plus workspace.

### 5. Editor Footers Ask Users To Choose A Workflow

The dual save buttons create unnecessary decision pressure. The user wants to save; choosing whether to remain or return should be separate navigation, not a save variant.

### 6. Some Editors Use A Different Persistence Model

課データ and 設問 require explicit saving. アーキタイプ and 5軸 mutate the draft immediately. This inconsistency is likely invisible to users until something behaves unexpectedly.

### 7. List Rows Need Clearer Click Affordance

The current directory list direction is good, especially for 課データ, but some rows can still read as static text. Hidden edit affordances help reduce clutter but also reduce obviousness.

### 8. Destructive Actions Need Stronger Scope Separation

Deleting a record, discarding the browser draft, and resetting all data have very different blast radii. The current UI does not consistently encode those scopes.

## Proposed Redesign

### 1. Establish A Real Admin Button System

Introduce one admin-local `AdminButton` primitive with strict variants:

- `primary`: one main action for the current view only.
- `secondary`: create/import/open non-destructive utilities.
- `tertiary`: back, cancel, navigation, low-emphasis actions.
- `danger`: delete, discard, reset.

Rules:

- There should be at most one primary button visible in a view.
- Solid blue must not mean both local save and global export on the same page.
- Destructive actions should never share visual treatment with neutral utility actions.

### 2. Replace Dual Save Buttons With One Save Button

Replace:

- `保存して一覧へ戻る`
- `保存して続けて編集`

With:

- `保存する`

Recommended behavior:

- Save updates the browser draft.
- Save keeps the user on the current editor.
- A short success message confirms the save.
- `一覧へ戻る` remains a tertiary navigation action.
- If local form edits are unsaved, `一覧へ戻る` triggers the existing confirmation.

For create/duplicate flows:

- After first successful save, convert the view into edit mode for the saved record.
- The user can then continue editing or return to the list.

### 3. Make Export A Finalization Flow

Recommended default:

- Remove the large global export button from normal editing pages.
- Keep `書き出し確認` in the sidebar.
- On `書き出し確認`, make `app-config.jsonを書き出す` the page primary action.
- Do not include a global utility menu unless a future deployment workflow proves it is needed.

If a global export shortcut is retained:

- It should be visually smaller than editor save buttons.
- It should not use the same primary style as local save.

### 4. Standardize Persistence Across Editors

Recommended default:

- Convert アーキタイプ and 5軸・説明文 to explicit local form save, matching 課データ and 設問.

Expected pattern:

- Opening an editor creates local form state.
- Changing fields updates local form state.
- `保存する` writes to the browser draft.
- Returning with unsaved edits prompts for confirmation.
- Validation errors appear after attempted save.

This is more predictable for nontechnical users than mixed autosave behavior.

### 5. Strengthen Sidebar vs Content Separation

Use color and structure:

- Sidebar background: muted institutional blue-gray, e.g. `#e8eef5`.
- Content background: white/off-white, e.g. `#fbfbf8`.
- Remove reliance on a single vertical border.
- Sidebar active state should use a darker muted fill, not CTA blue.
- Sidebar typography should be quieter than the active page heading.

### 6. Rework Page Hierarchy

Recommended hierarchy:

1. Active section title.
2. Active task action, such as `新規作成` or `保存する`.
3. Content list or form.
4. Product/admin title as persistent shell context.
5. Draft/export/validation status only when relevant.

Specific changes:

- Make the product title smaller in the shell.
- Let section title be the main page heading.
- Remove decorative or redundant status text from ordinary editing pages.
- Keep validation status quiet unless it blocks export or follows an attempted save.

### 7. Make Directory Rows Clearly Clickable

Create a `DirectoryRow` primitive:

- Entire row is clickable.
- Row has visible hover/focus background.
- Text remains restrained and government-form appropriate.
- Do not rely on hidden `編集` buttons as the only affordance.
- Keep row layout consistent across 課データ, 設問, アーキタイプ, and 5軸.

### 8. Separate Danger Areas

Each editor should place destructive actions at the bottom in a low-frequency danger area.

Pattern:

- Main form footer: `保存する`.
- Separate danger area: duplicate/delete if needed.
- Global draft discard/reset utilities are removed from the visible admin workflow.

Confirmation copy should distinguish:

- One record deletion.

## Implementation Plan

### Component System

Refactor the admin-local primitives in `src/screens/Admin.tsx`:

- Add `AdminButton`.
- Replace direct button class usage with variant props.
- Replace `EditorActions` with `FormFooter`.
- Add/standardize `DirectoryRow`.
- Keep domain-specific editors separate; do not over-abstract 課/設問/アーキタイプ/5軸 logic.

### Save Flow

Update editor behavior:

- 課データ: one `保存する`, stay on editor, convert create/duplicate to edit after save.
- 設問: one `保存する`, stay on editor, convert create to edit after save.
- アーキタイプ: introduce local form state and explicit save.
- 5軸・説明文: introduce local form state and explicit save.

### Export Flow

Update shell and JSON confirmation:

- Remove global primary export from the header.
- Make `書き出し確認` own export as page primary.
- Keep import/discard/reset in the utility menu.

### Styling

Update `src/screens/Admin.module.css`:

- Add top-level design tokens for colors, spacing, button variants, and type scale.
- Give sidebar and content distinct backgrounds.
- Restyle buttons through the new semantic variants.
- Remove or stop using legacy tab/header/status styles from earlier iterations.
- Standardize directory rows, form footers, and danger zones.

## Test Plan

### Unit / Helper Tests

- Admin section restore still defaults to `課データ`.
- Button variants map to stable class names or rendered semantics.
- Editor footer renders exactly one primary save button.
- Export action is primary only on `書き出し確認`.

### Browser Smoke Tests

- `/#/admin` shows colored sidebar and defaults to `課データ`.
- Sidebar switches all five sections.
- 課データ edit has exactly one `保存する` button.
- 設問 edit has exactly one `保存する` button.
- アーキタイプ edit has exactly one `保存する` button.
- 5軸 edit has exactly one `保存する` button.
- Saving stays on the editor and shows success feedback.
- `一覧へ戻る` prompts when local edits are unsaved.
- Utility menu exposes JSON import, draft discard, and reset.
- `書き出し確認` shows export as the page primary action.
- Export is disabled when validation blocks it.

### Existing Verification

- `npm test`
- `npm run build`
- `npm run build:single`
- Browser smoke across all admin sections.

## Assumptions

- The admin remains browser-only with no backend or authentication.
- JSON export remains the distribution mechanism.
- The browser draft remains the working copy.
- Nontechnical clarity is more important than minimizing clicks.
- Recommended save behavior is: `保存する` saves and stays on the editor; `一覧へ戻る` handles navigation separately.
