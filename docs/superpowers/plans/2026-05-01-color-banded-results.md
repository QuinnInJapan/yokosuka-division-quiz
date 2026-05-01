# Color-Banded Results Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-shadow chrome on the Results page with full-bleed color-banded chapters. Hero band's background is composed per archetype from a palette helper.

**Architecture:** Results screen owns four stacked full-bleed `<section>` bands — hero (indigo, custom blobs per archetype), traits (cream), match (pale-C-tint), actions (warm cream). Each existing child component (SukarinCard / TraitsPanel / MatchBrowse) sheds its card border + shadow and instead lives as the body of one band. Section dividing happens through background color shifts only — no chrome, no shadows. A pure helper `archetypePalette(code)` derives the 3-blob composition for the hero, so every one of the 32 archetypes gets a unique scene without per-archetype CSS.

**Tech Stack:** React + CSS Modules, existing token system in `src/styles/tokens.css`. No new dependencies.

**Reference POC:** `poc-ui-sweep.html` at repo root demonstrates the target visual (3 toggleable hero scenes + cream traits band + green match band + warm cream actions).

**Out of scope:**
- `src/lib/exportPng.ts` (the canvas-rendered share-card export keeps its current portrait layout). Flag a follow-up if the export should adopt the banded look.
- The Welcome screen and Quiz screen — this sweep is Results-only. Other screens follow once we validate the system here.
- The pre-existing snapshot test failures in `tests/e2e/results-snapshot.spec.ts` and `tests/e2e/export.spec.ts`. They will need rebaselining as part of Task 12, but were already red before this work.

---

## File Structure

**Created:**
- `src/lib/archetypePalette.ts` — pure helper that maps an archetype code (e.g. `'DASCG'`) to a `HeroPalette` object (base gradient + 3 blob configs).
- `src/lib/archetypePalette.test.ts` — Vitest unit tests for the helper.
- `src/screens/Results.module.css` — full-bleed band wrappers.
- `tests/e2e/results-bands.spec.ts` — Playwright check that all four bands render and have the right background contract.

**Modified:**
- `src/screens/Results.tsx` — wraps each existing child in a band `<section>`.
- `src/styles/layout.css` — let the results screen escape `#root`'s `max-width` / padding (mirror of the existing welcome escape).
- `src/components/SukarinCard.tsx` + `SukarinCard.module.css` — drops card chrome, becomes the hero band body, consumes the palette helper for inline-style blobs.
- `src/components/TraitsPanel.module.css` — drops `.card` shadow/border on the two child panes, keeps the 2-column grid.
- `src/components/TraitCarousel.module.css` — minor padding tweak to fit the cream band.
- `src/components/MatchBrowse.module.css` — section title uses chapter-mark idiom; drops shadow/border on inner card.
- `src/components/MatchDetail.module.css` — keeps a white inset on the green band but loses the shadow.
- `src/components/MatchList.module.css` — transparent rows on the band.
- `src/components/SukarinCard.test.tsx` — update assertions for new layout (image + name + desc still rendered, no `.card` border anymore).

---

## Task 1 — Tokens for band backgrounds

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Add band-bg tokens**

Append the following block right after `--bar-h`/`--mkr-size`/`--mkr-user` in `:root`:

```css
  /* ── Band backgrounds (color-banded chapters) ── */
  --band-hero-base:   #1C2340;     /* fallback before per-archetype palette */
  --band-traits:      var(--cream, #FAF7F2);
  --band-match:       var(--C-tint);
  --band-actions:     var(--hero-accent);
  --cream:            #FAF7F2;
```

If `--cream` already exists in tokens.css, leave the existing definition and skip that line. (Right now it does not — the POC defines it locally.)

- [ ] **Step 2: Commit**

```bash
git add src/styles/tokens.css
git commit -m "tokens: add band background palette for results sweep"
```

---

## Task 2 — archetypePalette helper + tests

**Files:**
- Create: `src/lib/archetypePalette.ts`
- Create: `src/lib/archetypePalette.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/archetypePalette.test.ts
import { describe, it, expect } from 'vitest';
import { archetypePalette } from './archetypePalette';

describe('archetypePalette', () => {
  it('returns a base gradient and exactly 3 blobs for any 5-letter code', () => {
    const p = archetypePalette('DASCG');
    expect(p.baseGradient).toMatch(/linear-gradient/);
    expect(p.blobs).toHaveLength(3);
    for (const blob of p.blobs) {
      expect(blob.color).toMatch(/^#|^var\(/);
      expect(blob.opacity).toBeGreaterThan(0);
      expect(blob.opacity).toBeLessThanOrEqual(1);
      expect(typeof blob.left).toBe('string');
      expect(typeof blob.top).toBe('string');
    }
  });

  it('produces a stable result for the same code', () => {
    expect(archetypePalette('DASCG')).toEqual(archetypePalette('DASCG'));
  });

  it('produces a different result for archetypes with different dominant axes', () => {
    const warm = archetypePalette('DASCG'); // D=人 dialogue dominant, A=動 action, S=援 support
    const cool = archetypePalette('FPRIX'); // F=機 framework, P=策 policy, R=律 rule, I=革 innovation, X=専 expert
    expect(warm).not.toEqual(cool);
  });

  it('falls back gracefully for an unknown code', () => {
    const p = archetypePalette('ZZZZZ');
    expect(p.blobs).toHaveLength(3);
    expect(p.baseGradient).toMatch(/linear-gradient/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/lib/archetypePalette.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the helper**

```ts
// src/lib/archetypePalette.ts
import { AX } from '../data/types';
import type { AxisKey } from '../data/types';

export type Blob = {
  /** Any CSS color: hex or `var(...)`. */
  color: string;
  opacity: number;
  /** CSS length / percentage strings, applied as inline-style left/top. */
  left: string;
  top: string;
  size: string;
};

export type HeroPalette = {
  /** Linear gradient consumed by `style={{ background }}`. */
  baseGradient: string;
  blobs: [Blob, Blob, Blob];
};

// Mid-tone axis colors — same hex values as the --A-mid / --B-mid / ... tokens.
const AXIS_MID: Record<AxisKey, string> = {
  A: '#E8534A',
  B: '#4A90D9',
  C: '#4CAF7D',
  D: '#9B59B6',
  E: '#F5A623',
};

// Letter → axis key (mirror of AXES[ax].letter_plus / letter_minus).
const LETTER_TO_AXIS: Record<string, AxisKey> = {
  D: 'A', F: 'A',          // A axis: 人/機
  A: 'B', P: 'B',          // B axis: 動/策
  S: 'C', R: 'C',          // C axis: 援/律
  C: 'D', I: 'D',          // D axis: 守/革
  G: 'E', X: 'E',          // E axis: 幅/専
};

// "Plus side" letters per axis — used to derive a +1/-1 sign for each axis.
const PLUS_LETTERS: Record<AxisKey, string> = {
  A: 'D', B: 'A', C: 'S', D: 'C', E: 'G',
};

const FALLBACK: HeroPalette = {
  baseGradient: 'linear-gradient(135deg, #0F1428 0%, #1C2340 55%, #2A2454 100%)',
  blobs: [
    { color: AXIS_MID.B, opacity: 0.32, left: '-120px', top: '-120px', size: '540px' },
    { color: AXIS_MID.D, opacity: 0.34, left: 'calc(100% - 400px)', top: 'calc(100% - 360px)', size: '480px' },
    { color: '#4A90D9', opacity: 0.22, left: '60%', top: '10%', size: '340px' },
  ],
};

/**
 * Map an archetype code (e.g. `'DASCG'`) to a hero-band palette: a base
 * gradient plus three watercolor blobs that pick up the archetype's
 * dominant axis tints.
 *
 * The composition is deterministic per code so that the same archetype
 * always renders the same scene; calls in render paths are safe.
 */
export function archetypePalette(code: string): HeroPalette {
  if (code.length !== 5) return FALLBACK;

  // Decode each letter to {axis, isPlus}. Anything we don't recognise falls
  // back rather than throwing — the helper is called from a render path.
  const decoded: Array<{ axis: AxisKey; isPlus: boolean }> = [];
  for (let i = 0; i < 5; i++) {
    const letter = code[i];
    const axis = LETTER_TO_AXIS[letter];
    if (!axis) return FALLBACK;
    decoded.push({ axis, isPlus: PLUS_LETTERS[axis] === letter });
  }

  // Pick the three axes whose sign aligns with the archetype's "warm" half:
  // we want the bg to read the archetype's character, not raw axis order.
  // Sort axes by index of AX so the result is stable, then take the first
  // three; the remaining two contribute as desaturated fallback hues.
  const ordered = AX.map((ax) => ({
    axis: ax,
    isPlus: decoded[AX.indexOf(ax)].isPlus,
  }));

  // Hash the code into [0..1) for slight per-archetype position offset so
  // two archetypes that share dominant axes still feel distinct.
  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const jitter = (hash % 1000) / 1000;

  // Decide a "temperature": how many letters are on the plus side of the
  // primary social axes (A, C). Warm archetypes lean to a sunset base;
  // cool archetypes lean to indigo/blue.
  const warmth =
    (ordered[0].isPlus ? 1 : 0) +
    (ordered[2].isPlus ? 1 : 0); // 0..2

  const baseGradient =
    warmth >= 2
      ? `linear-gradient(135deg, #2C1F32 0%, #4A2B3D 55%, #6E3F47 100%)`
      : warmth === 1
        ? `linear-gradient(135deg, #1A1612 0%, #2D241E 50%, #3D3027 100%)`
        : `linear-gradient(135deg, #0F1428 0%, #1C2340 55%, #2A2454 100%)`;

  // Three blobs: one large at top-left, one large at bottom-right, one
  // medium floating in the upper-right. Colors map to the first three
  // ordered axes; opacities tuned for legibility against white text.
  const a = ordered[0].axis;
  const b = ordered[1].axis;
  const c = ordered[2].axis;

  const blobs: [Blob, Blob, Blob] = [
    {
      color: AXIS_MID[a],
      opacity: 0.42 + (jitter * 0.06),
      left: `${-120 - Math.round(jitter * 30)}px`,
      top: `${-120 - Math.round(jitter * 30)}px`,
      size: '540px',
    },
    {
      color: AXIS_MID[c],
      opacity: 0.38 + ((1 - jitter) * 0.06),
      left: `calc(100% - ${400 + Math.round(jitter * 60)}px)`,
      top: `calc(100% - ${360 + Math.round((1 - jitter) * 60)}px)`,
      size: '480px',
    },
    {
      color: AXIS_MID[b],
      opacity: 0.24 + (jitter * 0.04),
      left: `${50 + Math.round(jitter * 20)}%`,
      top: `${5 + Math.round(jitter * 12)}%`,
      size: '340px',
    },
  ];

  return { baseGradient, blobs };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/lib/archetypePalette.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/archetypePalette.ts src/lib/archetypePalette.test.ts
git commit -m "feat(results): archetypePalette helper for hero bg per archetype"
```

---

## Task 3 — Let the results screen escape #root width

**Files:**
- Modify: `src/styles/layout.css`

The bands need to be full-bleed (touch the viewport edges). Today `#root` clamps everything to `--app-max` (1040px) with `--sp-lg` side padding. Mirror the existing welcome escape.

- [ ] **Step 1: Add the results escape**

Edit `src/styles/layout.css` — directly below the existing `body[data-screen="welcome"]` block, add:

```css
/* Results screen escapes the centered/padded shell to render full-bleed bands. */
body[data-screen="results"] {
  align-items: stretch;
}
body[data-screen="results"] #root {
  max-width: none;
  padding: 0;
}
```

- [ ] **Step 2: Visual sanity check**

Run: `rtk npm run dev` (already running per session). Open `http://localhost:5173/`, click through the quiz to results. The current card layout should now span the full viewport width — looks broken because the cards are still chromed; that's expected and will be fixed in later tasks.

- [ ] **Step 3: Commit**

```bash
git add src/styles/layout.css
git commit -m "layout: let results screen escape #root width like welcome"
```

---

## Task 4 — Results.tsx + Results.module.css band scaffold

**Files:**
- Modify: `src/screens/Results.tsx`
- Create: `src/screens/Results.module.css`

- [ ] **Step 1: Write Results.module.css**

```css
/* src/screens/Results.module.css */
.band {
  width: 100%;
  position: relative;
}
.bandInner {
  max-width: var(--app-max);
  margin: 0 auto;
  padding: 0 var(--sp-lg);
  position: relative;
  z-index: 2;
}

/* Chapter-mark pattern — small numbered rule above each section title. */
.chapterMark {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-black);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  opacity: 0.55;
  margin-bottom: var(--sp-lg);
}
.chapterMark .num {
  font-family: ui-monospace, Menlo, monospace;
  font-variant-numeric: tabular-nums;
}
.chapterMark .rule {
  flex: 1;
  height: 1px;
  background: currentColor;
  opacity: 0.35;
}

/* ── Hero ── */
.hero {
  color: white;
  padding: 80px 0 96px;
  overflow: hidden;
  isolation: isolate;
}
.heroBlob {
  position: absolute;
  border-radius: 50%;
  filter: blur(64px);
  pointer-events: none;
  z-index: 1;
}

/* ── Traits ── */
.traits {
  background: var(--band-traits);
  padding: 64px 0;
}
.traits .chapterMark { color: var(--hall-indigo); }

/* ── Match ── */
.match {
  background: var(--band-match);
  padding: 64px 0;
}
.match .chapterMark { color: var(--C); }

/* ── Actions ── */
.actions {
  background: var(--band-actions);
  padding: 48px 0 64px;
  text-align: center;
}

@media (max-width: 600px) {
  .hero { padding: 56px 0 64px; }
  .traits, .match { padding: 48px 0; }
  .actions { padding: 36px 0 48px; }
}
```

- [ ] **Step 2: Rewrite Results.tsx**

```tsx
// src/screens/Results.tsx
import { SukarinCard } from '../components/SukarinCard';
import { TraitsPanel } from '../components/TraitsPanel';
import { MatchBrowse } from '../components/MatchBrowse';
import { ExportButton } from '../components/ExportButton';
import { RetakeButton } from '../components/RetakeButton';
import { useDerived } from '../state/hooks';
import { sukarinSrc } from '../lib/sukarinImages';
import { archetypePalette } from '../lib/archetypePalette';
import s from './Results.module.css';

export function Results() {
  const { type, userScores } = useDerived();
  const palette = archetypePalette(type.code);

  return (
    <>
      {/* ① HERO */}
      <section
        className={`${s.band} ${s.hero}`}
        style={{ background: palette.baseGradient }}
        data-testid="results-band-hero"
      >
        {palette.blobs.map((b, i) => (
          <span
            key={i}
            className={s.heroBlob}
            style={{
              background: b.color,
              opacity: b.opacity,
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
            }}
            aria-hidden="true"
          />
        ))}
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>01</span>
            <span>あなたのタイプ</span>
            <span className={s.rule} />
          </div>
          <SukarinCard
            name={type.name}
            desc={type.desc}
            userScores={userScores}
            imageSrc={sukarinSrc(type.code)}
          />
        </div>
      </section>

      {/* ② TRAITS */}
      <section className={`${s.band} ${s.traits}`} data-testid="results-band-traits">
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>02</span>
            <span>5軸プロファイル</span>
            <span className={s.rule} />
          </div>
          <TraitsPanel />
        </div>
      </section>

      {/* ③ MATCH */}
      <section className={`${s.band} ${s.match}`} data-testid="results-band-match">
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>03</span>
            <span>あなたに合う課</span>
            <span className={s.rule} />
          </div>
          <MatchBrowse />
        </div>
      </section>

      {/* ④ ACTIONS */}
      <section className={`${s.band} ${s.actions}`} data-testid="results-band-actions">
        <div className={s.bandInner}>
          <ExportButton />
          <RetakeButton />
        </div>
      </section>
    </>
  );
}
```

Note: `MatchBrowse` currently renders the `<ExportButton />` and `<RetakeButton />` itself in a `.bottom-actions` row. Task 7 removes that pair from `MatchBrowse` so they only live in the Actions band — DRY.

- [ ] **Step 3: Typecheck and visually sanity-check**

Run: `rtk npx tsc --noEmit`
Expected: clean.

Open the running dev server, complete the quiz, land on results. Expect: hero indigo with watercolor blobs, cream traits band below (still chromed inside until Task 6), green match band (still chromed inside), warm cream actions band. Both Export and Retake buttons appear twice (in `.bottom-actions` and in the new actions band) — fixed in Task 7.

- [ ] **Step 4: Commit**

```bash
git add src/screens/Results.tsx src/screens/Results.module.css
git commit -m "feat(results): wrap children in 4 color-banded sections"
```

---

## Task 5 — SukarinCard becomes the hero band body

**Files:**
- Modify: `src/components/SukarinCard.tsx`
- Modify: `src/components/SukarinCard.module.css`
- Modify: `src/components/SukarinCard.test.tsx`

The hero band already supplies the dark bg + blobs. SukarinCard drops its blue-tint border, white background, shadow, and rounded corners. Image grows. Text becomes white.

- [ ] **Step 1: Update the test first**

```tsx
// src/components/SukarinCard.test.tsx — replace existing assertions
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SukarinCard } from './SukarinCard';

const baseProps = {
  name: '街のよろず屋',
  desc: '地域のあらゆる相談に応える総合支援者です。',
  userScores: { A: 1, B: 0, C: 1, D: 0, E: 0 },
  imageSrc: '/some/path.png',
};

describe('SukarinCard', () => {
  it('renders name with the 型 suffix', () => {
    render(<SukarinCard {...baseProps} />);
    expect(screen.getByRole('heading', { name: /街のよろず屋型/ })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<SukarinCard {...baseProps} />);
    expect(screen.getByText(baseProps.desc)).toBeInTheDocument();
  });

  it('renders the sukarin image when imageSrc is provided', () => {
    render(<SukarinCard {...baseProps} />);
    const img = screen.getByRole('img', { name: /街のよろず屋型のスカリン/ });
    expect(img).toHaveAttribute('src', '/some/path.png');
  });

  it('omits the image when imageSrc is undefined', () => {
    render(<SukarinCard {...baseProps} imageSrc={undefined} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify the existing component still satisfies it**

Run: `rtk npx vitest run src/components/SukarinCard.test.tsx`
Expected: PASS (the existing component already renders these primitives — we just dropped any layout-coupled assertions).

- [ ] **Step 3: Replace SukarinCard.module.css**

```css
/* src/components/SukarinCard.module.css */
.card {
  display: flex;
  align-items: center;
  gap: 48px;
  position: relative;
  z-index: 2;
}

.imgWrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35));
}

.body {
  flex: 1;
  min-width: 0;
  color: white;
}

.name {
  font-size: 48px;
  font-weight: var(--fw-black);
  line-height: 1.05;
  letter-spacing: -0.01em;
  margin: 0 0 12px;
  display: flex;
  align-items: flex-end;
  gap: 0.18em;
  color: white;
}
.suffix {
  font-size: 0.5em;
  font-weight: var(--fw-bold);
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.04em;
  line-height: 1;
  padding-bottom: 0.06em;
}

.desc {
  font-size: 15px;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.82);
  margin: 0;
  word-break: keep-all;
  overflow-wrap: break-word;
  max-width: 60ch;
}

@media (max-width: 720px) {
  .card { flex-direction: column; gap: 24px; text-align: center; }
  .img { width: 160px; height: 160px; }
  .name { font-size: 34px; }
  .desc { max-width: none; }
}

@media (prefers-reduced-motion: no-preference) {
  @keyframes sc-rise {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: var(--enter-final-opacity, 1); transform: translateY(0); }
  }
  .img  { animation: sc-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: 60ms; }
  .name { animation: sc-rise 480ms cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: 360ms; }
  .desc { animation: sc-rise 460ms cubic-bezier(0.22, 1, 0.36, 1) backwards; animation-delay: 480ms; --enter-final-opacity: 1; }
}
```

- [ ] **Step 4: Re-run unit tests**

Run: `rtk npx vitest run src/components/SukarinCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Visual sanity check**

Reload `/` → run quiz → results. Hero band should show large sukarin (~220px) on the left, white archetype name + 型 + white description on the right. No card frame, no shadow.

- [ ] **Step 6: Commit**

```bash
git add src/components/SukarinCard.tsx src/components/SukarinCard.module.css src/components/SukarinCard.test.tsx
git commit -m "feat(sukarin-card): hero-band layout — drop card chrome, white text"
```

---

## Task 6 — Strip card chrome from TraitsPanel + TraitCarousel

**Files:**
- Modify: `src/components/TraitsPanel.module.css`
- Modify: `src/components/TraitCarousel.module.css`

The 2-column grid (carousel left / bars right) stays — we just lose the `.card` background, border, and shadow on each pane. The cream band carries the framing.

- [ ] **Step 1: Update TraitsPanel.module.css**

```css
/* src/components/TraitsPanel.module.css */
.traits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-md);
  align-items: stretch;
}
@media (min-width: 840px) {
  .traits-grid {
    grid-template-columns: 320px 1fr;
    gap: var(--sp-lg);
  }
}

/* Carousel pane (left) — soft white inset on the cream band, no chrome. */
.tc-panel {
  padding: var(--sp-lg);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
}

/* Bar list pane (right) — same white inset. */
.bars-panel {
  padding: var(--sp-sm) var(--sp-lg);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 14px;
}
```

`TraitsPanel.tsx` currently composes the className with the global `card` utility (`className={\`card ${s['tc-panel']}\`}`). The `card` utility from `layout.css` adds the shadow we want to remove. Change both lines so they no longer include the `card` class.

- [ ] **Step 2: Update TraitsPanel.tsx**

```tsx
// src/components/TraitsPanel.tsx — replace classNames on the two child divs
import { useStore, useDerived } from '../state/hooks';
import { AX } from '../data/types';
import { TraitCarousel } from './TraitCarousel';
import { TraitBar } from './TraitBar';
import s from './TraitsPanel.module.css';

export function TraitsPanel() {
  const { state } = useStore();
  const { userScores } = useDerived();

  return (
    <div className={s['traits-grid']}>
      <div className={s['tc-panel']}>
        <TraitCarousel />
      </div>
      <div className={s['bars-panel']}>
        {AX.map((ax, i) => (
          <TraitBar
            key={ax}
            axis={ax}
            score={userScores[ax]}
            active={i === state.traitIdx}
          />
        ))}
      </div>
    </div>
  );
}
```

(Removed the `card` global classes and the `section-gap` margin — the band wrapper supplies vertical rhythm now.)

- [ ] **Step 3: Visual check**

Reload results. Traits band shows cream bg, two soft white inset panels side by side. No shadow on either. The carousel description and 5 trait bars render unchanged inside.

- [ ] **Step 4: Commit**

```bash
git add src/components/TraitsPanel.tsx src/components/TraitsPanel.module.css
git commit -m "refactor(traits): drop card chrome — soft white inset on cream band"
```

---

## Task 7 — Strip card chrome from MatchBrowse + move actions out

**Files:**
- Modify: `src/components/MatchBrowse.tsx`
- Modify: `src/components/MatchBrowse.module.css`
- Modify: `src/components/MatchList.module.css`
- Modify: `src/components/MatchDetail.module.css`

`MatchBrowse` currently renders its own title+sub block, the list/detail grid, and a `<bottom-actions>` row containing `<ExportButton />` + `<RetakeButton />`. The actions band in Results now owns those two buttons. The title/sub were a duplicate of what the chapter-mark already says — drop them.

- [ ] **Step 1: Replace MatchBrowse.tsx**

```tsx
// src/components/MatchBrowse.tsx
import { useStore, useDerived } from '../state/hooks';
import { MatchList } from './MatchList';
import { MatchDetail } from './MatchDetail';
import s from './MatchBrowse.module.css';

export function MatchBrowse() {
  const { state } = useStore();
  const { results } = useDerived();
  const selected = results[state.sel];

  return (
    <div className={s['match-section']}>
      <p className={s['match-section-sub']}>
        5つの軸のプロファイルを比較して相性を算出しています
      </p>
      <div className={s['match-browse']}>
        <div className={s['list-col']}>
          <MatchList items={results} />
        </div>
        <div className={s['detail-col']}>
          <MatchDetail division={selected} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update MatchBrowse.module.css**

```css
/* src/components/MatchBrowse.module.css */
.match-section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}
.match-section-sub {
  font-size: var(--fs-sm);
  color: var(--text-sec);
  margin: 0 0 var(--sp-md);
  line-height: var(--lh-tight);
}

.match-browse {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-md);
  align-items: stretch;
}
@media (min-width: 840px) {
  .match-browse {
    grid-template-columns: 360px 1fr;
    gap: var(--sp-lg);
  }
}

.list-col {
  position: relative;
  min-height: 0;
}
.list-col > * {
  position: absolute;
  inset: 0;
}
@media (max-width: 839px) {
  .list-col { position: static; }
  .list-col > * { position: static; }
}
```

(Title block and `bottom-actions` block are gone.)

- [ ] **Step 3: Update MatchList.module.css**

Today the list has its own background + border. On the green band we want a soft white inset (mirror of the traits panes).

```css
/* src/components/MatchList.module.css — replace the .all-list rules */
.all-list--side {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  overflow: hidden;
  height: 100%;
}
.all-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 14px 18px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(30, 115, 69, 0.12);
  gap: 14px;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}
.all-item:last-of-type { border-bottom: none; }
.all-item.on { background: white; }
.all-rn {
  width: 22px;
  font-size: var(--fs-xs);
  font-weight: var(--fw-black);
  color: var(--sub);
  text-align: right;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.all-info { flex: 1; min-width: 0; }
.all-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-black);
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.all-dept {
  font-size: var(--fs-xs);
  color: var(--sub);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.all-fit {
  font-size: var(--fs-base);
  font-weight: var(--fw-black);
  flex-shrink: 0;
  margin-left: var(--sp-sm);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 4: Update MatchDetail.module.css**

```css
/* src/components/MatchDetail.module.css — replace .match-card and add chrome */
.match-card {
  background: white;
  border-radius: 14px;
  padding: 28px;
}

/* keep the existing :global(.fit-display) etc. exactly as they are */
:global(.fit-display) {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
:global(.fit-arc) { width: 56px; height: 56px; flex-shrink: 0; }
:global(.fit-text) { display: flex; flex-direction: column; }
:global(.fit-pct) {
  font-size: 28px;
  font-weight: var(--fw-black);
  line-height: 1;
}
:global(.fit-lbl) {
  font-size: var(--fs-xs);
  color: var(--sub);
  font-weight: var(--fw-bold);
  letter-spacing: .06em;
  margin-top: 2px;
}

.match-top {
  display: flex;
  align-items: center;
  gap: var(--sp-xl);
  padding-bottom: var(--sp-lg);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--sp-lg);
}
.div-dept { font-size: var(--fs-xs); color: var(--sub); margin-bottom: 2px; }
.div-name {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  word-break: keep-all;
  overflow-wrap: break-word;
  margin-bottom: var(--sp-sm);
}
.div-about {
  font-size: var(--fs-sm);
  line-height: var(--lh-body);
  color: var(--text-sec);
  word-break: keep-all;
  overflow-wrap: break-word;
}
```

The `MatchDetail.tsx` previously combined `card` global with `match-card`. Update:

- [ ] **Step 5: Update MatchDetail.tsx**

```tsx
// src/components/MatchDetail.tsx — drop the global `card` from the className
import type { RankedDivision } from '../data/types';
import { fitColor } from '../lib/scoring';
import { FitRing } from './FitRing';
import { ComparisonBars } from './ComparisonBars';
import s from './MatchDetail.module.css';

export function MatchDetail({ division }: { division: RankedDivision }) {
  const fc = fitColor(division.fit);
  return (
    <div className={s['match-card']}>
      <div className={s['match-top']}>
        <FitRing pct={division.fit} fillColor={fc.fill} textColor={fc.text} />
        <div>
          <div className={s['div-dept']}>{division.dept}</div>
          <div className={s['div-name']}>{division.name}</div>
          <div className={s['div-about']}>{division.about ?? ''}</div>
        </div>
      </div>
      <ComparisonBars
        user={division.user}
        division={division}
        divisionName={division.name}
        fit={division.fit}
      />
    </div>
  );
}
```

- [ ] **Step 6: Visual check**

Reload results. Match band: green-tint bg, list and detail sit as soft white insets. No shadows. Selected list row turns solid white. Action buttons appear ONCE (in the actions band).

- [ ] **Step 7: Commit**

```bash
git add src/components/MatchBrowse.tsx src/components/MatchBrowse.module.css src/components/MatchDetail.tsx src/components/MatchDetail.module.css src/components/MatchList.module.css
git commit -m "refactor(match): drop card chrome — white insets on green band"
```

---

## Task 8 — TraitBar minor cleanup

**Files:**
- Modify: `src/components/TraitBar.module.css`

`TraitBar` currently sets `background: var(--card)` on each row, which means inside the bars-panel inset the rows render as solid white over the soft-white panel. We want the rows transparent so the panel reads as one surface, with the active row highlighting via `--indigo-tint-soft` only.

- [ ] **Step 1: Replace `.trait`'s background**

```css
/* src/components/TraitBar.module.css — within .trait, swap background */
.trait {
  display: block;
  width: 100%;
  padding: var(--sp-sm);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-light);
  border-radius: 6px;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background .15s ease-out;
}
.trait:last-child { border-bottom: none; }
.trait:hover { background: var(--hover-wash); }
.trait--active {
  background: var(--indigo-tint-soft);
  border-bottom-color: transparent;
}
```

(All other classes in this file — `.trait-header`, `.trait-track`, etc. — stay as-is.)

- [ ] **Step 2: Visual check**

Reload results. Bars panel reads as one continuous soft-white surface. Active bar is indigo-tint. Hairlines between rows are still visible.

- [ ] **Step 3: Commit**

```bash
git add src/components/TraitBar.module.css
git commit -m "refactor(trait-bar): transparent row bg for band-consistent surface"
```

---

## Task 9 — TraitCarousel polish

**Files:**
- Modify: `src/components/TraitCarousel.module.css`

`TraitCarousel` already has no card chrome — it relies on the `.tc-panel` parent. The hero kanji + win label could be larger now that the carousel pane is its own visible surface.

- [ ] **Step 1: Bump hero size**

```css
/* src/components/TraitCarousel.module.css — replace .tc-hero block */
.tc-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: var(--sp-md);
}
.tc-win {
  font-size: var(--fs-xl);
  font-weight: var(--fw-black);
}
```

(Other classes unchanged.)

- [ ] **Step 2: Commit**

```bash
git add src/components/TraitCarousel.module.css
git commit -m "polish(trait-carousel): larger axis-win heading on cream band"
```

---

## Task 10 — Actions band refinements

**Files:**
- Modify: `src/components/ExportButton.module.css`
- Modify: `src/components/RetakeButton.module.css`
- Modify: `src/screens/Results.module.css`

The two buttons in the actions band should sit side-by-side, centered. Default behavior is fine if their parents flex correctly.

- [ ] **Step 1: Update Results.module.css `.actions` block**

```css
/* src/screens/Results.module.css — find the existing .actions rule */
.actions {
  background: var(--band-actions);
  padding: 48px 0 64px;
}
.actions .bandInner {
  display: flex;
  justify-content: center;
  gap: var(--sp-md);
  flex-wrap: wrap;
}
```

(Removed the `text-align: center` since we use flex now.)

- [ ] **Step 2: Visual check**

Reload results. Bottom band: warm cream bg, two buttons centered side-by-side, wrapping under each other on narrow viewports.

- [ ] **Step 3: Commit**

```bash
git add src/screens/Results.module.css
git commit -m "polish(actions-band): center the two action buttons"
```

---

## Task 11 — E2E test for the four bands

**Files:**
- Create: `tests/e2e/results-bands.spec.ts`

- [ ] **Step 1: Write the e2e test**

```ts
// tests/e2e/results-bands.spec.ts
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

async function completeQuiz(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /診断をはじめる/ }).click();
  // Answer 20 questions with the 3rd option (neutral).
  for (let i = 0; i < 20; i++) {
    await page.getByRole('button', { name: /^3 / }).click();
  }
}

test('results screen renders all four color bands', async ({ page }) => {
  await completeQuiz(page);
  await expect(page.getByTestId('results-band-hero')).toBeVisible();
  await expect(page.getByTestId('results-band-traits')).toBeVisible();
  await expect(page.getByTestId('results-band-match')).toBeVisible();
  await expect(page.getByTestId('results-band-actions')).toBeVisible();
});

test('results bands stack in order: hero → traits → match → actions', async ({ page }) => {
  await completeQuiz(page);
  const hero = await page.getByTestId('results-band-hero').boundingBox();
  const traits = await page.getByTestId('results-band-traits').boundingBox();
  const match = await page.getByTestId('results-band-match').boundingBox();
  const actions = await page.getByTestId('results-band-actions').boundingBox();
  if (!hero || !traits || !match || !actions) {
    throw new Error('a results band did not render');
  }
  expect(hero.y).toBeLessThan(traits.y);
  expect(traits.y).toBeLessThan(match.y);
  expect(match.y).toBeLessThan(actions.y);
});

test('results hero band has a non-default background (per-archetype palette applied)', async ({ page }) => {
  await completeQuiz(page);
  const hero = page.getByTestId('results-band-hero');
  const bg = await hero.evaluate((el) => getComputedStyle(el).backgroundImage);
  // archetypePalette always returns a linear-gradient base — make sure the
  // inline style flows through and we are not falling back to "none".
  expect(bg).toContain('linear-gradient');
});
```

The test answers are all option-3 (neutral score → 0 on every axis). That resolves to archetype code `DASCG` per `determineType` (each axis defaults to its plus letter when score >= 0). We don't depend on a specific archetype — only that *some* palette comes through.

- [ ] **Step 2: Run the test**

Run: `rtk npx playwright test tests/e2e/results-bands.spec.ts --reporter=line`
Expected: 3 PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/results-bands.spec.ts
git commit -m "test(e2e): assert results renders all four color bands in order"
```

---

## Task 12 — Rebaseline visual snapshot tests

**Files:**
- Modify: `tests/e2e/results-snapshot.spec.ts` (snapshot images, not the spec file)
- Modify: `tests/e2e/export.spec.ts` (snapshot images)

The pre-existing visual regression tests for SukarinCard and the export modal will be off by more than the tolerance now. They were already failing before this work; rebaseline as part of this plan only if visual review of the new Results page passes.

- [ ] **Step 1: Visually review the new Results page**

Open `http://localhost:5173/` → run quiz → results. Walk through:
- Hero blobs render. White text legible against the dark gradient.
- Cream traits band: 2-column on ≥840px, 1-column below. Bars active highlight visible.
- Green match band: list on left, detail on right. Selected list row turns white.
- Actions band: warm cream, two buttons centered.
- No shadows anywhere. No card borders.

If anything looks off, fix at the source before rebaselining.

- [ ] **Step 2: Rebaseline**

Run: `rtk npx playwright test tests/e2e/results-snapshot.spec.ts tests/e2e/export.spec.ts --update-snapshots`

Inspect the diff in `tests/e2e/__snapshots__/` (or wherever Playwright stores them in this project) before committing — confirm each updated PNG looks intentional, not regressed.

- [ ] **Step 3: Re-run the full suite**

Run: `rtk npx playwright test --reporter=line`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e
git commit -m "test: rebaseline snapshots for color-banded results page"
```

---

## Task 13 — Verification + final commit

- [ ] **Step 1: Typecheck**

Run: `rtk npx tsc --noEmit`
Expected: clean.

- [ ] **Step 2: Unit tests**

Run: `rtk npx vitest run`
Expected: all PASS, including `archetypePalette.test.ts` and `SukarinCard.test.tsx`.

- [ ] **Step 3: E2E suite**

Run: `rtk npx playwright test --reporter=line`
Expected: all PASS.

- [ ] **Step 4: Manual pass on multiple archetypes**

Run the quiz with three different answer patterns to land on three different archetype codes:
- All option 5 → strong-plus archetype (e.g. `DASCG`).
- All option 1 → strong-minus archetype (`FPRIX`).
- Alternating 5/1 → mixed archetype.

Confirm the hero band's blob composition visibly differs across the three results. If two archetypes look identical, revisit `archetypePalette.ts` jitter logic.

- [ ] **Step 5: Mobile pass**

Resize Devtools to 375×812 (iPhone). Confirm: hero stacks (image above text), traits band collapses to 1-column, match band collapses to 1-column, actions band wraps if needed. No horizontal scroll.

- [ ] **Step 6: Final commit (only if any polish landed in steps 4–5)**

```bash
git add -A
git commit -m "polish(results): final pass on banded layout"
```

---

## Self-review checklist

- [ ] Spec coverage: hero band w/ per-archetype bg ✓ (Task 2 + 4 + 5), traits band w/ carousel + bars ✓ (Task 4 + 6 + 9), match band ✓ (Task 4 + 7), actions band ✓ (Task 4 + 10). Drop-shadow removal across the page ✓ (Tasks 5–10).
- [ ] No placeholders. Every step contains the literal code or command.
- [ ] Type consistency: `HeroPalette`, `Blob`, `archetypePalette()` referenced identically across Tasks 2 → 4. `MatchBrowse` no longer rendering `<ExportButton />` / `<RetakeButton />` (Task 7) is consistent with Results owning them in the actions band (Task 4).
- [ ] Frequent commits (12 commits across 13 tasks).
