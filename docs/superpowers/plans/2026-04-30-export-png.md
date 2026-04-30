# A4 PNG Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "結果を画像で保存" button on the Results screen that opens a preview modal showing an A4 portrait poster of the user's quiz result and lets them download it as PNG.

**Architecture:** Pure Canvas2D renderer (no DOM-to-image lib) draws the F2 indigo-masthead poster directly. A React modal wraps a `<canvas>`, calls the renderer once on open, and downloads via `canvas.toBlob` on save. All client-side, offline-safe, single-file-build compatible.

**Tech Stack:** TypeScript, React 19, Canvas2D, Vitest (unit), Playwright (E2E). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-30-export-png-design.md`

---

## File Structure

**Create:**
- `src/lib/exportPng.ts` — pure renderer + helpers
- `src/lib/exportPng.test.ts` — unit tests for pure helpers
- `src/components/ExportModal.tsx` — modal containing canvas + 保存/閉じる
- `src/components/ExportModal.module.css` — modal styling
- `src/components/ExportButton.tsx` — opens the modal
- `src/components/ExportButton.module.css` — button styling matched to RetakeButton
- `tests/e2e/export.spec.ts` — E2E flow

**Modify:**
- `src/components/MatchBrowse.tsx` — add `<ExportButton />` to bottom-actions row
- `src/components/MatchBrowse.module.css` — only if button row needs adjustment

---

## Conventions

- **Existing test pattern:** `vitest` unit tests live next to the file being tested (`*.test.ts`) using `describe`/`it`/`expect` from `vitest`. Run via `npm test` (single run) or `npm run test:watch`.
- **Existing E2E pattern:** Playwright specs live in `tests/e2e/`. Run via `npx playwright test tests/e2e/<file>.spec.ts`.
- **Existing component pattern:** CSS modules (`*.module.css`) co-located, imported as `import s from './X.module.css'`.
- **Color tokens:** Axis colors imported from `src/data/axes.ts` (`AXES[axis].dark`, `.color`, `.tint`). Indigo brand: literal `#1C2340`.

---

## Task 1: Pure helpers — filename, slicing, formatting

Write the small pure utilities the renderer + modal need, fully covered by unit tests, before touching canvas code.

**Files:**
- Create: `src/lib/exportPng.ts`
- Create: `src/lib/exportPng.test.ts`

- [ ] **Step 1: Write failing tests for `sanitizeFilename`**

Create `src/lib/exportPng.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from './exportPng';

describe('sanitizeFilename', () => {
  it('builds yokosuka-quiz-{type}-{date}.png with kana/kanji preserved', () => {
    const date = new Date(2026, 3, 30); // April 30, 2026 local
    expect(sanitizeFilename('街のよろず屋', date)).toBe('yokosuka-quiz-街のよろず屋-2026-04-30.png');
  });
  it('strips path separators and quotes from type name', () => {
    const date = new Date(2026, 0, 5);
    expect(sanitizeFilename('foo/bar"baz', date)).toBe('yokosuka-quiz-foobarbaz-2026-01-05.png');
  });
  it('keeps full-width punctuation that is filename-safe', () => {
    const date = new Date(2026, 0, 5);
    expect(sanitizeFilename('街・人', date)).toBe('yokosuka-quiz-街・人-2026-01-05.png');
  });
});
```

- [ ] **Step 2: Run the test, confirm it fails**

Run: `npm test -- exportPng`
Expected: FAIL — `Cannot find module './exportPng'`.

- [ ] **Step 3: Implement `sanitizeFilename` + `formatDateForFilename`**

Create `src/lib/exportPng.ts`:

```ts
export function formatDateForFilename(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function sanitizeFilename(typeName: string, date: Date): string {
  // Strip characters disallowed on common filesystems and quotes/colons.
  const safe = typeName.replace(/[\\/:*?"<>|\s]+/g, '');
  return `yokosuka-quiz-${safe}-${formatDateForFilename(date)}.png`;
}
```

- [ ] **Step 4: Re-run, confirm pass**

Run: `npm test -- exportPng`
Expected: PASS for the 3 sanitizeFilename specs.

- [ ] **Step 5: Add tests for `formatDateForDisplay`**

Append to `exportPng.test.ts` (extend existing import to include `formatDateForDisplay`):

```ts
import { formatDateForDisplay } from './exportPng';

describe('formatDateForDisplay', () => {
  it('renders YYYY.MM.DD with zero-padding', () => {
    expect(formatDateForDisplay(new Date(2026, 3, 30))).toBe('2026.04.30');
    expect(formatDateForDisplay(new Date(2026, 0, 5))).toBe('2026.01.05');
  });
});
```

- [ ] **Step 6: Implement `formatDateForDisplay`, run tests**

Append to `exportPng.ts`:

```ts
export function formatDateForDisplay(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
}
```

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 7: Add tests for `topNBestFits` / `bottomNWorstFits`**

Append (extend imports to include `topNBestFits`, `bottomNWorstFits`, and `RankedDivision` type):

```ts
import { topNBestFits, bottomNWorstFits } from './exportPng';
import type { RankedDivision } from '../data/types';

const mk = (name: string, fit: number): RankedDivision => ({
  dept: 'X', name, en: '', A: 0, B: 0, C: 0, D: 0, E: 0,
  user: { A: 0, B: 0, C: 0, D: 0, E: 0 },
  fit,
});

describe('topNBestFits / bottomNWorstFits', () => {
  const ranked = [mk('a', 90), mk('b', 80), mk('c', 70), mk('d', 60), mk('e', 50), mk('f', 40), mk('g', 30)];
  it('returns first N with absolute ranks', () => {
    const top = topNBestFits(ranked, 3);
    expect(top.map(x => x.rank)).toEqual([1, 2, 3]);
    expect(top.map(x => x.name)).toEqual(['a', 'b', 'c']);
  });
  it('returns last N preserving original ordering with absolute ranks', () => {
    const bot = bottomNWorstFits(ranked, 3);
    expect(bot.map(x => x.rank)).toEqual([5, 6, 7]);
    expect(bot.map(x => x.name)).toEqual(['e', 'f', 'g']);
  });
  it('clamps when N > list length', () => {
    expect(topNBestFits(ranked.slice(0, 2), 5).length).toBe(2);
  });
});
```

- [ ] **Step 8: Implement slice helpers, run tests**

Append:

```ts
import type { RankedDivision } from '../data/types';

export type RankedRow = {
  rank: number;
  dept: string;
  name: string;
  fit: number;
};

function toRow(d: RankedDivision, rank: number): RankedRow {
  return { rank, dept: d.dept, name: d.name, fit: d.fit };
}

export function topNBestFits(ranked: RankedDivision[], n: number): RankedRow[] {
  return ranked.slice(0, n).map((d, i) => toRow(d, i + 1));
}

export function bottomNWorstFits(ranked: RankedDivision[], n: number): RankedRow[] {
  const start = Math.max(0, ranked.length - n);
  return ranked.slice(start).map((d, i) => toRow(d, start + i + 1));
}
```

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 9: Add tests for `formatPct` and `axisDotPct`**

Append (extend imports):

```ts
import { formatPct, axisDotPct } from './exportPng';

describe('formatPct', () => {
  it('rounds to nearest int and appends %', () => {
    expect(formatPct(86.4)).toBe('86%');
    expect(formatPct(86.6)).toBe('87%');
    expect(formatPct(0)).toBe('0%');
  });
});

describe('axisDotPct', () => {
  it('maps -2..+2 to 0..100', () => {
    expect(axisDotPct(-2)).toBe(0);
    expect(axisDotPct(0)).toBe(50);
    expect(axisDotPct(2)).toBe(100);
  });
  it('clamps out-of-range values', () => {
    expect(axisDotPct(-3)).toBe(0);
    expect(axisDotPct(3)).toBe(100);
  });
});
```

- [ ] **Step 10: Implement, run tests**

Append:

```ts
export function formatPct(p: number): string {
  return `${Math.round(p)}%`;
}

export function axisDotPct(score: number): number {
  const clamped = Math.max(-2, Math.min(2, score));
  return ((clamped + 2) / 4) * 100;
}
```

Run: `npm test -- exportPng`
Expected: ALL PASS.

- [ ] **Step 11: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): pure helpers — filename, slicing, formatting"
```

---

## Task 2: Renderer skeleton — `ExportData` shape, canvas setup, backgrounds

Define the data the renderer accepts and stub `renderExport` that draws the indigo masthead block + white body — nothing more. This proves canvas plumbing works end-to-end before content fills it.

**Files:**
- Modify: `src/lib/exportPng.ts`

- [ ] **Step 1: Append `ExportData` type and renderer constants to `exportPng.ts`**

Append:

```ts
import type { AxisKey } from '../data/types';

export type ExportData = {
  type: { name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: RankedRow[];
  worst: RankedRow[];
  date: Date;
};

// Logical (CSS) dimensions. Final canvas is scaled 2× for ~192 dpi.
export const EXPORT_W = 794;
export const EXPORT_H = 1123;
export const EXPORT_SCALE = 2;

const INDIGO = '#1C2340';
const INDIGO_TINT_SOFT = '#F0F3FF';
const TEXT_GRAY = '#6B7280';
const TEXT_BODY = '#1C2340';
const PAGE_PAD_X = 56;
const MASTHEAD_H = 340;
```

- [ ] **Step 2: Stub `renderExport` and run a smoke check from a test**

Append to `exportPng.ts`:

```ts
export function renderExport(canvas: HTMLCanvasElement, _data: ExportData): void {
  canvas.width = EXPORT_W * EXPORT_SCALE;
  canvas.height = EXPORT_H * EXPORT_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);

  // Background: white body
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

  // Masthead: full-bleed indigo block
  ctx.fillStyle = INDIGO;
  ctx.fillRect(0, 0, EXPORT_W, MASTHEAD_H);
}
```

- [ ] **Step 3: Add a smoke test for renderer dimensions and pixel sampling**

Append to `exportPng.test.ts`:

```ts
import { renderExport, EXPORT_W, EXPORT_H, EXPORT_SCALE } from './exportPng';
import type { ExportData } from './exportPng';

const sampleData: ExportData = {
  type: { name: '街のよろず屋', desc: '市民に寄り添う万能タイプ。' },
  userScores: { A: 1, B: 0.5, C: 1.2, D: 0, E: 0.3 },
  best: [{ rank: 1, dept: '市民部', name: '市民協働課', fit: 86 }],
  worst: [{ rank: 102, dept: '監査', name: '監査委員事務局', fit: 35 }],
  date: new Date(2026, 3, 30),
};

describe('renderExport', () => {
  it('sets canvas to scaled dimensions and fills masthead+body bgs', () => {
    const canvas = document.createElement('canvas');
    renderExport(canvas, sampleData);
    expect(canvas.width).toBe(EXPORT_W * EXPORT_SCALE);
    expect(canvas.height).toBe(EXPORT_H * EXPORT_SCALE);
    const ctx = canvas.getContext('2d')!;
    // Sample masthead (top): expect indigo
    const top = ctx.getImageData(20 * EXPORT_SCALE, 20 * EXPORT_SCALE, 1, 1).data;
    expect(top[0]).toBe(0x1c);
    expect(top[1]).toBe(0x23);
    expect(top[2]).toBe(0x40);
    // Sample body (well below masthead): expect white
    const body = ctx.getImageData(20 * EXPORT_SCALE, 1000 * EXPORT_SCALE, 1, 1).data;
    expect(body[0]).toBe(0xff);
    expect(body[1]).toBe(0xff);
    expect(body[2]).toBe(0xff);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- exportPng`
Expected: PASS. (vitest provides jsdom-canvas via `happy-dom` or `jsdom`. If `getImageData` returns blank in jsdom, see fallback below.)

**If jsdom canvas mocks return 0 for `getImageData`:** wrap the assertions in a runtime check — read the env. The pragmatic fallback:

```ts
const isRealCanvas = ctx.getImageData(0, 0, 1, 1).data.byteLength > 0
  && (ctx.getImageData(0, 0, 1, 1).data[3] !== undefined);
if (isRealCanvas) {
  // ... pixel assertions
}
```

If pixel-sampling is not supported, keep only the `canvas.width`/`canvas.height` assertions and rely on Playwright visual checks in Task 8 for pixel correctness.

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): renderer skeleton — canvas scaling + bg fills"
```

---

## Task 3: Masthead — wordmark, eyebrow, type title, description

Draw the top indigo block content. Includes a `wrapJapanese` helper that handles description wrapping char-by-char.

**Files:**
- Modify: `src/lib/exportPng.ts`
- Modify: `src/lib/exportPng.test.ts`

- [ ] **Step 1: Test for `wrapJapanese`**

Append to `exportPng.test.ts`:

```ts
import { wrapJapanese } from './exportPng';

describe('wrapJapanese', () => {
  it('returns single line when text fits', () => {
    const fakeMeasure = (s: string) => ({ width: s.length * 10 } as TextMetrics);
    const lines = wrapJapanese(fakeMeasure as any, 'あいうえお', 100);
    expect(lines).toEqual(['あいうえお']);
  });
  it('breaks at the char that overflows', () => {
    const fakeMeasure = (s: string) => ({ width: s.length * 10 } as TextMetrics);
    const lines = wrapJapanese(fakeMeasure as any, 'あいうえおかきくけこ', 50);
    expect(lines.length).toBeGreaterThan(1);
    expect(lines.join('')).toBe('あいうえおかきくけこ');
    for (const line of lines) {
      expect(line.length * 10).toBeLessThanOrEqual(50);
    }
  });
});
```

- [ ] **Step 2: Implement `wrapJapanese`**

Append to `exportPng.ts`:

```ts
type Measure = (text: string) => TextMetrics;

export function wrapJapanese(measure: Measure, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const lines: string[] = [];
  let line = '';
  for (const ch of text) {
    const candidate = line + ch;
    if (measure(candidate).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = ch;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}
```

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 3: Add masthead drawing — extract drawMasthead and call from renderExport**

In `exportPng.ts`, add font constant and helpers:

```ts
const FONT_FAMILY = "'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif";

function setFont(ctx: CanvasRenderingContext2D, sizePx: number, weight: number = 400): void {
  ctx.font = `${weight} ${sizePx}px ${FONT_FAMILY}`;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackEm: number,
): void {
  // Char-by-char draw with letter-spacing in em.
  const chars = Array.from(text);
  let cursor = x;
  for (const ch of chars) {
    ctx.fillText(ch, cursor, y);
    const w = ctx.measureText(ch).width;
    cursor += w + trackEm * parseFloat(ctx.font);
  }
}
```

Append `drawMasthead`:

```ts
function drawMasthead(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;

  ctx.fillStyle = '#FFFFFF';

  // Header row: wordmark (left) + date (right)
  setFont(ctx, 10.5, 700);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, 56, 0.3);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(formatDateForDisplay(data.date), EXPORT_W - PAGE_PAD_X, 56);

  // Eyebrow
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  setFont(ctx, 12, 500);
  drawTrackedText(ctx, 'あなたのタイプ', PAGE_PAD_X, 130, 0.15);

  // Title — auto-shrink if needed
  ctx.fillStyle = '#FFFFFF';
  let titleSize = 58;
  const titleText = `「${data.type.name}」型`;
  const titleMaxW = innerW;
  for (const trySize of [58, 52, 46, 42]) {
    setFont(ctx, trySize, 800);
    if (ctx.measureText(titleText).width <= titleMaxW) {
      titleSize = trySize;
      break;
    }
  }
  setFont(ctx, titleSize, 800);
  ctx.fillText(titleText, PAGE_PAD_X, 130 + 16 + titleSize);

  // Description — wrap
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  setFont(ctx, 13, 400);
  const descMaxW = innerW * 0.75;
  const measure: Measure = (s: string) => ctx.measureText(s);
  const lines = wrapJapanese(measure, data.type.desc, descMaxW);
  let descY = 130 + 16 + titleSize + 28;
  const lineHeight = 13 * 1.85;
  for (const line of lines) {
    ctx.fillText(line, PAGE_PAD_X, descY);
    descY += lineHeight;
  }
}
```

Update `renderExport` to call:

```ts
export function renderExport(canvas: HTMLCanvasElement, data: ExportData): void {
  canvas.width = EXPORT_W * EXPORT_SCALE;
  canvas.height = EXPORT_H * EXPORT_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.setTransform(EXPORT_SCALE, 0, 0, EXPORT_SCALE, 0, 0);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);
  ctx.fillStyle = INDIGO;
  ctx.fillRect(0, 0, EXPORT_W, MASTHEAD_H);

  drawMasthead(ctx, data);
}
```

- [ ] **Step 4: Run tests**

Run: `npm test -- exportPng`
Expected: PASS — earlier tests still pass; no new assertions on visual content (covered by Playwright visual check in Task 9).

- [ ] **Step 5: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): masthead — wordmark, type title, description"
```

---

## Task 4: Profile bars

Draw 5 axis bars in the white body. Each row: axis label (left), bar (middle), pole anchors below.

**Files:**
- Modify: `src/lib/exportPng.ts`

- [ ] **Step 1: Add profile-bars drawing function**

Append to `exportPng.ts`:

```ts
import { AXES } from '../data/axes';
import { AX } from '../data/types';

const PROFILE_TOP = MASTHEAD_H + 36;
const PROFILE_LABEL_COL = 110;
const PROFILE_ROW_H = 44;

function drawHairline(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  color: string,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + 0.5);
  ctx.lineTo(x + w, y + 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  trackColor: string,
  dotColor: string,
  pct: number,
): void {
  const barH = 6;
  // Track
  ctx.fillStyle = trackColor;
  const r = barH / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r, y + barH);
  ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  // Dot
  const dotX = x + (pct / 100) * w;
  const dotY = y + barH / 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = dotColor;
  ctx.stroke();
}

function drawProfile(ctx: CanvasRenderingContext2D, data: ExportData): void {
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  // Section eyebrow + hairline
  ctx.fillStyle = 'rgba(28,35,64,0.7)';
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, 'プロファイル', PAGE_PAD_X, PROFILE_TOP, 0.28);
  drawHairline(ctx, PAGE_PAD_X, PROFILE_TOP + 8, EXPORT_W - PAGE_PAD_X * 2, INDIGO, 0.18);

  let y = PROFILE_TOP + 36;
  const barX = PAGE_PAD_X + PROFILE_LABEL_COL + 6;
  const barW = EXPORT_W - PAGE_PAD_X * 2 - PROFILE_LABEL_COL - 6;

  for (const ax of AX) {
    const a = AXES[ax];
    const score = data.userScores[ax];
    const isPlus = score >= 0;

    // Axis label
    ctx.fillStyle = a.dark;
    setFont(ctx, 10.5, 600);
    ctx.fillText(a.label, PAGE_PAD_X, y + 4);

    // Bar
    drawBar(ctx, barX, y, barW, a.tint, a.dark, axisDotPct(score));

    // Pole anchors below bar
    setFont(ctx, 10.5, 400);
    ctx.fillStyle = isPlus ? TEXT_GRAY : a.dark;
    ctx.textAlign = 'left';
    ctx.fillText(a.minus, barX, y + 22);
    ctx.fillStyle = isPlus ? a.dark : TEXT_GRAY;
    ctx.textAlign = 'right';
    ctx.fillText(a.plus, barX + barW, y + 22);
    ctx.textAlign = 'left';

    y += PROFILE_ROW_H;
  }
}
```

Update `renderExport` to call after `drawMasthead`:

```ts
  drawMasthead(ctx, data);
  drawProfile(ctx, data);
```

- [ ] **Step 2: Run tests**

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportPng.ts
git commit -m "feat(export): profile bars — axis labels + tracks + pole anchors"
```

---

## Task 5: Top-5 best fits + Bottom-3 worst fits

Two list sections sharing a row renderer.

**Files:**
- Modify: `src/lib/exportPng.ts`

- [ ] **Step 1: Add list-row + section drawing**

Append:

```ts
const FITS_TOP = PROFILE_TOP + 36 + 5 * PROFILE_ROW_H + 24; // ~ MASTHEAD_H + 36 + 36 + 220 + 24

const AXIS_C_GREEN = AXES.C.dark; // #1E7345
const AXIS_A_RED = AXES.A.dark;   // #C0392B

function truncateToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(text.slice(0, mid) + '…').width <= maxWidth) lo = mid;
    else hi = mid - 1;
  }
  return text.slice(0, lo) + '…';
}

function drawListSection(
  ctx: CanvasRenderingContext2D,
  topY: number,
  eyebrow: string,
  accentColor: string,
  rows: RankedRow[],
): number {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Eyebrow + hairline
  ctx.fillStyle = accentColor;
  setFont(ctx, 11, 700);
  drawTrackedText(ctx, eyebrow, PAGE_PAD_X, topY, 0.28);
  drawHairline(ctx, PAGE_PAD_X, topY + 8, innerW, accentColor, 0.3);

  let y = topY + 32;
  const rowHeight = 26;
  const rankColW = 32;
  const fitColW = 60;
  const nameStartX = PAGE_PAD_X + rankColW;
  const fitX = EXPORT_W - PAGE_PAD_X;
  const nameMaxW = innerW - rankColW - fitColW - 8;

  for (const row of rows) {
    // Rank
    ctx.fillStyle = TEXT_GRAY;
    setFont(ctx, 10, 400);
    ctx.textAlign = 'left';
    ctx.fillText(String(row.rank).padStart(2, '0'), PAGE_PAD_X, y);

    // Name (indigo) + dept (gray) inline
    ctx.fillStyle = TEXT_BODY;
    setFont(ctx, 13, 500);
    const truncatedName = truncateToWidth(ctx, row.name, nameMaxW * 0.6);
    ctx.fillText(truncatedName, nameStartX, y);
    const nameWidth = ctx.measureText(truncatedName).width;

    ctx.fillStyle = TEXT_GRAY;
    setFont(ctx, 10, 400);
    ctx.fillText(row.dept, nameStartX + nameWidth + 10, y);

    // Fit %, right-aligned
    ctx.fillStyle = accentColor;
    setFont(ctx, 13, 700);
    ctx.textAlign = 'right';
    ctx.fillText(formatPct(row.fit), fitX, y);

    y += rowHeight;
  }
  ctx.textAlign = 'left';
  return y;
}
```

Update `renderExport` to call list sections after profile:

```ts
  drawMasthead(ctx, data);
  drawProfile(ctx, data);

  const bestEndY = drawListSection(
    ctx,
    FITS_TOP,
    '相性の高い課 — 上位5',
    AXIS_C_GREEN,
    data.best,
  );
  drawListSection(
    ctx,
    bestEndY + 16,
    '相性の低い課 — 下位3',
    AXIS_A_RED,
    data.worst,
  );
```

- [ ] **Step 2: Run tests**

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportPng.ts
git commit -m "feat(export): top-5 + bottom-3 fit list sections"
```

---

## Task 6: Footer + QR placeholder

Wordmark + date + 80×80 QR placeholder anchored bottom.

**Files:**
- Modify: `src/lib/exportPng.ts`

- [ ] **Step 1: Add `drawQrPlaceholder` and `drawFooter`**

Append:

```ts
function drawQrPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void {
  const r = 8;
  // Outer rounded rect
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = INDIGO;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + size - r, y);
  ctx.quadraticCurveTo(x + size, y, x + size, y + r);
  ctx.lineTo(x + size, y + size - r);
  ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
  ctx.lineTo(x + r, y + size);
  ctx.quadraticCurveTo(x, y + size, x, y + size - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Three corner finder marks
  const finderSize = 18;
  const finderInset = 8;
  ctx.fillStyle = INDIGO;
  for (const [fx, fy] of [
    [x + finderInset, y + finderInset],
    [x + size - finderInset - finderSize, y + finderInset],
    [x + finderInset, y + size - finderInset - finderSize],
  ]) {
    ctx.fillRect(fx, fy, finderSize, finderSize);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(fx + 4, fy + 4, finderSize - 8, finderSize - 8);
    ctx.fillStyle = INDIGO;
    ctx.fillRect(fx + 7, fy + 7, finderSize - 14, finderSize - 14);
  }

  // 6×6 dot grid in the lower-right body
  const gridStartX = x + 32;
  const gridStartY = y + 32;
  const cell = (size - 40) / 6;
  // Deterministic pattern (alternating-ish)
  const pattern = [
    1, 0, 1, 1, 0, 1,
    0, 1, 0, 0, 1, 0,
    1, 1, 1, 0, 1, 0,
    0, 0, 1, 1, 0, 1,
    1, 0, 0, 1, 1, 0,
    0, 1, 1, 0, 0, 1,
  ];
  ctx.fillStyle = INDIGO;
  for (let i = 0; i < pattern.length; i++) {
    if (!pattern[i]) continue;
    const col = i % 6;
    const row = Math.floor(i / 6);
    if (col >= 4 && row <= 1) continue; // avoid colliding with top-right finder
    if (col <= 1 && row >= 4) continue; // avoid bottom-left finder
    ctx.fillRect(gridStartX + col * cell, gridStartY + row * cell, cell - 2, cell - 2);
  }
}

function drawFooter(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const footerTop = EXPORT_H - 48 - 80;
  // Hairline above
  drawHairline(ctx, PAGE_PAD_X, footerTop, EXPORT_W - PAGE_PAD_X * 2, INDIGO, 0.15);

  // Left: wordmark + date
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INDIGO;
  setFont(ctx, 10, 700);
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, footerTop + 28, 0.25);
  ctx.fillStyle = TEXT_GRAY;
  setFont(ctx, 10, 400);
  ctx.fillText(formatDateForDisplay(data.date), PAGE_PAD_X, footerTop + 50);

  // Right: 80×80 QR
  drawQrPlaceholder(ctx, EXPORT_W - PAGE_PAD_X - 80, footerTop, 80);
}
```

Update `renderExport`:

```ts
  drawListSection(
    ctx,
    bestEndY + 16,
    '相性の低い課 — 下位3',
    AXIS_A_RED,
    data.worst,
  );

  drawFooter(ctx, data);
```

- [ ] **Step 2: Run tests**

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportPng.ts
git commit -m "feat(export): footer + QR placeholder"
```

---

## Task 7: ExportData factory from app state

A small helper that takes `Derived` + a `Date` and produces the renderer's `ExportData`. Lets the modal stay thin.

**Files:**
- Modify: `src/lib/exportPng.ts`
- Modify: `src/lib/exportPng.test.ts`

- [ ] **Step 1: Test for `buildExportData`**

Append to `exportPng.test.ts` (extend imports — `RankedDivision` is already imported from earlier):

```ts
import { buildExportData } from './exportPng';

describe('buildExportData', () => {
  it('packages type, scores, top5, bottom3, date', () => {
    const ranked: RankedDivision[] = [];
    for (let i = 0; i < 102; i++) {
      ranked.push({
        dept: 'D', name: `課${i}`, en: '',
        A: 0, B: 0, C: 0, D: 0, E: 0,
        user: { A: 0, B: 0, C: 0, D: 0, E: 0 },
        fit: 100 - i,
      } as RankedDivision);
    }
    const date = new Date(2026, 3, 30);
    const data = buildExportData(
      { code: 'DASCG', name: '街のよろず屋', desc: '...' },
      { A: 1, B: 0, C: 1, D: 0, E: 0 },
      ranked,
      date,
    );
    expect(data.type.name).toBe('街のよろず屋');
    expect(data.best.map(r => r.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(data.worst.map(r => r.rank)).toEqual([100, 101, 102]);
    expect(data.date).toBe(date);
  });
});
```

- [ ] **Step 2: Implement `buildExportData`**

Append to `exportPng.ts` (extend the existing `data/types` import to add `ResolvedArchetype` — `RankedDivision` is already imported from Task 1):

```ts
import type { ResolvedArchetype } from '../data/types';

export const BEST_COUNT = 5;
export const WORST_COUNT = 3;

export function buildExportData(
  type: ResolvedArchetype,
  userScores: Record<AxisKey, number>,
  ranked: RankedDivision[],
  date: Date,
): ExportData {
  return {
    type: { name: type.name, desc: type.desc },
    userScores,
    best: topNBestFits(ranked, BEST_COUNT),
    worst: bottomNWorstFits(ranked, WORST_COUNT),
    date,
  };
}
```

Run: `npm test -- exportPng`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): buildExportData factory"
```

---

## Task 8: ExportModal component

Modal containing the canvas + 保存 + 閉じる buttons. Renders synchronously on open. Focus trap + ESC + overlay click close.

**Files:**
- Create: `src/components/ExportModal.tsx`
- Create: `src/components/ExportModal.module.css`

- [ ] **Step 1: Create the CSS module**

`src/components/ExportModal.module.css`:

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(28, 35, 64, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: var(--sp-md);
  animation: fade .15s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .overlay { animation: none; }
}
@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.panel {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 20px 80px rgba(0,0,0,0.25);
  padding: var(--sp-lg);
  max-width: 620px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  margin: 0 0 var(--sp-sm);
  color: var(--hall-indigo);
}

.copy {
  font-size: var(--fs-sm);
  color: var(--text-sec);
  margin: 0 0 var(--sp-md);
}

.canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 794 / 1123;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
}

.actions {
  display: flex;
  gap: var(--sp-sm);
  justify-content: flex-end;
  margin-top: var(--sp-md);
}

.btnPrimary,
.btnSecondary {
  padding: 12px 20px;
  border-radius: 10px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  font-family: inherit;
  cursor: pointer;
  border: 2px solid var(--hall-indigo);
  transition: background .15s ease-out, color .15s ease-out;
}
.btnPrimary {
  background: var(--hall-indigo);
  color: #fff;
}
.btnPrimary:hover { background: var(--hall-indigo-hover); border-color: var(--hall-indigo-hover); }
.btnSecondary {
  background: transparent;
  color: var(--hall-indigo);
}
.btnSecondary:hover { background: var(--hover-wash); }
.btnPrimary:focus-visible,
.btnSecondary:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Create the modal component**

`src/components/ExportModal.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { useDerived } from '../state/hooks';
import { buildExportData, renderExport, sanitizeFilename } from '../lib/exportPng';
import s from './ExportModal.module.css';

export function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const { type, userScores, results } = useDerived();

  // Render on open
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = buildExportData(type, userScores, results, new Date());
    const draw = () => renderExport(canvas, data);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(draw).catch(draw);
    } else {
      draw();
    }
  }, [open, type, userScores, results]);

  // Focus + ESC
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(type.name, new Date());
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={s.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      data-testid="export-modal"
    >
      <div ref={panelRef} className={s.panel}>
        <h2 id="export-modal-title" className={s.title}>結果を画像で保存</h2>
        <p className={s.copy}>画像を保存して同僚に共有できます。</p>
        <canvas ref={canvasRef} className={s.canvas} data-testid="export-canvas" />
        <div className={s.actions}>
          <button
            ref={closeBtnRef}
            type="button"
            className={s.btnSecondary}
            onClick={onClose}
            data-testid="export-close"
          >
            閉じる
          </button>
          <button
            type="button"
            className={s.btnPrimary}
            onClick={handleSave}
            data-testid="export-save"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke check — typecheck and unit tests still green**

Run: `npm run lint && npm test`
Expected: no new errors. (No tests for the modal — covered by E2E in Task 10.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ExportModal.tsx src/components/ExportModal.module.css
git commit -m "feat(export): ExportModal — canvas preview + save + close"
```

---

## Task 9: ExportButton + integrate into MatchBrowse

Button next to RetakeButton. Opens the modal.

**Files:**
- Create: `src/components/ExportButton.tsx`
- Create: `src/components/ExportButton.module.css`
- Modify: `src/components/MatchBrowse.tsx`

- [ ] **Step 1: Create the button styles**

`src/components/ExportButton.module.css`:

```css
.btn {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--hall-indigo);
  border-radius: 12px;
  font-size: 14px;
  font-weight: var(--fw-bold);
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  transition: background .15s ease-out, color .15s ease-out;
  background: var(--hall-indigo);
  color: #fff;
}
.btn:hover { background: var(--hall-indigo-hover); border-color: var(--hall-indigo-hover); }
.btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Create the button component**

`src/components/ExportButton.tsx`:

```tsx
import { useState } from 'react';
import { ExportModal } from './ExportModal';
import s from './ExportButton.module.css';

export function ExportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={s.btn}
        onClick={() => setOpen(true)}
        data-testid="export-button"
      >
        結果を画像で保存
      </button>
      <ExportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 3: Add to MatchBrowse**

Modify `src/components/MatchBrowse.tsx`:

```tsx
import { useStore, useDerived } from '../state/hooks';
import { MatchList } from './MatchList';
import { MatchDetail } from './MatchDetail';
import { RetakeButton } from './RetakeButton';
import { ExportButton } from './ExportButton';
import s from './MatchBrowse.module.css';

export function MatchBrowse() {
  const { state } = useStore();
  const { results } = useDerived();
  const selected = results[state.sel];

  return (
    <div className={`${s['match-section']} section-gap`}>
      <div className={s['match-section-title']}>あなたに合う課</div>
      <div className={s['match-section-sub']}>
        5つの軸のプロファイルを比較して相性を算出しています
      </div>
      <div className={s['match-browse']}>
        <MatchList items={results} />
        <div className={s['detail-col']}>
          <MatchDetail division={selected} />
        </div>
      </div>
      <div className={s['bottom-actions']}>
        <ExportButton />
        <RetakeButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run lint + unit tests**

Run: `npm run lint && npm test`
Expected: PASS.

- [ ] **Step 5: Manual smoke test in dev**

Run: `npm run dev` and open the app, complete the quiz, click `結果を画像で保存`. Confirm:
- modal opens, canvas renders the poster
- ESC closes
- click on overlay closes
- 保存 downloads a PNG with filename like `yokosuka-quiz-{type-name}-2026-MM-DD.png`

If anything looks wrong visually, iterate within Task 3–6 sections (do not introduce new tasks).

- [ ] **Step 6: Commit**

```bash
git add src/components/ExportButton.tsx src/components/ExportButton.module.css src/components/MatchBrowse.tsx
git commit -m "feat(export): ExportButton wired into MatchBrowse bottom actions"
```

---

## Task 10: E2E test — open modal, verify canvas, trigger download

Playwright spec that drives a full quiz to completion, then exercises the export flow.

**Files:**
- Create: `tests/e2e/export.spec.ts`

- [ ] **Step 1: Create the spec**

`tests/e2e/export.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

async function completeQuiz(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // 20 questions — pick option 3 (neutral) for each.
  for (let i = 0; i < 20; i++) {
    const neutral = page.getByRole('button', { name: /^3\b/ }).first();
    await neutral.click();
  }
}

test('export modal: opens, shows canvas, saves PNG', async ({ page }) => {
  await completeQuiz(page);

  const exportBtn = page.getByTestId('export-button');
  await expect(exportBtn).toBeVisible();
  await exportBtn.click();

  const modal = page.getByTestId('export-modal');
  await expect(modal).toBeVisible();

  const canvas = page.getByTestId('export-canvas');
  await expect(canvas).toBeVisible();
  const dims = await canvas.evaluate((el: HTMLCanvasElement) => ({ w: el.width, h: el.height }));
  expect(dims.w).toBe(794 * 2);
  expect(dims.h).toBe(1123 * 2);

  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('export-save').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^yokosuka-quiz-.+-\d{4}-\d{2}-\d{2}\.png$/);
});

test('export modal: ESC closes', async ({ page }) => {
  await completeQuiz(page);
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-modal')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('export-modal')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the spec**

Run: `npx playwright test tests/e2e/export.spec.ts`
Expected: BOTH PASS.

If `completeQuiz` step doesn't find the neutral button — open `src/screens/Quiz.tsx` to confirm option button labels and adapt the selector. The 5 quiz options are numbered 1–5 (see commit `4bc75b2`); `getByRole('button', { name: /^3\b/ })` should match the third button.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/export.spec.ts
git commit -m "test(export): e2e — open modal, render canvas, download PNG"
```

---

## Final verification

- [ ] **Step 1: Full unit run**

Run: `npm test`
Expected: ALL PASS.

- [ ] **Step 2: Full E2E run**

Run: `npx playwright test`
Expected: ALL PASS (existing homepage spec + new export spec).

- [ ] **Step 3: Production build still works**

Run: `npm run build && npm run build:single`
Expected: both succeed, no new bundle warnings.

- [ ] **Step 4: Manual print-paper sanity check**

In browser, save the export PNG and print to a real or PDF printer at A4 portrait, scale 100%. Confirm:
- masthead indigo block prints cleanly
- bars are legible
- type name is not clipped
- footer + QR placeholder visible

If any visual issues, iterate Task 3–6 (not new tasks). Update reference PNG.

- [ ] **Step 5: Commit reference image (optional)**

If satisfied, save the generated PNG to `docs/superpowers/specs/2026-04-30-export-reference.png` and commit:

```bash
git add docs/superpowers/specs/2026-04-30-export-reference.png
git commit -m "docs(export): reference PNG for visual regression"
```

---

## Out of scope (do not implement here)

- Real QR code generation
- Multi-page export
- PDF export
- Custom user nickname
- Removing the existing `ComparisonBars` from the live Results screen (export-only change)
