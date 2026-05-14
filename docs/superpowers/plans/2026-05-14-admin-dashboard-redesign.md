# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/#/admin` so nontechnical Japanese users get one clear editing workflow, one save button per editor, a distinct navigation/sidebar region, and a consistent admin-local component system.

**Architecture:** Keep the browser-only JSON/draft architecture unchanged. Extract admin-local UI primitives into a focused module, keep domain editors in `Admin.tsx`, and convert all editor flows to explicit local form save before writing to the browser draft.

**Tech Stack:** React 19, TypeScript, Vite, CSS Modules, Vitest, Playwright smoke scripts.

---

## File Structure

- Create `src/screens/adminUi.tsx`
  - Owns admin-local UI primitives: `AdminButton`, `ActionGroup`, `PageShell`, `SidebarNav`, `SectionHeader`, `DirectoryList`, `DirectoryRow`, `FormFooter`, `DangerZone`, `ValidationSummary`.
  - Global import, draft-discard, and reset utilities are intentionally removed from the visible admin workflow.
- Create `src/screens/adminUi.test.tsx`
  - Verifies button semantics and footer/header rendering with `react-dom/server`.
- Modify `src/screens/Admin.tsx`
  - Uses the new primitives, removes dual-save behavior, moves export primary action to `書き出し確認`, and standardizes explicit save for all editors.
- Modify `src/screens/Admin.module.css`
  - Adds admin design tokens, sidebar/content color separation, semantic button variants, directory row affordance, form footer, validation, and danger-zone styles.
- Modify `src/screens/adminShell.test.ts`
  - Keeps section restore tests and adds a guard that `書き出し確認` remains the export/finalization section.

---

### Task 1: Create Admin UI Primitives

**Files:**
- Create: `src/screens/adminUi.tsx`
- Create: `src/screens/adminUi.test.tsx`
- Modify: `src/screens/Admin.module.css`

- [ ] **Step 1: Write the failing component tests**

Create `src/screens/adminUi.test.tsx`:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  AdminButton,
  DirectoryRow,
  FormFooter,
  SectionHeader,
  ValidationSummary,
} from './adminUi';

describe('admin UI primitives', () => {
  it('renders semantic button variants without sharing the same class token', () => {
    const primary = renderToStaticMarkup(<AdminButton variant="primary">保存する</AdminButton>);
    const secondary = renderToStaticMarkup(<AdminButton variant="secondary">新規作成</AdminButton>);
    const tertiary = renderToStaticMarkup(<AdminButton variant="tertiary">一覧へ戻る</AdminButton>);
    const danger = renderToStaticMarkup(<AdminButton variant="danger">削除する</AdminButton>);

    expect(primary).toContain('保存する');
    expect(secondary).toContain('新規作成');
    expect(tertiary).toContain('一覧へ戻る');
    expect(danger).toContain('削除する');
    expect(primary).toContain('adminButtonPrimary');
    expect(secondary).toContain('adminButtonSecondary');
    expect(tertiary).toContain('adminButtonTertiary');
    expect(danger).toContain('adminButtonDanger');
  });

  it('renders a form footer with one primary save action', () => {
    const html = renderToStaticMarkup(<FormFooter onSave={() => undefined} />);

    expect(html.match(/保存する/g)).toHaveLength(1);
    expect(html).toContain('adminButtonPrimary');
    expect(html).not.toContain('保存して一覧へ戻る');
    expect(html).not.toContain('保存して続けて編集');
  });

  it('renders section header action separately from the title', () => {
    const html = renderToStaticMarkup(
      <SectionHeader
        title="課データ"
        action={<AdminButton variant="secondary">新規作成</AdminButton>}
      />,
    );

    expect(html).toContain('課データ');
    expect(html).toContain('新規作成');
    expect(html).toContain('sectionHeader');
  });

  it('renders clickable directory rows as full-row buttons', () => {
    const html = renderToStaticMarkup(
      <DirectoryRow onClick={() => undefined}>
        <span>秘書課</span>
      </DirectoryRow>,
    );

    expect(html).toContain('<button');
    expect(html).toContain('directoryRowButton');
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
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm test -- src/screens/adminUi.test.tsx
```

Expected: fail because `./adminUi` does not exist.

- [ ] **Step 3: Implement `adminUi.tsx`**

Create `src/screens/adminUi.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactNode, RefObject } from 'react';

import s from './Admin.module.css';
import { ADMIN_SECTIONS, type AdminSection } from './adminShell';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';
type ButtonSize = 'sm' | 'md';

type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonVariant;
  size?: ButtonSize;
};

export function AdminButton({
  variant,
  size = 'md',
  className,
  type = 'button',
  ...props
}: AdminButtonProps) {
  const variantClass = {
    primary: s.adminButtonPrimary,
    secondary: s.adminButtonSecondary,
    tertiary: s.adminButtonTertiary,
    danger: s.adminButtonDanger,
  }[variant];
  const sizeClass = size === 'sm' ? s.adminButtonSm : s.adminButtonMd;
  return (
    <button
      {...props}
      type={type}
      className={[s.adminButton, variantClass, sizeClass, className].filter(Boolean).join(' ')}
    />
  );
}

export function ActionGroup({ children }: { children: ReactNode }) {
  return <div className={s.actionGroup}>{children}</div>;
}

export function PageShell({
  sidebar,
  header,
  children,
}: {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={s.page}>
      <div className={s.adminShell}>
        {sidebar}
        <div className={s.workspace}>
          {header}
          <div className={s.workspaceBody}>{children}</div>
        </div>
      </div>
    </main>
  );
}

export function SidebarNav({
  activeSection,
  dirty,
  validationOk,
  onSelect,
}: {
  activeSection: AdminSection;
  dirty: boolean;
  validationOk: boolean;
  onSelect: (section: AdminSection) => void;
}) {
  return (
    <aside className={s.sidebar}>
      <div className={s.sidebarBrand}>
        <p>横須賀市役所 部署タイプ診断</p>
        <h1>設定項目</h1>
      </div>
      <nav className={s.sidebarNav} aria-label="設定項目">
        {ADMIN_SECTIONS.map(section => (
          <AdminButton
            key={section.id}
            variant="tertiary"
            className={activeSection === section.id ? s.sidebarNavActive : s.sidebarNavButton}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </AdminButton>
        ))}
      </nav>
      <div className={s.sidebarFooter} aria-label="作業状態">
        <div><span>下書き</span><strong>{dirty ? 'あり' : 'なし'}</strong></div>
        <div>
          <span>検証</span>
          <strong className={validationOk ? s.readinessOk : s.readinessError}>
            {validationOk ? '正常' : '要確認'}
          </strong>
        </div>
      </div>
    </aside>
  );
}

export function SectionHeader({
  title,
  action,
}: {
  title: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={s.sectionHeader}>
      <h2>{title}</h2>
      {action && <div className={s.sectionHeaderAction}>{action}</div>}
    </div>
  );
}

export function DirectoryList({ className, children }: { className?: string; children: ReactNode }) {
  return <ol className={[s.directoryList, className].filter(Boolean).join(' ')}>{children}</ol>;
}

export function DirectoryRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <li className={[s.directoryRow, className].filter(Boolean).join(' ')}>
      <button type="button" className={s.directoryRowButton} onClick={onClick}>
        {children}
      </button>
    </li>
  );
}

export function FormFooter({
  onSave,
  savedMessage,
}: {
  onSave: () => void;
  savedMessage?: string;
}) {
  return (
    <div className={s.formFooter}>
      <AdminButton variant="primary" onClick={onSave}>保存する</AdminButton>
      {savedMessage && <p className={s.formFooterMessage}>{savedMessage}</p>}
    </div>
  );
}

export function DangerZone({ children }: { children: ReactNode }) {
  return (
    <section className={s.dangerZone} aria-label="危険な操作">
      {children}
    </section>
  );
}

export function ValidationSummary({
  show,
  issues,
}: {
  show: boolean;
  issues: readonly string[];
}) {
  if (!show) return null;
  return (
    <div className={s.validationSummary}>
      <strong>入力内容を確認してください。</strong>
      <ul>
        {issues.map((issue, index) => <li key={`${issue}-${index}`}>{issue}</li>)}
      </ul>
    </div>
  );
}
```

- [ ] **Step 4: Add CSS tokens and primitive classes**

At the top of `src/screens/Admin.module.css`, update `.page` to define tokens and add primitive classes. Keep existing classes for now; later tasks will remove unused ones.

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
  --admin-border-strong: #9aa5b1;
  --admin-primary: #2e6db4;
  --admin-primary-hover: #245a98;
  --admin-danger: #9f1239;
  --admin-danger-bg: #fff1f1;
  --admin-success: #2f6b3f;
  --admin-warning-bg: #fff8df;
  min-height: 100vh;
  padding: 24px 28px;
  background: var(--admin-page-bg);
  color: var(--admin-text);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.65;
}

.adminButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--admin-border-strong);
  background: #eef1f4;
  color: var(--admin-text);
  cursor: pointer;
  line-height: 1.35;
  font: inherit;
  font-weight: 700;
}

.adminButtonMd {
  min-height: 38px;
  padding: 7px 14px;
}

.adminButtonSm {
  min-height: 32px;
  padding: 5px 10px;
  font-size: 13px;
}

.adminButtonPrimary {
  border-color: #1d4f86;
  background: var(--admin-primary);
  color: #ffffff;
}

.adminButtonPrimary:hover:not(:disabled) {
  background: var(--admin-primary-hover);
}

.adminButtonSecondary {
  border-color: #737d8c;
  background: #eef1f4;
  color: var(--admin-text);
}

.adminButtonSecondary:hover:not(:disabled) {
  background: #e1e6eb;
}

.adminButtonTertiary {
  border-color: transparent;
  background: transparent;
  color: #245a98;
}

.adminButtonTertiary:hover:not(:disabled) {
  background: #eef5ff;
}

.adminButtonDanger {
  border-color: var(--admin-danger);
  background: var(--admin-danger-bg);
  color: #7f1d1d;
}

.adminButtonDanger:hover:not(:disabled) {
  background: #ffe4e6;
}

.adminButton:focus-visible {
  outline: 2px solid var(--admin-primary);
  outline-offset: 2px;
}

.adminButton:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.actionGroup,
.sectionHeaderAction {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.sectionHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.sectionHeader h2 {
  flex: 1;
  margin: 0;
  color: var(--admin-text);
  font-size: 24px;
  line-height: 1.35;
}

.directoryRowButton {
  width: 100%;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: var(--admin-text);
  text-align: left;
  cursor: pointer;
}

.directoryRowButton:hover,
.directoryRowButton:focus-visible {
  background: #f1f5f9;
}

.formFooter {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.formFooterMessage {
  margin: 0;
  color: var(--admin-success);
  font-size: 13px;
}

.validationSummary {
  padding: 12px 14px;
  border: 1px solid #b45353;
  background: var(--admin-danger-bg);
}

.validationSummary ul {
  margin: 8px 0 0;
  padding-left: 22px;
}
```

- [ ] **Step 5: Run primitive tests**

Run:

```bash
npm test -- src/screens/adminUi.test.tsx
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add src/screens/adminUi.tsx src/screens/adminUi.test.tsx src/screens/Admin.module.css
git commit -m "feat: add admin UI primitives"
```

---

### Task 2: Apply Shell, Sidebar, and Export Flow

**Files:**
- Modify: `src/screens/Admin.tsx`
- Modify: `src/screens/Admin.module.css`
- Modify: `src/screens/adminShell.test.ts`

- [ ] **Step 1: Add shell/export test guard**

Append this test to `src/screens/adminShell.test.ts`:

```ts
it('keeps 書き出し確認 as the finalization section', () => {
  expect(ADMIN_SECTIONS.find(section => section.id === 'json')).toEqual({
    id: 'json',
    label: '書き出し確認',
  });
});
```

- [ ] **Step 2: Run test**

Run:

```bash
npm test -- src/screens/adminShell.test.ts
```

Expected: pass if the existing section contract is intact.

- [ ] **Step 3: Import admin primitives and remove local duplicates**

In `src/screens/Admin.tsx`, replace local primitive imports and definitions.

Add import:

```tsx
import {
  AdminButton,
  DangerZone,
  DirectoryList,
  DirectoryRow,
  FormFooter,
  PageShell,
  SectionHeader,
  SidebarNav,
  ValidationSummary,
} from './adminUi';
```

Remove local functions:

- `AdminShell`
- `SidebarNav`
- `UtilityBar`
- `SectionHeader`
- `DirectoryList`
- `BackButton`
- `ValidationBanner`
- `DangerZone`
- `EditorActions`

- [ ] **Step 4: Replace shell usage**

Replace the root return wrapper with `PageShell` and a simplified header:

```tsx
return (
  <PageShell
    sidebar={
      <SidebarNav
        activeSection={activeTab}
        dirty={dirty}
        validationOk={validation.ok}
        onSelect={setActiveTab}
      />
    }
    header={
      <header className={s.workspaceHeader}>
        <div>
          <p className={s.workspaceEyebrow}>横須賀市役所 部署タイプ診断</p>
          <h1 className={s.workspaceTitle}>課適性診断 設定管理</h1>
        </div>
        <span className={`${s.headerStatus} ${s[`notice--${statusMessage.kind}`]}`}>
          {statusMessage.text}
        </span>
      </header>
    }
  >
    {/* existing section branches */}
  </PageShell>
);
```

- [ ] **Step 5: Move export primary action to 書き出し確認 only**

In the `activeTab === 'json'` branch, use:

```tsx
<SectionHeader
  title="書き出し確認"
  action={
    <AdminButton variant="primary" onClick={handleExport} disabled={!validation.ok}>
      app-config.jsonを書き出す
    </AdminButton>
  }
/>
```

Verify there is no `app-config.jsonを書き出す` button in the global header.

- [ ] **Step 6: Update sidebar/content CSS separation**

In `src/screens/Admin.module.css`, update these classes:

```css
.adminShell {
  display: grid;
  grid-template-columns: 244px minmax(0, 1fr);
  gap: 0;
  width: min(1280px, 100%);
  margin: 0 auto;
  align-items: stretch;
  min-height: calc(100vh - 48px);
  background: var(--admin-content-bg);
}

.sidebar {
  position: sticky;
  top: 24px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 48px);
  padding: 24px 18px;
  background: var(--admin-sidebar-bg);
}

.workspace {
  min-width: 0;
  padding: 24px 32px;
  background: var(--admin-content-bg);
}

.workspaceHeader {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 0 0 18px;
  border-bottom: 1px solid var(--admin-border);
}

.workspaceTitle {
  margin: 0;
  color: var(--admin-text);
  font-size: 20px;
  line-height: 1.3;
  letter-spacing: 0;
}

.sidebarNavActive {
  background: var(--admin-sidebar-active-bg);
  color: var(--admin-text);
}
```

- [ ] **Step 7: Run tests and build**

Run:

```bash
npm test -- src/screens/adminShell.test.ts src/screens/adminUi.test.tsx
npm run build
```

Expected: both commands pass.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Admin.tsx src/screens/Admin.module.css src/screens/adminShell.test.ts
git commit -m "feat: clarify admin shell and export flow"
```

---

### Task 3: Replace Dual Save for 課データ and 設問

**Files:**
- Modify: `src/screens/Admin.tsx`
- Modify: `src/screens/Admin.module.css`

- [ ] **Step 1: Add save feedback state**

Inside `Admin`, add:

```tsx
const [divisionSavedMessage, setDivisionSavedMessage] = useState('');
const [questionSavedMessage, setQuestionSavedMessage] = useState('');
```

Clear messages when forms change:

```tsx
function updateDivisionForm<K extends keyof DivisionForm>(key: K, value: DivisionForm[K]): void {
  setDivisionSavedMessage('');
  setDivisionForm(form => ({ ...form, [key]: value }));
}

function updateQuestionForm<K extends keyof QuestionForm>(key: K, value: QuestionForm[K]): void {
  setQuestionSavedMessage('');
  setQuestionForm(form => ({ ...form, [key]: value }));
}
```

- [ ] **Step 2: Change division save to stay on editor**

Replace `saveDivisionForm(returnToList: boolean)` with:

```tsx
function saveDivisionForm(): void {
  if (divisionFormIssues.length > 0) {
    setDivisionSaveAttempted(true);
    setImportStatus({ kind: 'error', text: '課データの入力内容を確認してください。' });
    return;
  }
  const nextDivision = divisionFromForm(divisionForm);
  const nextKey = divisionKey(nextDivision);
  let nextDivisions: ConfigDivision[];

  if (divisionView.mode === 'edit') {
    const index = findDivisionIndex(draft.divisions, divisionView.key);
    if (index < 0) {
      setImportStatus({ kind: 'error', text: '編集対象の課データが見つかりませんでした。' });
      return;
    }
    nextDivisions = draft.divisions.map((division, i) => i === index ? nextDivision : division);
  } else if (divisionView.mode === 'duplicate') {
    const index = findDivisionIndex(draft.divisions, divisionView.key);
    const insertAt = index < 0 ? draft.divisions.length : index + 1;
    nextDivisions = [
      ...draft.divisions.slice(0, insertAt),
      nextDivision,
      ...draft.divisions.slice(insertAt),
    ];
  } else {
    nextDivisions = [...draft.divisions, nextDivision];
  }

  replaceDraft(
    { ...draft, divisions: nextDivisions },
    { kind: 'success', text: `${nextDivision.dept} ${nextDivision.name}をブラウザ内の下書きに保存しました。` },
  );
  setDivisionFormDraft(divisionToForm(nextDivision, [...existingDepts, nextDivision.dept]));
  setDivisionView({ mode: 'edit', key: nextKey });
  setDivisionSavedMessage('ブラウザ内の下書きに保存しました。');
}
```

- [ ] **Step 3: Change question save to stay on editor**

Replace `saveQuestionForm(returnToList: boolean)` with:

```tsx
function saveQuestionForm(): void {
  if (questionFormIssues.length > 0) {
    setQuestionSaveAttempted(true);
    setImportStatus({ kind: 'error', text: '設問の入力内容を確認してください。' });
    return;
  }
  const nextQuestion = questionFromForm(questionForm);
  let nextIndex = draft.questions.length;

  if (questionView.mode === 'edit') {
    nextIndex = questionView.index;
    replaceDraft(
      {
        ...draft,
        questions: draft.questions.map((question, index) => index === questionView.index ? nextQuestion : question),
      },
      { kind: 'success', text: `設問${questionView.index + 1}をブラウザ内の下書きに保存しました。` },
    );
  } else {
    replaceDraft(
      {
        ...draft,
        questions: [...draft.questions, nextQuestion],
      },
      { kind: 'success', text: `設問${draft.questions.length + 1}をブラウザ内の下書きに保存しました。` },
    );
  }

  setQuestionFormDraft(questionToForm(nextQuestion));
  setQuestionView({ mode: 'edit', index: nextIndex });
  setQuestionSavedMessage('ブラウザ内の下書きに保存しました。');
}
```

- [ ] **Step 4: Replace division and question footers**

For 課データ editor, replace `EditorActions` usage with:

```tsx
<FormFooter onSave={saveDivisionForm} savedMessage={divisionSavedMessage} />
{divisionView.mode === 'edit' && currentDivisionIndex >= 0 && (
  <DangerZone>
    <AdminButton
      variant="tertiary"
      onClick={() => {
        if (canLeaveDivisionForm()) openDuplicateDivision(currentDivisionIndex);
      }}
    >
      この課を複製する
    </AdminButton>
    <AdminButton variant="danger" onClick={() => deleteDivision(currentDivisionIndex)}>
      この課を削除する
    </AdminButton>
  </DangerZone>
)}
```

For 設問 editor, replace `EditorActions` usage with:

```tsx
<FormFooter onSave={saveQuestionForm} savedMessage={questionSavedMessage} />
{questionView.mode === 'edit' && (
  <DangerZone>
    <AdminButton variant="danger" onClick={() => deleteQuestion(questionView.index)}>
      この設問を削除する
    </AdminButton>
  </DangerZone>
)}
```

- [ ] **Step 5: Replace validation banners**

For 課データ:

```tsx
<ValidationSummary
  show={showDivisionFormErrors}
  issues={divisionFormIssues.map(issue => issue.message)}
/>
```

Keep the duplicate edit action as an inline button near the 基本情報 fields:

```tsx
{showDivisionFormErrors && divisionDuplicateIssue?.duplicateIndex !== undefined && (
  <AdminButton
    variant="tertiary"
    onClick={() => {
      if (canLeaveDivisionForm()) openEditDivision(divisionDuplicateIssue.duplicateIndex!);
    }}
  >
    既存の課を編集する
  </AdminButton>
)}
```

For 設問:

```tsx
<ValidationSummary
  show={showQuestionFormErrors}
  issues={questionFormIssues.map(issue => issue.message)}
/>
```

- [ ] **Step 6: Run build and grep for removed labels**

Run:

```bash
rg "保存して一覧へ戻る|保存して続けて編集|saveDivisionForm\\(|saveQuestionForm\\(" src/screens/Admin.tsx
npm run build
```

Expected:

- `rg` shows no old Japanese dual-save labels.
- `saveDivisionForm(` and `saveQuestionForm(` only appear as zero-argument function declarations and callbacks.
- Build passes.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Admin.tsx src/screens/Admin.module.css
git commit -m "feat: simplify admin editor save flow"
```

---

### Task 4: Add Explicit Save for アーキタイプ

**Files:**
- Modify: `src/screens/Admin.tsx`

- [ ] **Step 1: Add archetype form state**

Add types near existing form types:

```tsx
type ArchetypeForm = {
  nameLine1: string;
  nameLine2: string;
  desc: string;
};

type ArchetypeFormIssue = {
  field: 'name' | 'desc' | 'nameBreakAt';
  message: string;
};
```

Add state inside `Admin`:

```tsx
const [archetypeForm, setArchetypeForm] = useState<ArchetypeForm>({ nameLine1: '', nameLine2: '', desc: '' });
const [archetypeFormBaseline, setArchetypeFormBaseline] = useState(() => JSON.stringify({ nameLine1: '', nameLine2: '', desc: '' }));
const [archetypeSaveAttempted, setArchetypeSaveAttempted] = useState(false);
const [archetypeSavedMessage, setArchetypeSavedMessage] = useState('');
```

- [ ] **Step 2: Add conversion and validation helpers**

Add helpers near `archetypeNameLines`:

```tsx
function archetypeToForm(type: Archetype): ArchetypeForm {
  const lines = archetypeNameLines(type);
  return {
    nameLine1: lines.line1,
    nameLine2: lines.line2,
    desc: type.desc,
  };
}

function validateArchetypeForm(form: ArchetypeForm): ArchetypeFormIssue[] {
  const issues: ArchetypeFormIssue[] = [];
  const name = `${form.nameLine1}${form.nameLine2}`.trim();
  if (!name) issues.push({ field: 'name', message: '名称を入力してください。' });
  if (!form.desc.trim()) issues.push({ field: 'desc', message: '説明文を入力してください。' });
  if (form.nameLine2 && form.nameLine1.length === 0) {
    issues.push({ field: 'nameBreakAt', message: '2行目を使う場合は名称1行目も入力してください。' });
  }
  return issues;
}

function archetypeFromForm(form: ArchetypeForm): Pick<Archetype, 'name' | 'nameBreakAt' | 'desc'> {
  const nameLine1 = form.nameLine1.trim();
  const nameLine2 = form.nameLine2.trim();
  return {
    name: `${nameLine1}${nameLine2}`,
    nameBreakAt: nameLine2.length > 0 ? nameLine1.length : undefined,
    desc: form.desc.trim(),
  };
}
```

- [ ] **Step 3: Add local form lifecycle**

Add derived values:

```tsx
const archetypeFormIssues = useMemo(() => validateArchetypeForm(archetypeForm), [archetypeForm]);
const archetypeFormIssueFields = useMemo(() => new Set(archetypeFormIssues.map(issue => issue.field)), [archetypeFormIssues]);
const showArchetypeFormErrors = archetypeSaveAttempted && archetypeFormIssues.length > 0;
const archetypeFormDirty = JSON.stringify(archetypeForm) !== archetypeFormBaseline;
```

Add functions:

```tsx
function setArchetypeFormDraft(next: ArchetypeForm): void {
  setArchetypeForm(next);
  setArchetypeFormBaseline(JSON.stringify(next));
  setArchetypeSaveAttempted(false);
  setArchetypeSavedMessage('');
}

function canLeaveArchetypeForm(): boolean {
  if (archetypeView.mode === 'list' || !archetypeFormDirty) return true;
  return window.confirm('保存していない変更があります。移動してもよろしいですか？');
}

function openEditArchetype(code: string): void {
  const type = draft.archetypes[code];
  if (!type) return;
  setArchetypeFormDraft(archetypeToForm(type));
  setArchetypeView({ mode: 'edit', code });
}

function openArchetypeList(): void {
  if (!canLeaveArchetypeForm()) return;
  setArchetypeView({ mode: 'list' });
  setArchetypeSaveAttempted(false);
}

function updateArchetypeForm<K extends keyof ArchetypeForm>(key: K, value: ArchetypeForm[K]): void {
  setArchetypeSavedMessage('');
  setArchetypeForm(form => ({ ...form, [key]: value }));
}

function saveArchetypeForm(): void {
  if (archetypeView.mode !== 'edit') return;
  if (archetypeFormIssues.length > 0) {
    setArchetypeSaveAttempted(true);
    setImportStatus({ kind: 'error', text: 'アーキタイプの入力内容を確認してください。' });
    return;
  }
  const patch = archetypeFromForm(archetypeForm);
  const nextType = { ...draft.archetypes[archetypeView.code], ...patch };
  replaceDraft({
    ...draft,
    archetypes: {
      ...draft.archetypes,
      [archetypeView.code]: nextType,
    },
  }, { kind: 'success', text: `${nextType.name}をブラウザ内の下書きに保存しました。` });
  setArchetypeFormDraft(archetypeToForm(nextType));
  setArchetypeSavedMessage('ブラウザ内の下書きに保存しました。');
}
```

- [ ] **Step 4: Replace immediate archetype draft updates**

In the archetype list row, replace:

```tsx
onClick={() => setArchetypeView({ mode: 'edit', code })}
```

with:

```tsx
onClick={() => openEditArchetype(code)}
```

In archetype edit view:

- Use `archetypeForm` for inputs and preview.
- Replace `updateArchetypeNameLines` and `updateArchetype` calls with `updateArchetypeForm`.
- Replace back action with `openArchetypeList`.
- Add:

```tsx
<ValidationSummary show={showArchetypeFormErrors} issues={archetypeFormIssues.map(issue => issue.message)} />
```

- Add:

```tsx
<FormFooter onSave={saveArchetypeForm} savedMessage={archetypeSavedMessage} />
```

- [ ] **Step 5: Remove unused immediate update helpers**

Remove these functions if no longer referenced:

- `updateArchetype`
- `updateArchetypeNameLines`

Run:

```bash
rg "updateArchetype|updateArchetypeNameLines" src/screens/Admin.tsx
```

Expected: no results.

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Admin.tsx
git commit -m "feat: make archetype editing explicit-save"
```

---

### Task 5: Add Explicit Save for 5軸・説明文

**Files:**
- Modify: `src/screens/Admin.tsx`

- [ ] **Step 1: Add axis form state**

Add type:

```tsx
type AxisForm = {
  axis: Axis;
  descriptions: AxisDescTiers;
};

type AxisFormIssue = {
  field: string;
  message: string;
};
```

Add state:

```tsx
const [axisForm, setAxisForm] = useState<AxisForm>(() => ({
  axis: DEFAULT_RUNTIME_CONFIG.axes.A,
  descriptions: DEFAULT_RUNTIME_CONFIG.axisDescriptions.A,
}));
const [axisFormBaseline, setAxisFormBaseline] = useState(() => JSON.stringify({
  axis: DEFAULT_RUNTIME_CONFIG.axes.A,
  descriptions: DEFAULT_RUNTIME_CONFIG.axisDescriptions.A,
}));
const [axisSaveAttempted, setAxisSaveAttempted] = useState(false);
const [axisSavedMessage, setAxisSavedMessage] = useState('');
```

- [ ] **Step 2: Add axis form helpers**

Add helpers:

```tsx
function axisToForm(axis: Axis, descriptions: AxisDescTiers): AxisForm {
  return {
    axis: { ...axis },
    descriptions: { ...descriptions },
  };
}

function validateAxisForm(form: AxisForm): AxisFormIssue[] {
  const issues: AxisFormIssue[] = [];
  for (const field of AXIS_LABEL_FIELDS) {
    const value = form.axis[field.key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push({ field: `axis.${String(field.key)}`, message: `${field.label}を入力してください。` });
    }
  }
  for (const field of AXIS_COLOR_FIELDS) {
    const value = form.axis[field.key];
    if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      issues.push({ field: `axis.${String(field.key)}`, message: `${field.label}は#RRGGBB形式で入力してください。` });
    }
  }
  for (const field of AXIS_CODE_FIELDS) {
    const value = form.axis[field.key];
    if (typeof value !== 'string' || value.trim().length === 0) {
      issues.push({ field: `axis.${String(field.key)}`, message: `${field.label}を入力してください。` });
    }
  }
  for (const tier of AXIS_DESCRIPTION_TIERS) {
    if (!form.descriptions[tier].trim()) {
      issues.push({ field: `descriptions.${tier}`, message: `${axisDescLabel(form.axis, tier)}の説明文を入力してください。` });
    }
  }
  return issues;
}
```

- [ ] **Step 3: Add lifecycle functions**

Add derived values:

```tsx
const axisFormIssues = useMemo(() => validateAxisForm(axisForm), [axisForm]);
const axisFormIssueFields = useMemo(() => new Set(axisFormIssues.map(issue => issue.field)), [axisFormIssues]);
const showAxisFormErrors = axisSaveAttempted && axisFormIssues.length > 0;
const axisFormDirty = JSON.stringify(axisForm) !== axisFormBaseline;
```

Add functions:

```tsx
function setAxisFormDraft(next: AxisForm): void {
  setAxisForm(next);
  setAxisFormBaseline(JSON.stringify(next));
  setAxisSaveAttempted(false);
  setAxisSavedMessage('');
}

function canLeaveAxisForm(): boolean {
  if (axisView.mode === 'list' || !axisFormDirty) return true;
  return window.confirm('保存していない変更があります。移動してもよろしいですか？');
}

function openEditAxis(axis: AxisKey): void {
  setAxisFormDraft(axisToForm(draft.axes[axis], draft.axisDescriptions[axis]));
  setAxisView({ mode: 'edit', axis });
}

function openAxisList(): void {
  if (!canLeaveAxisForm()) return;
  setAxisView({ mode: 'list' });
  setAxisSaveAttempted(false);
}

function updateAxisForm(patch: Partial<Axis>): void {
  setAxisSavedMessage('');
  setAxisForm(form => ({ ...form, axis: { ...form.axis, ...patch } }));
}

function updateAxisFormDesc(tier: keyof AxisDescTiers, value: string): void {
  setAxisSavedMessage('');
  setAxisForm(form => ({
    ...form,
    descriptions: { ...form.descriptions, [tier]: value },
  }));
}

function saveAxisForm(): void {
  if (axisView.mode !== 'edit') return;
  if (axisFormIssues.length > 0) {
    setAxisSaveAttempted(true);
    setImportStatus({ kind: 'error', text: '5軸・説明文の入力内容を確認してください。' });
    return;
  }
  replaceDraft({
    ...draft,
    axes: {
      ...draft.axes,
      [axisView.axis]: axisForm.axis,
    },
    axisDescriptions: {
      ...draft.axisDescriptions,
      [axisView.axis]: axisForm.descriptions,
    },
  }, { kind: 'success', text: `${axisView.axis} ${axisForm.axis.label}をブラウザ内の下書きに保存しました。` });
  setAxisFormDraft(axisToForm(axisForm.axis, axisForm.descriptions));
  setAxisSavedMessage('ブラウザ内の下書きに保存しました。');
}
```

- [ ] **Step 4: Replace immediate axis draft updates**

In axis list row, replace:

```tsx
onClick={() => setAxisView({ mode: 'edit', axis })}
```

with:

```tsx
onClick={() => openEditAxis(axis)}
```

In axis edit view:

- Use `axisForm.axis` instead of `activeAxis` for editable values and preview.
- Use `axisForm.descriptions` instead of `draft.axisDescriptions[axisView.axis]`.
- Replace `updateAxis` with `updateAxisForm`.
- Replace `updateAxisDesc` with `updateAxisFormDesc`.
- Replace back action with `openAxisList`.
- Add:

```tsx
<ValidationSummary show={showAxisFormErrors} issues={axisFormIssues.map(issue => issue.message)} />
<FormFooter onSave={saveAxisForm} savedMessage={axisSavedMessage} />
```

- [ ] **Step 5: Remove unused immediate update helpers**

Remove these functions if no longer referenced:

- `updateAxis`
- `updateAxisDesc`

Run:

```bash
rg "updateAxis\\(|updateAxisDesc" src/screens/Admin.tsx
```

Expected: no results.

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Admin.tsx
git commit -m "feat: make axis editing explicit-save"
```

---

### Task 6: Standardize Directory Rows and Page Actions

**Files:**
- Modify: `src/screens/Admin.tsx`
- Modify: `src/screens/Admin.module.css`

- [ ] **Step 1: Replace list rows with `DirectoryRow`**

For 課データ rows, replace the row markup with:

```tsx
<li key={`${division.dept}-${division.name}-${index}`} className={s.divisionDirectoryRow}>
  <button type="button" className={s.directoryRowButton} onClick={() => openEditDivision(index)}>
    <span className={s.divisionNameText}>{division.name}</span>
  </button>
</li>
```

For 設問 rows, use:

```tsx
<DirectoryRow key={index} className={s.questionOutlineRow} onClick={() => openEditQuestion(index)}>
  <span className={s.questionNumber}>{index + 1}</span>
  <span className={s.questionText}>
    <span className={s.questionMeta} style={{ color: axis.dark }}>{axis.label}</span>
    <span>{questionPreview(question.scenario)}</span>
  </span>
</DirectoryRow>
```

For アーキタイプ rows, use:

```tsx
<DirectoryRow key={code} className={s.archetypeDirectoryRow} onClick={() => openEditArchetype(code)}>
  <span className={s.archetypeNameText}>{type.name}</span>
  <span className={s.archetypeDescText}>{textPreview(type.desc, 58)}</span>
  <span className={s.archetypeCodeText}>{code}</span>
</DirectoryRow>
```

For 5軸 rows, use:

```tsx
<DirectoryRow key={axis} className={s.axisDirectoryRow} onClick={() => openEditAxis(axis)}>
  <span className={s.axisCode}>{axis}</span>
  <span className={s.axisNameText} style={{ color: item.dark }}>{item.label}</span>
  <span className={s.axisVsText}>{item.minus} <span>vs.</span> {item.plus}</span>
</DirectoryRow>
```

- [ ] **Step 2: Replace create/back/action buttons with `AdminButton`**

Use these exact replacements:

```tsx
<AdminButton variant="secondary" onClick={openCreateDivision}>新規作成</AdminButton>
<AdminButton variant="secondary" onClick={openCreateQuestion}>新規作成</AdminButton>
<AdminButton variant="tertiary" onClick={openDivisionList}>一覧へ戻る</AdminButton>
<AdminButton variant="tertiary" onClick={openQuestionList}>一覧へ戻る</AdminButton>
<AdminButton variant="tertiary" onClick={openArchetypeList}>一覧へ戻る</AdminButton>
<AdminButton variant="tertiary" onClick={openAxisList}>一覧へ戻る</AdminButton>
```

- [ ] **Step 3: Simplify old row/edit CSS**

In `src/screens/Admin.module.css`, remove opacity-based hidden edit button behavior from `.divisionDirectoryRow .tertiaryButton`. Add:

```css
.divisionDirectoryRow .directoryRowButton,
.questionOutlineRow .directoryRowButton,
.archetypeDirectoryRow .directoryRowButton,
.axisDirectoryRow .directoryRowButton {
  display: grid;
  align-items: center;
  gap: 14px;
  padding: 10px 8px;
}

.divisionDirectoryRow .directoryRowButton {
  grid-template-columns: minmax(0, 1fr);
  min-height: 38px;
}

.questionOutlineRow .directoryRowButton {
  grid-template-columns: 28px minmax(0, 1fr);
  min-height: 58px;
}

.archetypeDirectoryRow .directoryRowButton {
  grid-template-columns: minmax(160px, 0.8fr) minmax(0, 1.6fr) auto;
  min-height: 54px;
}

.axisDirectoryRow .directoryRowButton {
  grid-template-columns: 28px minmax(140px, 0.8fr) minmax(220px, 1.4fr);
  min-height: 58px;
}

.divisionNameText {
  font-weight: 700;
  line-height: 1.45;
}
```

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Admin.tsx src/screens/Admin.module.css
git commit -m "feat: standardize admin directory rows"
```

---

### Task 7: Browser Smoke Tests and Final Cleanup

**Files:**
- Modify: `src/screens/Admin.tsx`
- Modify: `src/screens/Admin.module.css`
- Modify: `src/screens/adminUi.test.tsx` if smoke reveals missing primitive coverage

- [ ] **Step 1: Run full unit tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production builds**

Run:

```bash
npm run build
npm run build:single
```

Expected: both pass.

- [ ] **Step 3: Start dev server if needed**

If no dev server is already running at `http://127.0.0.1:5173/`, run:

```bash
npm run dev
```

Expected: Vite prints a local URL. Keep this session running until browser smoke completes.

- [ ] **Step 4: Run Playwright smoke for navigation, save buttons, and export**

Run a Playwright smoke that checks sidebar navigation, one save button per editor,
export only on the finalization page, and no global utility menu.

Expected JSON:

- `navButtons` includes all five sections.
- `divisionSaveCount` is `1`.
- `questionSaveCount` is `1`.
- `oldSaveCount` is `0`.
- `exportCount` is `1`.
- `headerExportCount` is `0`.
- `menuHasUtilities` is `true`.
- `errors` is `[]`.

- [ ] **Step 5: Smoke test all editor save buttons**

Run:

```bash
node -e "const { chromium } = require('@playwright/test'); (async () => { const browser = await chromium.launch({ headless: true }); const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); }); await page.goto('http://127.0.0.1:5173/#/admin', { waitUntil: 'networkidle' }); await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle' }); const results = {}; await page.getByRole('button', { name: 'アーキタイプ' }).click(); await page.locator('[class*=directoryRowButton]').first().click(); results.archetypeSaveCount = await page.getByRole('button', { name: '保存する' }).count(); await page.getByRole('button', { name: '一覧へ戻る' }).click(); await page.getByRole('button', { name: '5軸・説明文' }).click(); await page.locator('[class*=directoryRowButton]').first().click(); results.axisSaveCount = await page.getByRole('button', { name: '保存する' }).count(); console.log(JSON.stringify({ results, errors }, null, 2)); await browser.close(); })().catch(err => { console.error(err); process.exit(1); });"
```

Expected:

- `results.archetypeSaveCount` is `1`.
- `results.axisSaveCount` is `1`.
- `errors` is `[]`.

- [ ] **Step 6: Remove dead CSS and dead local components**

Run:

```bash
rg "primaryButton|secondaryButton|tertiaryButton|dangerButton|EditorActions|ValidationBanner|ViewHeader|BackButton|formActionBar|formPrimaryActions|formRecordActions|tabActive|statusRow|fileBar" src/screens/Admin.tsx src/screens/Admin.module.css
```

Expected:

- No references remain in `src/screens/Admin.tsx`.
- Any matching CSS classes in `src/screens/Admin.module.css` are removed unless referenced by another live selector.

- [ ] **Step 7: Final verification**

Run:

```bash
npm test
npm run build
npm run build:single
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/screens/Admin.tsx src/screens/Admin.module.css src/screens/adminUi.tsx src/screens/adminUi.test.tsx src/screens/adminShell.test.ts
git commit -m "feat: complete admin dashboard redesign"
```

---

## Self-Review Checklist

- Spec coverage:
  - Button semantics: Tasks 1, 3, 6.
  - Sidebar/content color distinction: Task 2.
  - One save button: Tasks 3, 4, 5.
  - Export finalization: Task 2.
  - Explicit save across editors: Tasks 3, 4, 5.
  - Directory row affordance: Task 6.
  - Validation pattern: Tasks 3, 4, 5.
  - Browser smoke: Task 7.
- Placeholder scan: This plan contains no `TBD`, `TODO`, or unspecified implementation steps.
- Type consistency:
  - `AdminButton`, `FormFooter`, `ValidationSummary`, `DirectoryRow`, and `SidebarNav` are defined in Task 1 and used consistently in later tasks.
  - Save function names are zero-argument after Task 3.
  - `ArchetypeForm` and `AxisForm` are local form-state types used only in `Admin.tsx`.
