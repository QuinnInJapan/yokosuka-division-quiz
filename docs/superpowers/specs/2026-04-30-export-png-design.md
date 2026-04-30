# Export Results as A4 PNG — Design

**Date:** 2026-04-30
**Status:** Approved
**Related:** Results screen (`src/screens/Results.tsx`), `MatchBrowse`, `MatchDetail`, `ComparisonBars`, `TraitsPanel`

## 1. Purpose

Let a user on the Results screen export a single A4 PNG of their result that is more visually finished than the live site, and share it with coworkers (Yokosuka 市役所 desktop chat / email). Goals:

- **Aesthetic standalone artifact.** A poster, not a screenshot.
- **Receiver-readable.** Someone who has not taken the quiz can read it and understand what it means without further context.
- **Print-friendly.** A4 portrait, no full-bleed dark fields covering the whole sheet, prints cleanly on a 市役所 office printer.
- **Offline-safe.** No network calls during render. Works inside the existing single-file build.

## 2. Content scope

The exported PNG includes (and only includes):

- Type name and archetype description (e.g. 「街のよろず屋」型 + desc)
- User's own 5-axis profile bars (single bars, no comparison-to-division)
- Top **5** best-fit 課 with %
- Bottom **3** worst-fit 課 with %
- Date footer
- Quiz wordmark (`YOKOSUKA · 課適性診断`)
- QR placeholder (replaced with real offline-generated QR later)

**Explicitly removed vs. live Results screen:**

- 5-letter archetype code (DASCG, etc.) — not used elsewhere in product
- Per-axis user-vs-division comparison bars (`ComparisonBars`) — duplicated info, weighs page down
- Selected-division detail card — export is profile-centric, not division-centric

## 3. Visual direction (selected: F2 — Indigo masthead poster)

Full-bleed background, no card chrome.

- **Top third:** full-bleed indigo block (`#1C2340`) holding wordmark, eyebrow, type name, description.
- **Lower two-thirds:** white background with sections separated by short axis-colored hairlines + small tracked uppercase eyebrows.
- Existing site palette retained: indigo brand `#1C2340`, 5 axis colors from `data/axes.ts` (`A` red, `B` blue, `C` green, `D` purple, `E` gold).
- Existing bar idiom retained (axis-tint track + axis-mid dot at score%).

This is closer to the live aesthetic than the alternative directions explored (editorial mincho, postcard-stamp, riso poster), with the live site's white-card composition replaced by typographic structure on a single committed background.

## 4. Architecture

```
src/
  lib/
    exportPng.ts           # pure renderer: renderExport(canvas, data)
    exportPng.test.ts      # vitest for pure helpers (filename, slice, wrap)
  components/
    ExportButton.tsx       # opens modal; lives in MatchBrowse bottom row
    ExportModal.tsx        # canvas + 保存 + 閉じる
    ExportModal.module.css
```

**Modules.**

- **`exportPng.ts`** — pure, no React. Function `renderExport(canvas: HTMLCanvasElement, data: ExportData): void` clears canvas, sets context scale, draws the F2 poster. Helpers:
  - `drawText(ctx, text, x, y, opts)` — letter-spacing safe (per-char measure on Safari).
  - `drawHairline(ctx, x, y, w, color, alpha)`.
  - `drawBar(ctx, axisColors, scorePct, x, y, w)`.
  - `drawListRow(ctx, rank, name, dept, fit, color, y, maxNameWidth)`.
  - `drawQrPlaceholder(ctx, x, y, size)` — rounded rect + finder corners + 6×6 grid of dots.
  - `wrapJapanese(ctx, text, maxWidth)` — char-by-char measurement.
  - `sanitizeFilename(typeName, date)` — keeps kana/kanji, ASCII alnum, hyphen.

- **`ExportButton.tsx`** — small button placed in `MatchBrowse` bottom action row beside `RetakeButton`. Label: `結果を画像で保存`. Opens `ExportModal`.

- **`ExportModal.tsx`** — overlay + content panel containing:
  - Title `結果を画像で保存`.
  - Canvas (logical 794×1123, internal 2× = 1588×2246).
  - Brief copy: `画像を保存して同僚に共有できます`.
  - Buttons: `保存` (primary indigo, downloads PNG) + `閉じる`.
  - Focus trap, ESC closes, click-overlay closes, restores focus to trigger button.

**Data flow.** Modal opens → reads from `useDerived()` → builds plain `ExportData`:

```ts
type ExportData = {
  type: { name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: Array<{ rank: number; dept: string; name: string; fit: number }>; // 5
  worst: Array<{ rank: number; dept: string; name: string; fit: number }>; // 3
  date: Date;
};
```

→ `renderExport(canvas, data)` synchronous (~50–100ms). Re-renders each modal open (idempotent).

## 5. Layout regions (top → bottom)

A4 portrait, 794×1123 logical px. Side padding 56px, top/bottom padding 48px.

**R1 — Indigo masthead** (~340px tall, full-bleed)
- Bg `#1C2340`. Text white.
- Header row: `YOKOSUKA · 課適性診断` (10.5px tracked .3em, white) + date right (`YYYY.MM.DD`, 10.5px, 65% white).
- ~64px gap.
- Eyebrow `あなたのタイプ` (12px, 70% white, tracked .15em).
- Title `「{type.name}」型` (~58px, 800 weight, line-height 1.05, letter-spacing -0.02em).
- Description (13px, 85% white, max-width ~70% of inner, line-height 1.85).

**R2 — Profile bars** (~310px, white bg)
- Eyebrow `プロファイル` (11px tracked .28em, indigo @ 70%).
- Hairline 1px @ indigo 18% alpha.
- 5 bar rows. Each row:
  - Left col 90px: axis label (10.5px bold, axis-dark color).
  - Bar: 6px tall, axis-tint fill, full radius. Dot 12px circle, white fill, 2px border axis-dark, positioned at `((score+2)/4)*100%`.
  - Below bar (10.5px gray, axis-dark only on the winning side): pole anchors `{minus}` ←→ `{plus}` (e.g. `制度・仕組み` / `市民対話`).
- Row gap 14px.

**R3 — Top 5 fits** (~230px)
- Eyebrow `相性の高い課 — 上位5` (axis-C green `#1E7345`).
- Hairline axis-C @ 30% alpha.
- 5 rows, 13px line, line-height 2:
  - Left: `[01] {name} {dept}` — rank gray 10px tabular, name 13px indigo, dept 10px gray.
  - Right: `{fit}%` 13px bold tabular, axis-C green.
- Truncate name with `…` if name+dept exceeds ~70% row width.

**R4 — Bottom 3 fits** (~170px)
- Same shape as R3, axis-A red `#C0392B`.

**R5 — Footer** (~80px, anchored to bottom edge)
- Left: wordmark `YOKOSUKA · 課適性診断` (10px tracked) + date second line (10px, gray).
- Right: 80×80px QR placeholder (rounded rect + 3 finder corners + 6×6 dot grid).

## 6. Canvas rendering details

- **DPI / dimensions.** Logical 794×1123 (A4 portrait at 96 dpi). `ctx.scale(2,2)` once → final canvas 1588×2246 (~192 dpi for A4 210×297mm). Good for desktop screen share *and* office-printer A4 print.
- **Fonts.** `'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',Meiryo,sans-serif` — system fonts only, matches site tokens. Await `document.fonts.ready` before draw to avoid metric jitter on first render.
- **Letter spacing.** Canvas2D `letterSpacing` is unsupported in older Safari/WebKit. For tracked uppercase eyebrows, render char-by-char with measured advance + spacing offset.
- **Wrapping.** `wrapJapanese`: per-char measurement with `ctx.measureText`. No word boundaries needed (Japanese has no word spaces). Hard cap line count.
- **Color tokens.** Axis colors imported from `src/data/axes.ts`. Indigo `#1C2340` literal in renderer (matches `--hall-indigo` token).
- **QR placeholder.** Hardcoded canvas drawing: rounded rect outline + 3 corner finder marks + 6×6 dot grid (deterministic pattern).

## 7. UX flow

1. Results screen → user sees `結果を画像で保存` button in `MatchBrowse` bottom row, beside Retake.
2. Click → `ExportModal` opens (fade-in; `prefers-reduced-motion` → no fade).
3. Modal renders canvas synchronously; preview shows scaled-down canvas (`width:100%; max-width:560px; aspect-ratio:794/1123`).
4. User clicks `保存` → `canvas.toBlob('image/png')` → `URL.createObjectURL(blob)` → anchor click + `URL.revokeObjectURL` after.
5. Filename: `yokosuka-quiz-{sanitizedTypeName}-{YYYY-MM-DD}.png`.

## 8. Edge cases

- **Long type name** (>1 line at 58px): auto-shrink title to 48px or 42px steps until fits 2 lines.
- **Long division name + dept** exceeds row width: truncate name with `…` (measure with `measureText`).
- **Score exactly 50%** on a bar: dot is visible (white fill on axis-tint track + axis-dark border).
- **Tied fits in ranking**: deterministic order already provided by existing `lib/scoring`.
- **Modal reopen after retake**: renders fresh data each open (no memoization across opens).

## 9. Testing

- **`src/lib/exportPng.test.ts`** (vitest) — pure helpers only:
  - `sanitizeFilename` — strips invalid chars, preserves kana/kanji.
  - `topN` / `bottomN` slice helpers.
  - Percent formatting from raw score.
  - `wrapJapanese` — splits at correct char given mocked measureText.

- **E2E (Playwright)** — `tests/export.spec.ts`:
  - Seed answers → reach Results → click `結果を画像で保存`.
  - Modal opens, canvas element exists with non-zero `width`/`height`.
  - Click `保存` → assert download event with expected filename pattern.

- **Visual reference.** Commit a generated reference PNG into `docs/superpowers/specs/2026-04-30-export-reference.png` after first implementation. Diff manually for regressions.

## 10. Bundle / build impact

- ~3–4KB of new TS for renderer + components (no new deps).
- Single-file build (`vite-plugin-singlefile`) unchanged — all code bundled, all assets inline.
- No web fonts. No network calls during render.

## 11. Out of scope

- Real QR generation (placeholder for now; can drop in a small offline lib later).
- Multi-page export (single A4 only).
- PDF export (PNG only).
- Server-side render.
- Exporting selected-division comparison (intentionally removed).
- Custom user nickname slot on the export.
