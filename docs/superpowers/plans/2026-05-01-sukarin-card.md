# SukarinCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the indigo `TypeReveal` banner with a `SukarinCard` framed component on the results screen and inside the export PNG masthead, while preserving all current palette, typography, axis chip recipes, and surrounding components.

**Architecture:** Build a Vite-glob asset map (`src/lib/sukarinImages.ts`) so each archetype code resolves to a hashed PNG URL. Implement `SukarinCard.tsx` + module CSS that ports the existing `TypeReveal` entrance animation. Swap the component in `Results.tsx`. Rewrite `drawMasthead` in `exportPng.ts` to render the same composition onto the canvas, loading the PNG via `HTMLImageElement` ahead of render in `ExportModal.tsx` (`Promise.all([fontsReady, imageReady])`). Delete the obsolete `TypeReveal` files at the end.

**Tech Stack:** React 19, TypeScript, Vite 8, CSS modules, Vitest 4, Playwright 1.59, HTMLCanvas 2D API.

**Spec:** `docs/superpowers/specs/2026-05-01-sukarin-card-design.md`

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `src/assets/sukarin/<CODE>.png` (×32) | Existing | Source artwork, one per archetype code |
| `src/lib/sukarinImages.ts` | **New** | Map archetype code → hashed image URL |
| `src/lib/sukarinImages.test.ts` | **New** | Verify all 32 codes resolve |
| `src/components/SukarinCard.tsx` | **New** | DOM rendering of the framed card |
| `src/components/SukarinCard.module.css` | **New** | Frame styling + ported entrance animation |
| `src/screens/Results.tsx` | Modify | Replace `<TypeReveal />` with `<SukarinCard />` |
| `src/lib/exportPng.ts` | Modify | Rewrite `drawMasthead`; add `sukarinImage?` to `ExportData`; remove archetype mini-grid use from masthead |
| `src/components/ExportModal.tsx` | Modify | Pre-load Sukarin image, pass via `buildExportData`, wait via `Promise.all` |
| `tests/e2e/export.spec.ts` | Modify | Add assertion that exported PNG blob exceeds an old-masthead-only baseline |
| `tests/e2e/results-snapshot.spec.ts` | **New** | Pixel snapshot of the SukarinCard for one archetype under reduced motion |
| `src/components/TypeReveal.tsx` | **Delete** | Superseded by SukarinCard |
| `src/components/TypeReveal.module.css` | **Delete** | Superseded by SukarinCard module CSS |

---

## Task 1: Asset import library + unit test

**Files:**
- Create: `src/lib/sukarinImages.ts`
- Test: `src/lib/sukarinImages.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/sukarinImages.test.ts
import { describe, it, expect } from 'vitest';
import { TYPES } from '../data/archetypes';
import { sukarinImages, sukarinSrc } from './sukarinImages';

describe('sukarinImages', () => {
  it('resolves a non-empty URL for every archetype code', () => {
    const codes = Object.keys(TYPES);
    expect(codes.length).toBe(32);
    for (const code of codes) {
      const url = sukarinImages[code];
      expect(url, `missing image for code ${code}`).toBeTruthy();
      expect(url, `empty image url for code ${code}`).not.toBe('');
    }
  });

  it('sukarinSrc returns undefined for unknown codes', () => {
    expect(sukarinSrc('ZZZZZ')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/sukarinImages.test.ts`
Expected: FAIL — module `./sukarinImages` does not exist.

- [ ] **Step 3: Implement the asset map**

```ts
// src/lib/sukarinImages.ts
const modules = import.meta.glob<{ default: string }>(
  '../assets/sukarin/*.png',
  { eager: true },
);

export const sukarinImages: Record<string, string> = Object.fromEntries(
  Object.entries(modules)
    .map(([path, mod]) => {
      const match = path.match(/([A-Z]{5})\.png$/);
      return match ? [match[1], mod.default] : null;
    })
    .filter((entry): entry is [string, string] => entry !== null),
);

export function sukarinSrc(code: string): string | undefined {
  return sukarinImages[code];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/sukarinImages.test.ts`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/sukarinImages.ts src/lib/sukarinImages.test.ts
git commit -m "feat(sukarin): asset import map for 32 archetype PNGs"
```

---

## Task 2: SukarinCard component (TDD render)

**Files:**
- Create: `src/components/SukarinCard.tsx`
- Create: `src/components/SukarinCard.module.css`

- [ ] **Step 1: Write the failing render test**

Create `src/components/SukarinCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SukarinCard } from './SukarinCard';

describe('SukarinCard', () => {
  const props = {
    code: 'DASCG',
    name: '街のよろず屋',
    desc: '市民に寄り添う万能タイプ。',
    userScores: { A: 1.6, B: 1.2, C: 1.7, D: 1.0, E: 1.4 } as const,
    imageSrc: '/test-sukarin.png',
  };

  it('renders code, name (with quoted format), and description', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('DASCG');
    expect(html).toContain('「街のよろず屋」型');
    expect(html).toContain('市民に寄り添う万能タイプ。');
  });

  it('renders five chips with kanji per axis', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    // positive scores → kanji_plus for A=人, B=動, C=援, D=守, E=幅
    for (const k of ['人', '動', '援', '守', '幅']) {
      expect(html, `missing chip kanji ${k}`).toContain(k);
    }
  });

  it('renders the eyebrow label', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toContain('あなたのスカリン');
  });

  it('renders the image when imageSrc is provided', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} />);
    expect(html).toMatch(/<img[^>]+src="\/test-sukarin\.png"/);
  });

  it('omits the image when imageSrc is undefined', () => {
    const html = renderToStaticMarkup(<SukarinCard {...props} imageSrc={undefined} />);
    expect(html).not.toContain('<img');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/SukarinCard.test.tsx`
Expected: FAIL — module `./SukarinCard` does not exist.

- [ ] **Step 3: Implement `SukarinCard.tsx`**

```tsx
// src/components/SukarinCard.tsx
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import type { AxisKey } from '../data/types';
import s from './SukarinCard.module.css';

export type SukarinCardProps = {
  code: string;
  name: string;
  desc: string;
  userScores: Record<AxisKey, number>;
  imageSrc?: string;
};

export function SukarinCard({ code, name, desc, userScores, imageSrc }: SukarinCardProps) {
  return (
    <div className={s.card} data-testid="sukarin-card">
      <div className={s.eyebrow}>あなたのスカリン</div>
      {imageSrc && (
        <div className={s.imgWrap}>
          <img className={s.img} src={imageSrc} alt={`${name}型のスカリン`} />
        </div>
      )}
      <div className={s.code}>{code}</div>
      <h1 className={s.name}>「{name}」型</h1>
      <div className={s.chips}>
        {AX.map((ax) => {
          const a = AXES[ax];
          const kanji = userScores[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
          return (
            <div
              key={ax}
              className={s.chip}
              style={{ background: a.tint, color: a.dark }}
            >
              {kanji}
            </div>
          );
        })}
      </div>
      <p className={s.desc}>{desc}</p>
    </div>
  );
}
```

- [ ] **Step 4: Implement `SukarinCard.module.css`** (frame + ported animation)

```css
/* src/components/SukarinCard.module.css */
.card {
  background: var(--card);
  border: 2px solid var(--B-tint);
  border-radius: var(--card-r);
  box-shadow: var(--card-shadow);
  padding: var(--sp-xl) var(--sp-lg);
  margin-bottom: var(--sp-lg);
  text-align: center;
}

.eyebrow {
  color: var(--B);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  letter-spacing: .18em;
  text-transform: uppercase;
  margin-bottom: var(--sp-md);
}

.imgWrap {
  display: flex;
  justify-content: center;
  margin-bottom: var(--sp-md);
}

.img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(74, 144, 217, 0.18));
}

@media (max-width: 600px) {
  .img { width: 140px; height: 140px; }
}

.code {
  color: var(--A);
  font-size: var(--fs-xs);
  font-weight: var(--fw-black);
  letter-spacing: .22em;
  margin-bottom: var(--sp-xs);
}

.name {
  color: var(--text);
  font-size: var(--fs-2xl);
  font-weight: var(--fw-black);
  line-height: var(--lh-tight);
  margin: 0 0 var(--sp-md);
}

.chips {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: var(--sp-md);
}

.chip {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
}

.desc {
  color: var(--text-sec);
  font-size: var(--fs-base);
  line-height: var(--lh-body);
  max-width: 480px;
  margin: 0 auto;
  word-break: keep-all;
  overflow-wrap: break-word;
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes sc-rise {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: var(--enter-final-opacity, 1); transform: translateY(0); }
  }
  @keyframes sc-pop {
    from { opacity: 0; transform: translateY(6px) scale(0.92); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .img      { animation: sc-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
              animation-delay: 60ms; }
  .eyebrow  { animation: sc-rise 380ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
              animation-delay: 140ms; --enter-final-opacity: .9; }
  .code     { animation: sc-rise 380ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
              animation-delay: 240ms; }
  .name     { animation: sc-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
              animation-delay: 360ms; }
  .chip     { animation: sc-pop 420ms cubic-bezier(0.22, 1, 0.36, 1) backwards; }
  .chip:nth-child(1) { animation-delay: 480ms; }
  .chip:nth-child(2) { animation-delay: 540ms; }
  .chip:nth-child(3) { animation-delay: 600ms; }
  .chip:nth-child(4) { animation-delay: 660ms; }
  .chip:nth-child(5) { animation-delay: 720ms; }
  .desc     { animation: sc-rise 460ms cubic-bezier(0.22, 1, 0.36, 1) backwards;
              animation-delay: 800ms; --enter-final-opacity: 1; }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- src/components/SukarinCard.test.tsx`
Expected: PASS — all 5 tests green.

- [ ] **Step 6: Run full unit suite**

Run: `npm test`
Expected: PASS — existing tests still green, new tests green.

- [ ] **Step 7: Commit**

```bash
git add src/components/SukarinCard.tsx \
        src/components/SukarinCard.module.css \
        src/components/SukarinCard.test.tsx
git commit -m "feat(sukarin): SukarinCard component with ported entrance animation"
```

---

## Task 3: Wire SukarinCard into Results screen

**Files:**
- Modify: `src/screens/Results.tsx`

- [ ] **Step 1: Read current `Results.tsx` to confirm structure**

Run: `cat src/screens/Results.tsx`
Expected output includes `import { TypeReveal } from '../components/TypeReveal'` and `<TypeReveal />` inside the fragment.

- [ ] **Step 2: Replace `TypeReveal` with `SukarinCard`**

```tsx
// src/screens/Results.tsx
import { SukarinCard } from '../components/SukarinCard';
import { TraitsPanel } from '../components/TraitsPanel';
import { MatchBrowse } from '../components/MatchBrowse';
import { useDerived } from '../state/hooks';
import { sukarinSrc } from '../lib/sukarinImages';

export function Results() {
  const { type, userScores } = useDerived();
  return (
    <>
      <SukarinCard
        code={type.code}
        name={type.name}
        desc={type.desc}
        userScores={userScores}
        imageSrc={sukarinSrc(type.code)}
      />
      <TraitsPanel />
      <MatchBrowse />
    </>
  );
}
```

- [ ] **Step 3: Smoke-test in dev**

Run: `npm run dev` (in another terminal)
Then: open `http://localhost:5173`, click 「診断をはじめる」, click option 4 (or any non-neutral) for all 20 questions, confirm:
- The indigo banner is gone.
- A bordered white SukarinCard is visible with eyebrow `あなたのスカリン`, a Sukarin image, the type code, the type name in `「〜」型` format, 5 axis chips, and description.
- Animation plays once (image first, then chips, then desc).
- TraitsPanel and MatchBrowse render below as before.

- [ ] **Step 4: Run unit tests + typecheck**

Run: `npm test && npm run build`
Expected: tests PASS, build succeeds, no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/screens/Results.tsx
git commit -m "feat(results): render SukarinCard in place of TypeReveal banner"
```

---

## Task 4: Image loader helper for canvas

**Files:**
- Modify: `src/lib/exportPng.ts` (add helper, no behavior change yet)

- [ ] **Step 1: Add a `loadImage` helper at the top of `exportPng.ts`**

Open `src/lib/exportPng.ts`. Below the imports (after line `import { TYPES } from '../data/archetypes';`), add:

```ts
export function loadImage(src: string | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
```

- [ ] **Step 2: Add a unit test**

Create `src/lib/exportPng.test.ts` if it does not already define a similar test, or append to existing `exportPng.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadImage } from './exportPng';

describe('loadImage', () => {
  it('resolves null when src is undefined', async () => {
    expect(await loadImage(undefined)).toBeNull();
  });

  it('resolves null when src is empty string', async () => {
    expect(await loadImage('')).toBeNull();
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `npm test -- src/lib/exportPng.test.ts`
Expected: PASS — all existing tests + new ones.

- [ ] **Step 4: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): add loadImage helper for canvas asset preloading"
```

---

## Task 5: Extend ExportData and rewrite drawMasthead

**Files:**
- Modify: `src/lib/exportPng.ts`

- [ ] **Step 1: Add `sukarinImage` to `ExportData` type**

Find the `ExportData` type declaration in `src/lib/exportPng.ts`. Add `sukarinImage` as an optional `HTMLImageElement | null` field:

```ts
export type ExportData = {
  type: { code: string; name: string; desc: string };
  userScores: Record<AxisKey, number>;
  best: RankedRow[];
  worst: RankedRow[];
  date: Date;
  sukarinImage?: HTMLImageElement | null;
};
```

- [ ] **Step 2: Update `buildExportData` signature to accept the image**

```ts
export function buildExportData(
  type: ResolvedArchetype,
  userScores: Record<AxisKey, number>,
  ranked: RankedDivision[],
  date: Date,
  sukarinImage?: HTMLImageElement | null,
): ExportData {
  return {
    type: { code: type.code, name: type.name, desc: type.desc },
    userScores,
    best: topNBestFits(ranked, BEST_COUNT),
    worst: bottomNWorstFits(ranked, WORST_COUNT).reverse(),
    date,
    sukarinImage: sukarinImage ?? null,
  };
}
```

- [ ] **Step 3: Rewrite `drawMasthead` to render the SukarinCard composition**

Replace the existing `drawMasthead` function (lines ~311-382) with:

```ts
function drawMasthead(ctx: CanvasRenderingContext2D, data: ExportData): void {
  const innerW = EXPORT_W - PAGE_PAD_X * 2;

  // Top header row (Yokosuka label + date) — keep as before, indigo bg already filled.
  ctx.fillStyle = '#FFFFFF';
  setFont(ctx, 10.5, 700);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  drawTrackedText(ctx, 'YOKOSUKA · 課適性診断', PAGE_PAD_X, 40, 0.3);
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.fillText(formatDateForDisplay(data.date), EXPORT_W - PAGE_PAD_X, 40);

  // Card frame: white bg, B-tint border, on top of the indigo masthead band.
  const cardX = PAGE_PAD_X;
  const cardY = 64;
  const cardW = innerW;
  const cardH = MASTHEAD_H - cardY - 16; // small bottom margin inside the indigo band
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 16, true, false);
  ctx.strokeStyle = '#EBF3FC'; // var(--B-tint)
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 16, false, true);

  // Eyebrow
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2E6DB4'; // var(--B)
  setFont(ctx, 11, 700);
  drawTrackedText(
    ctx,
    'あなたのスカリン',
    cardX + cardW / 2 - measureTracked(ctx, 'あなたのスカリン', 0.18) / 2,
    cardY + 28,
    0.18,
  );

  // Sukarin image (centered)
  const imgSize = 130;
  const imgX = cardX + (cardW - imgSize) / 2;
  const imgY = cardY + 44;
  if (data.sukarinImage) {
    ctx.drawImage(data.sukarinImage, imgX, imgY, imgSize, imgSize);
  }

  // Type code
  const codeY = imgY + imgSize + 22;
  ctx.fillStyle = '#C0392B'; // var(--A)
  setFont(ctx, 11, 800);
  drawTrackedText(
    ctx,
    data.type.code,
    cardX + cardW / 2 - measureTracked(ctx, data.type.code, 0.22) / 2,
    codeY,
    0.22,
  );

  // Type name
  const nameY = codeY + 28;
  ctx.fillStyle = '#1C2340'; // var(--text)
  setFont(ctx, 26, 800);
  const nameText = `「${data.type.name}」型`;
  ctx.fillText(nameText, cardX + cardW / 2 - ctx.measureText(nameText).width / 2, nameY);

  // Axis chips (5)
  const chipsY = nameY + 26;
  const chipSize = 28;
  const chipGap = 6;
  const totalChipsW = chipSize * 5 + chipGap * 4;
  let chipX = cardX + (cardW - totalChipsW) / 2;
  for (const ax of AX) {
    const a = AXES[ax];
    const kanji = data.userScores[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
    ctx.fillStyle = a.tint;
    roundRect(ctx, chipX, chipsY, chipSize, chipSize, 6, true, false);
    ctx.fillStyle = a.dark;
    setFont(ctx, 16, 700);
    ctx.fillText(kanji, chipX + chipSize / 2 - ctx.measureText(kanji).width / 2, chipsY + 20);
    chipX += chipSize + chipGap;
  }

  // Description (wrapped, centered)
  const descY = chipsY + chipSize + 22;
  ctx.fillStyle = '#4A5568'; // var(--text-sec)
  setFont(ctx, 12, 400);
  const descMaxW = cardW - 48;
  const measure: Measure = (s: string) => ctx.measureText(s);
  const descLines = wrapJapanese(measure, data.type.desc, descMaxW);
  let curY = descY;
  const descLineH = 12 * 1.85;
  for (const line of descLines.slice(0, 3)) {
    ctx.fillText(line, cardX + cardW / 2 - ctx.measureText(line).width / 2, curY);
    curY += descLineH;
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}
```

- [ ] **Step 4: Add helper functions `roundRect` and `measureTracked`**

Add immediately above `drawMasthead`:

```ts
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function measureTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  trackEm: number,
): number {
  const sizePx = fontSizePx(ctx);
  const chars = Array.from(text);
  let total = 0;
  for (const ch of chars) {
    total += ctx.measureText(ch).width + trackEm * sizePx;
  }
  return total - trackEm * sizePx;
}
```

- [ ] **Step 5: Remove the now-unused archetype mini-grid call**

The previous `drawMasthead` ended with a `drawArchetypeGrid(...)` call. Confirm the new function does not include it. The `drawArchetypeGrid` function itself stays defined for now (it may be unused; that's fine for this PR — TypeScript-strict-unused-imports will flag it if so; if so, prepend `// @ts-expect-error unused` or move to follow-up cleanup).

- [ ] **Step 6: Add necessary imports inside `exportPng.ts`**

Confirm at the top of the file: `AX` and `AXES` are imported. They already are (lines 1-3). No new imports needed.

- [ ] **Step 7: Run the unit tests**

Run: `npm test -- src/lib/exportPng.test.ts`
Expected: PASS — both `loadImage` tests + any pre-existing tests.

- [ ] **Step 8: Commit**

```bash
git add src/lib/exportPng.ts src/lib/exportPng.test.ts
git commit -m "feat(export): rewrite drawMasthead to render SukarinCard composition"
```

---

## Task 6: Wire ExportModal to preload image

**Files:**
- Modify: `src/components/ExportModal.tsx`

- [ ] **Step 1: Update the render-on-open effect to preload image and font**

Replace the existing `useEffect` block that handles drawing on open. New version:

```tsx
useEffect(() => {
  if (!open) return;
  const canvas = canvasRef.current;
  if (!canvas) return;

  let cancelled = false;
  const fontsReady =
    document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();
  const imageReady = loadImage(sukarinSrc(type.code));

  Promise.all([fontsReady, imageReady]).then(([, img]) => {
    if (cancelled) return;
    const data = buildExportData(type, userScores, results, new Date(), img);
    renderExport(canvas, data);
  });

  return () => {
    cancelled = true;
  };
}, [open, type, userScores, results]);
```

- [ ] **Step 2: Add the new imports**

At the top of `ExportModal.tsx`:

```tsx
import { buildExportData, renderExport, sanitizeFilename, loadImage } from '../lib/exportPng';
import { sukarinSrc } from '../lib/sukarinImages';
```

(`loadImage` is now exported from `exportPng.ts`; `sukarinSrc` from `sukarinImages.ts`.)

- [ ] **Step 3: Smoke-test in dev**

Run: `npm run dev`
Open the app, complete the quiz with non-neutral answers, click 「画像で保存」, confirm:
- Modal opens.
- Canvas preview shows the new masthead with a Sukarin image, type code, type name, chips, description.
- The bars and top-5/bottom-3 list still render below.
- Click 「保存」, the downloaded PNG matches the preview.

- [ ] **Step 4: Commit**

```bash
git add src/components/ExportModal.tsx
git commit -m "feat(export): preload Sukarin image before canvas render"
```

---

## Task 7: Update e2e + add results snapshot

**Files:**
- Modify: `tests/e2e/export.spec.ts`
- Create: `tests/e2e/results-snapshot.spec.ts`

- [ ] **Step 1: Strengthen the export e2e to assert PNG embedded the image**

Open `tests/e2e/export.spec.ts`. After the existing `expect(download.suggestedFilename())` assertion in the first test, add:

```ts
  // Asset embed sanity check: PNG should be larger than a text-only baseline.
  const path = await download.path();
  if (path) {
    const fs = await import('node:fs/promises');
    const stat = await fs.stat(path);
    // Arbitrary lower bound — the previous masthead-only PNG was ~80 KB; with the
    // embedded Sukarin image the file should comfortably exceed 200 KB.
    expect(stat.size).toBeGreaterThan(200 * 1024);
  }
```

- [ ] **Step 2: Add a results-screen snapshot test**

Create `tests/e2e/results-snapshot.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
});

test('results screen shows the SukarinCard for an archetype', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // Pick the highest option (5) on each question so we land on a stable code.
  for (let i = 0; i < 20; i++) {
    const opt = page.getByRole('button', { name: /^5\b/ }).first();
    await opt.click();
  }

  const card = page.getByTestId('sukarin-card');
  await expect(card).toBeVisible();
  await expect(card.locator('img')).toHaveCount(1);
  await expect(card).toContainText('あなたのスカリン');
  await expect(card).toContainText('型');

  // Pixel snapshot for visual regression. Tolerance: ~0.5% pixel diff.
  await expect(card).toHaveScreenshot('sukarin-card.png', { maxDiffPixelRatio: 0.005 });
});
```

- [ ] **Step 3: Generate the baseline snapshot**

Run: `npx playwright test tests/e2e/results-snapshot.spec.ts --update-snapshots`
Expected: a `tests/e2e/results-snapshot.spec.ts-snapshots/sukarin-card-*.png` is created and the test passes.

- [ ] **Step 4: Run all e2e tests**

Run: `npx playwright test`
Expected: all tests PASS, including the strengthened export test and the new snapshot test.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/export.spec.ts tests/e2e/results-snapshot.spec.ts \
        tests/e2e/results-snapshot.spec.ts-snapshots
git commit -m "test(e2e): assert PNG embeds image, snapshot SukarinCard"
```

---

## Task 8: Delete obsolete TypeReveal files

**Files:**
- Delete: `src/components/TypeReveal.tsx`
- Delete: `src/components/TypeReveal.module.css`

- [ ] **Step 1: Confirm `TypeReveal` is no longer imported**

Run: `grep -r "TypeReveal" src/ tests/ 2>/dev/null`
Expected: no results.

- [ ] **Step 2: Delete the files**

Run: `rm src/components/TypeReveal.tsx src/components/TypeReveal.module.css`

- [ ] **Step 3: Run the full validation suite**

Run: `npm run lint && npm test && npx playwright test && npm run build`
Expected: lint passes, all unit tests pass, all e2e tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore(results): remove obsolete TypeReveal component"
```

---

## Task 9: Final smoke + manual verification

**Files:** none (manual)

- [ ] **Step 1: Manual sanity check across multiple archetypes**

Run: `npm run dev`. Take the quiz multiple times with different answer patterns to land on different archetypes. For each, verify:
- The SukarinCard image matches the archetype code (open dev tools → inspect img src → confirm filename).
- The chips show the kanji corresponding to the score sign per axis.
- Description text is the one for that archetype.
- Animation plays once on entry; reload with `prefers-reduced-motion: reduce` (in dev tools rendering panel) and confirm static.

- [ ] **Step 2: Export PNG sanity check**

Click 「画像で保存」, save the PNG, open it in a viewer. Confirm:
- Sukarin image is embedded in the masthead area.
- Type code, name, chips, description all render correctly.
- Bars + top-5 + bottom-3 + footer + QR are visually the same as before this PR (modulo small Y shifts if `MASTHEAD_H` was tuned).

- [ ] **Step 3: Push branch (optional, ask user first)**

If user requests to push, run: `git push -u origin sukarin-rebrand`.

---

## Self-Review Checklist (run by author after writing this plan)

1. **Spec coverage:**
   - SukarinCard component → Task 2 ✓
   - Asset import strategy → Task 1 ✓
   - Results.tsx wiring → Task 3 ✓
   - exportPng masthead rewrite → Task 5 ✓
   - ExportModal Promise.all → Task 6 ✓
   - Unit test for asset map → Task 1 ✓
   - E2E export assertion → Task 7 ✓
   - Results snapshot test → Task 7 ✓
   - TypeReveal deletion → Task 8 ✓
   - Animation port → Task 2 ✓
   - Reduced-motion handling → Task 2 (CSS) + Task 7 (`reducedMotion: 'reduce'` in snapshot test) ✓
   - Error handling for missing image → Task 2 (conditional `<img>`) + Task 5 (conditional `drawImage`) + Task 4 (`loadImage` resolves null on failure) ✓
   - Acceptance criteria: every bullet maps to a verification step in Task 9 or the e2e tests in Task 7 ✓

2. **Placeholder scan:** No "TBD"/"TODO"/"implement later" left. All code blocks are concrete and runnable.

3. **Type consistency:**
   - `sukarinSrc(code: string): string | undefined` (Task 1) matches usage in Task 3 (`imageSrc={sukarinSrc(type.code)}`) and Task 6 (`loadImage(sukarinSrc(type.code))`).
   - `loadImage(src: string | undefined): Promise<HTMLImageElement | null>` (Task 4) matches usage in Task 6 (`Promise.all([fontsReady, imageReady])`) and Task 5 (passed into `buildExportData(..., img)`).
   - `buildExportData` extended signature (Task 5) matches the call site in Task 6.
   - `SukarinCardProps` (Task 2) matches the call site in Task 3.
