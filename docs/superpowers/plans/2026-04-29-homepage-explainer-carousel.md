# Homepage Explainer Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage `Welcome` body with a 5-slide explainer carousel ported from the `presentations/how-it-works` deck (slides 2–6), so visitors understand the quiz mechanism before starting it.

**Architecture:** A self-contained `HomepageCarousel` React component renders slides s2–s6 as separate `<SlideN>` components. Carousel owns the active-index state, keyboard/swipe/click navigation, pipeline TOC, and dot indicator. `Welcome.tsx` keeps its title block and start CTA; only the middle is swapped for the carousel. Per-slide visuals are ported 1:1 from the deck — same DOM/class shapes, copy, and intra-slide interactivity (axis-row click in s2, question-row click in s3) — but the deck's stage-scale-to-fit is dropped (the carousel sits in normal page flow). CSS Modules per component, sourced from existing global axis/indigo tokens in `src/styles/tokens.css`.

**Tech Stack:** React 19, TypeScript, CSS Modules, Vite, Vitest (existing reducer tests), Playwright (e2e for the carousel).

---

## File Structure

**New:**
- `src/components/HomepageCarousel/index.ts` — barrel
- `src/components/HomepageCarousel/HomepageCarousel.tsx` — owns active index, kbd/swipe/click nav
- `src/components/HomepageCarousel/HomepageCarousel.module.css` — carousel shell, viewport, transition
- `src/components/HomepageCarousel/PipelineNav.tsx` — top TOC bar (4 steps: 入力/採点/比較/結果)
- `src/components/HomepageCarousel/PipelineNav.module.css`
- `src/components/HomepageCarousel/CarouselDots.tsx` — 5 dots + arrow buttons under viewport
- `src/components/HomepageCarousel/CarouselDots.module.css`
- `src/components/HomepageCarousel/slides/Slide2Input.tsx` + `.module.css`
- `src/components/HomepageCarousel/slides/Slide3Scoring.tsx` + `.module.css`
- `src/components/HomepageCarousel/slides/Slide4Comparison.tsx` + `.module.css`
- `src/components/HomepageCarousel/slides/Slide5Result.tsx` + `.module.css`
- `src/components/HomepageCarousel/slides/Slide6Example.tsx` + `.module.css`
- `tests/e2e/homepage-carousel.spec.ts` — Playwright e2e
- `playwright.config.ts` — at repo root, configures dev-server + tests glob

**Modify:**
- `src/screens/Welcome.tsx` — replace pills/intro/steps/stats block with `<HomepageCarousel />`
- `src/screens/Welcome.module.css` — remove rules tied to removed markup (`.axis-pills`, `.apill`, `.w-stats`, `.stat`, `.stat-n`, `.stat-l`, `.w-intro`, `.w-steps`, `.w-step`, `.w-step-num`)

**Unchanged:** axis tokens (`tokens.css`), `AXES` data (`data/axes.ts`), state/reducer, AppShell, all post-Welcome screens.

---

## Task 1: Scaffold carousel shell + Playwright e2e (failing)

**Files:**
- Create: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Create: `src/components/HomepageCarousel/HomepageCarousel.module.css`
- Create: `src/components/HomepageCarousel/index.ts`
- Create: `tests/e2e/homepage-carousel.spec.ts`
- Create: `playwright.config.ts`
- Modify: `src/screens/Welcome.tsx`

- [ ] **Step 1: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
```

- [ ] **Step 2: Write failing e2e test**

Create `tests/e2e/homepage-carousel.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('homepage carousel: 5 slides reachable via arrow keys', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('/');

  // Slide 1 (input) is initial
  await expect(page.getByTestId('carousel-slide-1')).toHaveAttribute('data-active', 'true');
  await expect(page.getByText('5つの軸 × 20の質問')).toBeVisible();

  for (let i = 2; i <= 5; i++) {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId(`carousel-slide-${i}`)).toHaveAttribute('data-active', 'true');
  }

  // ArrowRight at last slide stays on last
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-5')).toHaveAttribute('data-active', 'true');

  // ArrowLeft works
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByTestId('carousel-slide-4')).toHaveAttribute('data-active', 'true');

  // Start CTA still present
  await expect(page.getByRole('button', { name: /診断をはじめる/ })).toBeVisible();

  expect(errors).toEqual([]);
});

test('homepage carousel: dots jump to clicked slide', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('carousel-dot-3').click();
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
});

test('homepage carousel: pipeline TOC jumps to stage', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pipeline-step-3').click(); // 比較 = slide 3 in carousel = s4 in deck
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
});
```

- [ ] **Step 3: Run e2e test to confirm it fails**

Run: `npx playwright test homepage-carousel`
Expected: FAIL — `getByTestId('carousel-slide-1')` not found (component does not exist yet).

- [ ] **Step 4: Scaffold HomepageCarousel skeleton**

Create `src/components/HomepageCarousel/HomepageCarousel.tsx`:

```tsx
import { useEffect, useState } from 'react';
import s from './HomepageCarousel.module.css';

const SLIDE_COUNT = 5;

export function HomepageCarousel() {
  const [idx, setIdx] = useState(0);

  const go = (n: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, n)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  return (
    <section className={s.carousel} aria-label="部署タイプ診断の仕組み">
      <div className={s.viewport}>
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <div
            key={i}
            data-testid={`carousel-slide-${i + 1}`}
            data-active={i === idx ? 'true' : 'false'}
            className={s.slide}
            hidden={i !== idx}
          >
            <h2>Slide {i + 1} placeholder</h2>
          </div>
        ))}
      </div>
      <div className={s.dotsRow}>
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            data-testid={`carousel-dot-${i + 1}`}
            className={i === idx ? s.dotActive : s.dot}
            onClick={() => go(i)}
            aria-label={`スライド${i + 1}へ`}
          />
        ))}
      </div>
    </section>
  );
}
```

Create `src/components/HomepageCarousel/HomepageCarousel.module.css`:

```css
.carousel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-md);
}
.viewport {
  background: var(--card);
  border-radius: var(--card-r);
  box-shadow: var(--card-shadow);
  min-height: 420px;
  padding: var(--sp-xl);
  position: relative;
}
.slide[hidden] { display: none; }
.dotsRow {
  display: flex; justify-content: center; gap: 10px;
}
.dot, .dotActive {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 0; padding: 0;
  background: var(--border);
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
}
.dotActive {
  background: var(--hall-indigo);
  transform: scale(1.25);
}
.dot:hover { background: var(--text-sec); }
.dot:focus-visible, .dotActive:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

Create `src/components/HomepageCarousel/index.ts`:

```ts
export { HomepageCarousel } from './HomepageCarousel';
```

- [ ] **Step 5: Wire HomepageCarousel into Welcome**

Edit `src/screens/Welcome.tsx`. Replace the entire return body with:

```tsx
import { useStore } from '../state/hooks';
import { HomepageCarousel } from '../components/HomepageCarousel';
import s from './Welcome.module.css';

export function Welcome() {
  const { dispatch } = useStore();

  return (
    <>
      <div className={s['w-header']}>
        <div className={s['w-city']}>Yokosuka City Hall</div>
        <h1 className={s['w-title']}>
          横須賀市役所
          <br />
          部署タイプ診断
        </h1>
        <p className={s['w-sub']}>
          20の質問に答えるだけで、
          <br />
          あなたにぴったりの課が見つかります
        </p>
      </div>
      <div className="card">
        <HomepageCarousel />
        <button
          className={s['btn-start']}
          onClick={() => dispatch({ type: 'START' })}
        >
          診断をはじめる →
        </button>
      </div>
    </>
  );
}
```

Then delete unused rules from `src/screens/Welcome.module.css`: `.axis-pills`, `.apill`, `@keyframes pill-rise`, `.w-stats`, `.stat`, `.stat-n`, `.stat-l`, `.w-intro`, `.w-steps`, `.w-step`, `.w-step-num`. Keep `.w-header`, `.w-city`, `.w-title`, `.w-sub`, `.btn-start` and its hover/focus rules.

- [ ] **Step 6: Run e2e — slide nav passes, slide content + pipeline still fails**

Run: `npx playwright test homepage-carousel`
Expected: First test PASSES (5 slides + arrow keys + start CTA + dots). Second test PASSES (dots click). Third test FAILS — pipeline TOC not implemented yet.

- [ ] **Step 7: Add `data-testid` placeholder for pipeline + commit**

Quick fix: skip the pipeline test until Task 2 by marking it `test.skip(...)` temporarily. Edit:

```ts
test.skip('homepage carousel: pipeline TOC jumps to stage', async ({ page }) => {
```

Run: `npx playwright test homepage-carousel`
Expected: 2 pass, 1 skipped.

```bash
git add playwright.config.ts tests/e2e/homepage-carousel.spec.ts \
        src/components/HomepageCarousel src/screens/Welcome.tsx src/screens/Welcome.module.css
git commit -m "feat(homepage): scaffold explainer carousel shell, replace Welcome body"
```

---

## Task 2: PipelineNav (top TOC, 4 stages)

**Files:**
- Create: `src/components/HomepageCarousel/PipelineNav.tsx`
- Create: `src/components/HomepageCarousel/PipelineNav.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Mapping:** Carousel slide 1 (s2 入力) → stage 1; slide 2 (s3 採点) → stage 2; slide 3 (s4 比較) → stage 3; slide 4 (s5 結果) → stage 4; slide 5 (s6 例) → stage 4 (still 結果).

- [ ] **Step 1: Implement PipelineNav**

Create `src/components/HomepageCarousel/PipelineNav.tsx`:

```tsx
import s from './PipelineNav.module.css';

const STEPS = [
  { stage: 1, num: '01', label: '入力',  en: 'Input',      slide: 1 },
  { stage: 2, num: '02', label: '採点',  en: 'Scoring',    slide: 2 },
  { stage: 3, num: '03', label: '比較',  en: 'Comparison', slide: 3 },
  { stage: 4, num: '04', label: '結果',  en: 'Output',     slide: 4 },
] as const;

export function PipelineNav({
  activeStage,
  onJump,
}: {
  activeStage: number;          // 1..4 derived from slide idx
  onJump: (slideIdx0: number) => void;
}) {
  return (
    <nav className={s.pipeline} aria-label="パイプライン">
      {STEPS.map((st, i) => {
        const stateCls =
          st.stage === activeStage ? s.active
          : st.stage < activeStage ? s.done
          : s.upcoming;
        return (
          <button
            key={st.stage}
            data-testid={`pipeline-step-${st.slide}`}
            className={`${s.step} ${stateCls}`}
            onClick={() => onJump(st.slide - 1)}
          >
            <span className={s.num}>{st.num}</span>
            <span className={s.labelBox}>
              <span className={s.label}>{st.label}</span>
              <span className={s.en}>{st.en}</span>
            </span>
            {i < STEPS.length - 1 && <span className={s.divider} aria-hidden="true" />}
          </button>
        );
      })}
    </nav>
  );
}
```

Create `src/components/HomepageCarousel/PipelineNav.module.css`:

```css
.pipeline {
  display: flex;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: var(--sp-md);
}
.step {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  gap: 10px;
  padding: 14px 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--sub);
  position: relative;
  transition: color 200ms ease, background 200ms ease;
  font-family: inherit;
}
.step:hover { background: var(--bg); color: var(--text-sec); }
.step.active { color: var(--hall-indigo); }
.step.active::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--hall-indigo);
}
.step.done { color: var(--text-sec); }
.step.upcoming { opacity: 0.7; }
.divider {
  position: absolute;
  right: 0; top: 25%; bottom: 25%;
  width: 1px; background: var(--border);
}
.num {
  font-size: 11px; font-weight: var(--fw-bold);
  letter-spacing: 0.12em; opacity: 0.6;
}
.labelBox { display: flex; flex-direction: column; line-height: 1.2; }
.label { font-size: 14px; font-weight: var(--fw-bold); }
.en {
  font-size: 10px; font-weight: var(--fw-medium);
  letter-spacing: 0.14em; opacity: 0.6; text-transform: uppercase;
}
.step:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}
```

- [ ] **Step 2: Wire PipelineNav into HomepageCarousel**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Add import and render before `.viewport`:

```tsx
import { PipelineNav } from './PipelineNav';

// inside component, before return:
const slideToStage = [1, 2, 3, 4, 4];
const activeStage = slideToStage[idx];

// in JSX, before <div className={s.viewport}>:
<PipelineNav activeStage={activeStage} onJump={go} />
```

- [ ] **Step 3: Un-skip the pipeline e2e test**

Edit `tests/e2e/homepage-carousel.spec.ts`: change `test.skip(` → `test(` for the pipeline test.

- [ ] **Step 4: Run e2e — all three pass**

Run: `npx playwright test homepage-carousel`
Expected: 3 pass, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/components/HomepageCarousel/PipelineNav.tsx \
        src/components/HomepageCarousel/PipelineNav.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): pipeline TOC nav jumps between mechanism stages"
```

---

## Task 3: Slide 1 (s2 — Input: 5 axes + question example)

**Files:**
- Create: `src/components/HomepageCarousel/slides/Slide2Input.tsx`
- Create: `src/components/HomepageCarousel/slides/Slide2Input.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Content source:** deck `index.html` lines 1217–1282 + JS `s2Examples` lines 1660–1666.

- [ ] **Step 1: Add e2e for slide 1 axis interactivity**

Append to `tests/e2e/homepage-carousel.spec.ts`:

```ts
test('slide 1 (入力): clicking axis B updates example question', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('axis-row-B').click();
  await expect(page.getByTestId('s2-example-q'))
    .toContainText('新しい補助金制度');
  await expect(page.getByTestId('axis-row-B')).toHaveAttribute('data-active', 'true');
});
```

- [ ] **Step 2: Run — fails**

Run: `npx playwright test homepage-carousel`
Expected: New test FAILS (`axis-row-B` not found).

- [ ] **Step 3: Implement Slide2Input**

Create `src/components/HomepageCarousel/slides/Slide2Input.tsx`:

```tsx
import { useState } from 'react';
import s from './Slide2Input.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';

const AXES: { key: AxisKey; name: string; poles: string }[] = [
  { key: 'A', name: '人との関わり方', poles: '制度・仕組み ⇄ 市民対話' },
  { key: 'B', name: '仕事の進め方',   poles: '政策立案 ⇄ 現場対応' },
  { key: 'C', name: '担う役割',       poles: 'ルール管理 ⇄ 市民支援' },
  { key: 'D', name: '変化への姿勢',   poles: '革新推進 ⇄ 安定運営' },
  { key: 'E', name: '知識のスタイル', poles: '専門追求 ⇄ 幅広対応' },
];

const EXAMPLES: Record<AxisKey, string> = {
  A: '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。',
  B: '新しい補助金制度を設計するため、複数の関連部署と調整しながら、政策骨子をまとめる。',
  C: '建築確認申請の書類を点検し、法令に沿っているか1件ずつ判断していく。',
  D: 'これまでの紙ベースの業務フローを見直し、デジタル化を提案・推進する。',
  E: '都市計画の専門知識を深めながら、長期的な街づくりの方針を組み立てる。',
};

const OPTIONS = [
  '自分には向いていないと思う',
  'あまり気が乗らないが、こなせる',
  'どちらとも言えない',
  'やりがいを感じながら取り組める',
  'まさに自分が輝ける場面',
];

export function Slide2Input() {
  const [active, setActive] = useState<AxisKey>('A');

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>5つの軸 × 20の質問</h2>
        <div className={s.stripe} />
        <div className={s.sub}>職員のタイプを5つの軸で測ります。</div>
      </header>
      <div className={s.grid}>
        <div className={s.axes}>
          {AXES.map((ax) => (
            <button
              key={ax.key}
              data-testid={`axis-row-${ax.key}`}
              data-active={active === ax.key ? 'true' : 'false'}
              className={`${s.row} ${s[`row${ax.key}`]} ${active === ax.key ? s.rowActive : ''}`}
              onClick={() => setActive(ax.key)}
            >
              <span className={`${s.pill} ${s[`pill${ax.key}`]}`}>{ax.key}</span>
              <span className={s.label}>
                <span className={s.name}>{ax.name}</span>
                <span className={s.poles}>{ax.poles}</span>
              </span>
              <span className={s.hint}>例題 ▶</span>
            </button>
          ))}
        </div>
        <div className={s.example}>
          <div className={s.exHead}>
            <div className={`${s.exPill} ${s[`pill${active}`]}`}>{active}</div>
            <div className={s.exLabel}>質問の例</div>
          </div>
          <p className={s.exQ} data-testid="s2-example-q">{EXAMPLES[active]}</p>
          <div className={s.options}>
            {OPTIONS.map((o, i) => <div key={i} className={s.option}>{o}</div>)}
          </div>
          <div className={s.foot}>全20問・約3分</div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/slides/Slide2Input.module.css`:

```css
.slide { display: flex; flex-direction: column; gap: var(--sp-lg); }

.head { display: flex; flex-direction: column; gap: 8px; }
.title {
  font-size: 32px; font-weight: var(--fw-bold);
  color: var(--hall-indigo); line-height: 1.2; margin: 0;
}
.stripe { height: 5px; width: 64px; background: var(--hall-indigo); }
.sub { font-size: 15px; color: var(--text-sec); }

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg);
}
@media (max-width: 800px) {
  .grid { grid-template-columns: 1fr; }
}

.axes { display: flex; flex-direction: column; gap: 10px; }
.row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: var(--card);
  border: 2px solid transparent;
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 200ms ease, transform 200ms ease;
}
.row:hover { transform: translateX(3px); }
.rowActive.rowA { border-color: var(--A); color: var(--A); }
.rowActive.rowB { border-color: var(--B); color: var(--B); }
.rowActive.rowC { border-color: var(--C); color: var(--C); }
.rowActive.rowD { border-color: var(--D); color: var(--D); }
.rowActive.rowE { border-color: var(--E); color: var(--E); }
.pill {
  padding: 5px 12px; border-radius: 999px;
  font-size: 11px; font-weight: var(--fw-bold);
  letter-spacing: 0.12em;
  flex-shrink: 0;
}
.pillA { background: var(--A-tint); color: var(--A); }
.pillB { background: var(--B-tint); color: var(--B); }
.pillC { background: var(--C-tint); color: var(--C); }
.pillD { background: var(--D-tint); color: var(--D); }
.pillE { background: var(--E-tint); color: var(--E); }
.label { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.name { font-size: 16px; font-weight: var(--fw-bold); color: var(--hall-indigo); }
.poles { font-size: 13px; color: var(--text-sec); }
.hint {
  font-size: 11px; font-weight: var(--fw-bold);
  letter-spacing: 0.08em;
  color: var(--sub);
  text-transform: uppercase;
  opacity: 0.7;
}
.rowActive .hint { opacity: 1; color: currentColor; }

.example {
  background: var(--bg);
  border-radius: var(--card-r);
  padding: var(--sp-lg);
  display: flex; flex-direction: column;
}
.exHead { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.exPill {
  padding: 5px 11px; border-radius: 999px;
  font-size: 11px; font-weight: var(--fw-bold);
  letter-spacing: 0.12em;
}
.exLabel {
  font-size: 12px; font-weight: var(--fw-bold);
  letter-spacing: 0.08em; color: var(--sub);
  text-transform: uppercase;
}
.exQ {
  font-size: 16px; line-height: 1.7; color: var(--text);
  margin: 0 0 var(--sp-md);
}
.options { display: flex; flex-direction: column; gap: 6px; }
.option {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px;
  color: var(--text);
  background: var(--card);
}
.foot {
  margin-top: var(--sp-md); padding-top: var(--sp-sm);
  font-size: 13px; color: var(--sub); text-align: center;
}
```

- [ ] **Step 4: Mount Slide2Input in carousel**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Replace the placeholder render with a slide-component map. Replace the slide-rendering block with:

```tsx
import { Slide2Input } from './slides/Slide2Input';
// later:

const SLIDES = [Slide2Input, Slide2Input, Slide2Input, Slide2Input, Slide2Input]; // temporary — Tasks 4–7 swap each
```

In JSX:

```tsx
{SLIDES.map((Comp, i) => (
  <div
    key={i}
    data-testid={`carousel-slide-${i + 1}`}
    data-active={i === idx ? 'true' : 'false'}
    className={s.slide}
    hidden={i !== idx}
  >
    <Comp />
  </div>
))}
```

(Real slides 2–5 replace these one at a time in Tasks 4–7. Using the same component as filler keeps tests honest about per-slide rendering — only slide 1 must show s2 content.)

Wait — that conflicts with tests that look for "5つの軸 × 20の質問" only on slide 1. Adjust: we need each slide to render distinct content. For Task 3, only slide 1 (idx 0) should show Slide2Input; idx 1–4 keep a temporary placeholder that will be replaced in Tasks 4–7.

Use this instead:

```tsx
import { Slide2Input } from './slides/Slide2Input';

function Placeholder({ n }: { n: number }) {
  return <h2>Slide {n} placeholder</h2>;
}

const slideRenderers: Array<() => JSX.Element> = [
  () => <Slide2Input />,
  () => <Placeholder n={2} />,
  () => <Placeholder n={3} />,
  () => <Placeholder n={4} />,
  () => <Placeholder n={5} />,
];
```

In JSX:

```tsx
{slideRenderers.map((render, i) => (
  <div
    key={i}
    data-testid={`carousel-slide-${i + 1}`}
    data-active={i === idx ? 'true' : 'false'}
    className={s.slide}
    hidden={i !== idx}
  >
    {render()}
  </div>
))}
```

- [ ] **Step 5: Run e2e — all pass**

Run: `npx playwright test homepage-carousel`
Expected: All tests pass (existing 3 + new slide-1 axis test).

- [ ] **Step 6: Commit**

```bash
git add src/components/HomepageCarousel/slides/Slide2Input.tsx \
        src/components/HomepageCarousel/slides/Slide2Input.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel slide 1 — 5 axes + interactive question example"
```

---

## Task 4: Slide 2 (s3 — Scoring: 4 questions → axis score needle)

**Files:**
- Create: `src/components/HomepageCarousel/slides/Slide3Scoring.tsx`
- Create: `src/components/HomepageCarousel/slides/Slide3Scoring.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Content source:** deck lines 1285–1332 + JS `s3Questions`/`s3Options` lines 1687–1745. Position scale 0..4 (0 = lowest, 4 = highest), 4 questions [4, 3, 1, 2] avg = 2.5 → 62.5% from minus-end.

- [ ] **Step 1: Add e2e for scoring slide**

Append to `tests/e2e/homepage-carousel.spec.ts`:

```ts
test('slide 2 (採点): clicking question A2 updates the right-panel question', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await page.getByTestId('s3-q-1').click();
  await expect(page.getByTestId('s3-right-q')).toContainText('地域のサークル活動');
});
```

- [ ] **Step 2: Run — fails (`s3-q-1` not found)**

- [ ] **Step 3: Implement Slide3Scoring**

Create `src/components/HomepageCarousel/slides/Slide3Scoring.tsx`:

```tsx
import { useState } from 'react';
import s from './Slide3Scoring.module.css';

const QUESTIONS = [
  { q: '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。', chosen: 4, label: '窓口で介護申請を支援' },
  { q: '地域のサークル活動の場で、参加者の声を直接聞きながら新しい企画を一緒に考える。',                  chosen: 3, label: '地域サークルで対話' },
  { q: '部署の業務フローを設計し、誰がいつ何をするかを文書化して整える。',                          chosen: 1, label: '業務フローを設計' },
  { q: '財政データを分析し、長期的な収支のトレンドからリスクを洗い出す。',                          chosen: 2, label: '財政データを分析' },
];

const OPTIONS = [
  '自分には向いていないと思う',
  'あまり気が乗らないが、こなせる',
  'どちらとも言えない',
  'やりがいを感じながら取り組める',
  'まさに自分が輝ける場面',
];

const AVG_PCT = (QUESTIONS.reduce((a, b) => a + b.chosen, 0) / QUESTIONS.length / 4) * 100; // 62.5

export function Slide3Scoring() {
  const [active, setActive] = useState(0);
  const fillLeft = AVG_PCT >= 50 ? 50 : AVG_PCT;
  const fillWidth = Math.abs(AVG_PCT - 50);

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>回答が軸スコアに変わる</h2>
        <div className={s.stripe} />
        <div className={s.sub}>各軸に寄与する質問の回答をまとめて、軸スコアを算出します。</div>
      </header>
      <div className={s.body}>
        <div className={s.left}>
          {QUESTIONS.map((q, i) => (
            <button
              key={i}
              data-testid={`s3-q-${i}`}
              className={`${s.q} ${active === i ? s.qActive : ''}`}
              onClick={() => setActive(i)}
            >
              <span className={s.qLabel}>A{i + 1}</span>
              <span className={s.qText}>{q.label}</span>
              <span className={s.qPos}>
                {[0, 1, 2, 3, 4].map((p) => (
                  <span key={p} className={`${s.dot} ${p === q.chosen ? s.dotFill : ''}`} />
                ))}
              </span>
            </button>
          ))}
          <div className={s.arrow}>▼ 集計</div>
          <div className={s.result}>
            <span className={s.resPill}>人との関わり方</span>
            <div className={s.needle}>
              <span className={s.needleEnd}>仕組み</span>
              <span className={s.scale}>
                <span
                  className={s.scaleFill}
                  style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
                />
              </span>
              <span className={s.needleEnd}>対話</span>
            </div>
          </div>
        </div>
        <div className={s.right}>
          <div className={s.rightHead}>
            <div className={s.rightPill}>A{active + 1}</div>
            <div className={s.rightLabel}>回答内容</div>
          </div>
          <p className={s.rightQ} data-testid="s3-right-q">{QUESTIONS[active].q}</p>
          <div className={s.rightOptions}>
            {OPTIONS.map((o, i) => (
              <div key={i} className={`${s.rightOption} ${i === QUESTIONS[active].chosen ? s.rightOptionChosen : ''}`}>
                <span>{o}</span>
                <span className={s.check} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/slides/Slide3Scoring.module.css`:

```css
.slide { display: flex; flex-direction: column; gap: var(--sp-lg); }
.head { display: flex; flex-direction: column; gap: 8px; }
.title { font-size: 32px; font-weight: var(--fw-bold); color: var(--hall-indigo); margin: 0; line-height: 1.2; }
.stripe { height: 5px; width: 64px; background: var(--A); }
.sub { font-size: 15px; color: var(--text-sec); }

.body {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: var(--sp-lg); align-items: center;
}
@media (max-width: 800px) { .body { grid-template-columns: 1fr; } }

.left { display: flex; flex-direction: column; gap: 10px; }
.q {
  display: flex; align-items: center; gap: 12px;
  background: var(--card); padding: 12px 16px;
  border-radius: 12px; box-shadow: var(--card-shadow);
  border: 2px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 200ms ease, transform 200ms ease;
}
.q:hover { transform: translateX(3px); }
.qActive { border-color: var(--A); }
.qLabel {
  font-weight: var(--fw-bold); min-width: 32px; color: var(--A);
  font-size: 12px; letter-spacing: 0.08em;
}
.qText { flex: 1; font-size: 14px; color: var(--text); }
.qPos { display: flex; align-items: center; gap: 5px; }
.dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--border);
  transition: background 200ms ease, transform 200ms ease;
}
.dotFill { background: var(--A-mid); transform: scale(1.3); }

.arrow {
  text-align: center; font-size: 14px; font-weight: var(--fw-bold);
  color: var(--sub); margin: 6px 0; letter-spacing: 0.08em;
}
.result {
  background: var(--A); color: white;
  border-radius: 12px; padding: 16px 20px;
  display: flex; align-items: center; gap: 14px;
  box-shadow: 0 4px 18px rgba(192, 57, 43, 0.22);
}
.resPill {
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 12px; border-radius: 999px;
  font-size: 12px; font-weight: var(--fw-bold);
  letter-spacing: 0.1em;
}
.needle { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.needleEnd { font-size: 12px; opacity: 0.85; letter-spacing: 0.05em; }
.scale {
  width: 140px; height: 5px; background: rgba(255, 255, 255, 0.25);
  border-radius: 3px; position: relative;
}
.scale::before {
  content: ''; position: absolute;
  left: 50%; top: -2px; bottom: -2px;
  width: 1px; background: rgba(255, 255, 255, 0.5);
}
.scaleFill {
  position: absolute; top: 0; bottom: 0;
  border-radius: 3px; background: white;
  transition: left 320ms ease, width 320ms ease;
}

.right {
  background: var(--bg); border-radius: var(--card-r);
  padding: var(--sp-lg);
  display: flex; flex-direction: column;
}
.rightHead { display: flex; align-items: center; gap: 10px; margin-bottom: var(--sp-md); }
.rightPill {
  padding: 5px 11px; border-radius: 999px;
  background: var(--A-tint); color: var(--A);
  font-size: 11px; font-weight: var(--fw-bold); letter-spacing: 0.1em;
}
.rightLabel {
  font-size: 11px; font-weight: var(--fw-bold);
  color: var(--sub); letter-spacing: 0.08em; text-transform: uppercase;
}
.rightQ { font-size: 14px; line-height: 1.7; color: var(--text); margin: 0 0 var(--sp-md); }
.rightOptions { display: flex; flex-direction: column; gap: 6px; }
.rightOption {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 13px; color: var(--text-sec);
  background: var(--card);
  display: flex; justify-content: space-between; align-items: center;
  transition: all 200ms ease;
}
.rightOptionChosen {
  border-color: var(--A); background: var(--A-tint);
  color: var(--A); font-weight: var(--fw-bold);
}
.check {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid var(--border); flex-shrink: 0;
}
.rightOptionChosen .check {
  background: var(--A); border-color: var(--A); position: relative;
}
.rightOptionChosen .check::after {
  content: ''; position: absolute;
  left: 4px; top: 1px; width: 4px; height: 7px;
  border: solid white; border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
```

- [ ] **Step 4: Mount Slide3Scoring in carousel**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Update import + slideRenderers index 1:

```tsx
import { Slide3Scoring } from './slides/Slide3Scoring';
// ...
const slideRenderers: Array<() => JSX.Element> = [
  () => <Slide2Input />,
  () => <Slide3Scoring />,
  () => <Placeholder n={3} />,
  () => <Placeholder n={4} />,
  () => <Placeholder n={5} />,
];
```

- [ ] **Step 5: Run e2e**

Run: `npx playwright test homepage-carousel`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomepageCarousel/slides/Slide3Scoring.tsx \
        src/components/HomepageCarousel/slides/Slide3Scoring.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel slide 2 — interactive scoring panel"
```

---

## Task 5: Slide 3 (s4 — Comparison: user vs department, match meter)

**Files:**
- Create: `src/components/HomepageCarousel/slides/Slide4Comparison.tsx`
- Create: `src/components/HomepageCarousel/slides/Slide4Comparison.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Content source:** deck lines 1335–1392 + JS `s4Vals` lines 1762–1786. user/dept values per axis A..E, MAX = 2.0, scale to 0..50% from center.

- [ ] **Step 1: Add e2e for slide 3**

Append to `tests/e2e/homepage-carousel.spec.ts`:

```ts
test('slide 3 (比較): renders 5 comparison bars and 73% match', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('carousel-dot-3').click();
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('s4-bar-A')).toBeVisible();
  await expect(page.getByTestId('s4-bar-E')).toBeVisible();
  await expect(page.getByTestId('s4-pct')).toContainText('73');
});
```

- [ ] **Step 2: Run — fails**

- [ ] **Step 3: Implement Slide4Comparison**

Create `src/components/HomepageCarousel/slides/Slide4Comparison.tsx`:

```tsx
import s from './Slide4Comparison.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';
const MAX = 2.0;

const BARS: { key: AxisKey; lo: string; hi: string; user: number; dept: number; delta: string }[] = [
  { key: 'A', lo: '制度・仕組み', hi: '市民対話', user: 0.6,  dept: 2.0, delta: 'Δ 1.4' },
  { key: 'B', lo: '政策立案',     hi: '現場対応', user: -1.0, dept: 0.5, delta: 'Δ 1.5' },
  { key: 'C', lo: 'ルール管理',   hi: '市民支援', user: 1.2,  dept: 2.0, delta: 'Δ 0.8' },
  { key: 'D', lo: '革新推進',     hi: '安定運営', user: 0.2,  dept: 0.5, delta: 'Δ 0.3' },
  { key: 'E', lo: '専門追求',     hi: '幅広対応', user: 0.4,  dept: 0.5, delta: 'Δ 0.1' },
];

function fillStyle(val: number) {
  const pct = (Math.abs(val) / MAX) * 50;
  return val >= 0
    ? { left: '50%', width: `${pct}%` }
    : { left: `${50 - pct}%`, width: `${pct}%` };
}

export function Slide4Comparison() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>受検者 vs 103部署</h2>
        <div className={s.stripe} />
        <div className={s.sub}>5軸のパターンを部署ごとに比較し、最も近い部署を見つけます。</div>
      </header>
      <div className={s.body}>
        <div className={s.card}>
          <div className={s.cardHead}>
            <h3>受検者 vs <strong>地域福祉課</strong>（理想パターン）</h3>
            <div className={s.legend}>
              <span><span className={s.swatch} />受検者</span>
              <span><span className={`${s.swatch} ${s.swatchDept}`} />部署理想</span>
            </div>
          </div>
          <div className={s.bars}>
            {BARS.map((b) => (
              <div
                key={b.key}
                data-testid={`s4-bar-${b.key}`}
                className={`${s.bar} ${s[`bar${b.key}`]}`}
              >
                <span className={`${s.pole} ${s.poleLo}`}>{b.lo}</span>
                <span className={s.track}>
                  <span className={s.fillDept} style={fillStyle(b.dept)} />
                  <span className={s.fillUser} style={fillStyle(b.user)} />
                </span>
                <span className={`${s.pole} ${s.poleHi}`}>{b.hi}</span>
                <span className={s.delta}>{b.delta}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={s.match}>
          <span className={s.matchLabel}>適合度</span>
          <div className={s.meterWrap}>
            <div className={s.meter}><span className={s.meterFill} style={{ width: '73%' }} /></div>
            <div className={s.ticks}><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
          <span className={s.pct} data-testid="s4-pct">73%</span>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/slides/Slide4Comparison.module.css`:

```css
.slide { display: flex; flex-direction: column; gap: var(--sp-lg); }
.head { display: flex; flex-direction: column; gap: 8px; }
.title { font-size: 32px; font-weight: var(--fw-bold); color: var(--hall-indigo); margin: 0; line-height: 1.2; }
.stripe { height: 5px; width: 64px; background: var(--hall-indigo); }
.sub { font-size: 15px; color: var(--text-sec); }

.body { display: flex; flex-direction: column; gap: var(--sp-md); }

.card {
  background: var(--card); border-radius: var(--card-r);
  box-shadow: var(--card-shadow); padding: var(--sp-lg);
}
.cardHead {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: var(--sp-md);
  flex-wrap: wrap; gap: 8px;
}
.cardHead h3 { margin: 0; font-size: 16px; color: var(--hall-indigo); font-weight: var(--fw-bold); }
.legend { display: flex; gap: 18px; font-size: 12px; color: var(--text-sec); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.swatch { width: 14px; height: 10px; border-radius: 2px; background: var(--hall-indigo); }
.swatchDept { background: transparent; border: 2px dashed var(--text-sec); }

.bars { display: flex; flex-direction: column; gap: 10px; }
.bar {
  display: grid;
  grid-template-columns: 96px 1fr 96px 56px;
  gap: 12px; align-items: center;
}
.barA { color: var(--A-mid); }
.barB { color: var(--B-mid); }
.barC { color: var(--C-mid); }
.barD { color: var(--D-mid); }
.barE { color: var(--E-mid); }
.pole { font-size: 12px; font-weight: var(--fw-bold); color: var(--text); }
.poleLo { text-align: right; }
.poleHi { text-align: left; }
.barA .pole { color: var(--A); }
.barB .pole { color: var(--B); }
.barC .pole { color: var(--C); }
.barD .pole { color: var(--D); }
.barE .pole { color: var(--E); }
.track {
  position: relative;
  height: 14px;
  background: var(--border-light);
  border-radius: 7px;
}
.track::before {
  content: ''; position: absolute;
  left: 50%; top: -3px; bottom: -3px;
  width: 1px; background: var(--sub); opacity: 0.4;
}
.fillDept {
  position: absolute; top: 0; bottom: 0;
  border-radius: 7px;
  border: 2px dashed currentColor;
  background: transparent;
  opacity: 0.7; z-index: 1;
}
.fillUser {
  position: absolute; top: 0; bottom: 0;
  border-radius: 7px;
  background: currentColor;
  z-index: 2;
}
.delta {
  font-size: 13px; font-weight: var(--fw-bold);
  color: var(--text-sec); text-align: right;
  font-variant-numeric: tabular-nums;
}

.match {
  padding: var(--sp-md) var(--sp-lg);
  background: var(--hall-indigo); color: white;
  border-radius: 14px;
  display: grid; grid-template-columns: auto 1fr auto;
  gap: var(--sp-lg); align-items: center;
}
.matchLabel { font-size: 14px; font-weight: var(--fw-bold); letter-spacing: 0.04em; }
.pct {
  font-size: 40px; font-weight: var(--fw-black);
  letter-spacing: -0.02em; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.meterWrap { display: flex; flex-direction: column; gap: 6px; }
.meter {
  height: 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  position: relative; overflow: hidden;
}
.meterFill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: white; border-radius: 4px;
}
.ticks {
  display: flex; justify-content: space-between;
  font-size: 10px; font-weight: var(--fw-bold);
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.7);
}
```

- [ ] **Step 4: Mount Slide4Comparison in carousel**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Add import + replace slideRenderers index 2:

```tsx
import { Slide4Comparison } from './slides/Slide4Comparison';
// ...
const slideRenderers: Array<() => JSX.Element> = [
  () => <Slide2Input />,
  () => <Slide3Scoring />,
  () => <Slide4Comparison />,
  () => <Placeholder n={4} />,
  () => <Placeholder n={5} />,
];
```

- [ ] **Step 5: Run e2e**

Run: `npx playwright test homepage-carousel`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomepageCarousel/slides/Slide4Comparison.tsx \
        src/components/HomepageCarousel/slides/Slide4Comparison.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel slide 3 — user vs department comparison"
```

---

## Task 6: Slide 4 (s5 — Result components: 3 cards)

**Files:**
- Create: `src/components/HomepageCarousel/slides/Slide5Result.tsx`
- Create: `src/components/HomepageCarousel/slides/Slide5Result.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Content source:** deck lines 1395–1481.

- [ ] **Step 1: Add e2e**

Append to `tests/e2e/homepage-carousel.spec.ts`:

```ts
test('slide 4 (結果): renders three result-component cards', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('carousel-dot-4').click();
  await expect(page.getByText('アーキタイプ', { exact: true })).toBeVisible();
  await expect(page.getByText('部署ランキング')).toBeVisible();
  await expect(page.getByText('プロファイル')).toBeVisible();
  await expect(page.getByText('街のよろず屋')).toBeVisible();
});
```

- [ ] **Step 2: Run — fails**

- [ ] **Step 3: Implement Slide5Result**

Create `src/components/HomepageCarousel/slides/Slide5Result.tsx`:

```tsx
import s from './Slide5Result.module.css';

export function Slide5Result() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>結果に含まれる3つの要素</h2>
        <div className={s.stripe} />
        <div className={s.sub}>受検者は、自身のアーキタイプ・適合部署のランキング・5軸プロファイルを得る。</div>
      </header>
      <div className={s.body}>
        {/* Card 1: archetype */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>アーキタイプ</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>32種類</span>
              <span className={s.cardNote}>／ 5軸の組み合わせ</span>
            </div>
          </div>
          <p className={s.cardPara}>
            回答結果から、受検者は<strong>1つのアーキタイプ</strong>に分類される。
            5軸それぞれで2極のうち1つが選ばれ、5文字コードでタイプが決まる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例</div>
            <div className={s.archChips}>
              <span>D</span><span>A</span><span>S</span><span>C</span><span>G</span>
            </div>
            <h4 className={s.archName}>街のよろず屋<small>型</small></h4>
            <div className={s.archDesc}>市民に寄り添いながら現場を駆け回り、幅広く対応できる万能タイプ。</div>
          </div>
        </div>

        {/* Card 2: ranking */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>部署ランキング</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>103部署</span>
              <span className={s.cardNote}>／ 適合度順</span>
            </div>
          </div>
          <p className={s.cardPara}>
            横須賀市役所の<strong>全103部署</strong>が適合度順にランクづけされる。
            上位だけでなく下位も確認でき、「なぜ向かないのか」も含めて自己理解につながる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例：上位</div>
            <div className={s.exRank}>
              <span className={s.rankPos}>1</span>
              <span className={s.rankName}>教職員課</span>
              <span className={s.rankPct}>88.8%</span>
            </div>
            <div className={s.exRankFoot}>
              <span>上位 3 / 103 部署</span>
              <span>下位は 18.4%（監査委員事務局）</span>
            </div>
          </div>
        </div>

        {/* Card 3: profile */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>プロファイル</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>5軸</span>
              <span className={s.cardNote}>／ あなたの傾向</span>
            </div>
          </div>
          <p className={s.cardPara}>
            <strong>5軸ごとに自分の傾向</strong>が可視化される。
            どの軸が強いか・弱いかを一目で把握でき、軸ごとの伸びしろもわかる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例：人との関わり方</div>
            <div className={s.exBar}>
              <div className={s.exBarHead}>
                <span className={s.exBarPct}>65%</span>
                <span className={s.exBarWin}>市民対話</span>
              </div>
              <div className={s.exBarRow}>
                <span className={s.exBarEnd}>機</span>
                <div className={s.exBarTrack}>
                  <span className={s.exBarDot} style={{ left: '65%' }} />
                </div>
                <span className={s.exBarEnd}>人</span>
              </div>
            </div>
            <div className={s.exBarFoot}>
              制度・仕組みより市民との対話を重視する傾向。残り4軸も同様に表示される。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/slides/Slide5Result.module.css`:

```css
.slide { display: flex; flex-direction: column; gap: var(--sp-lg); }
.head { display: flex; flex-direction: column; gap: 8px; }
.title { font-size: 32px; font-weight: var(--fw-bold); color: var(--hall-indigo); margin: 0; line-height: 1.2; }
.stripe { height: 5px; width: 64px; background: var(--hall-indigo); }
.sub { font-size: 15px; color: var(--text-sec); }

.body {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  gap: var(--sp-md); align-items: stretch;
}
@media (max-width: 900px) { .body { grid-template-columns: 1fr; } }

.card {
  background: var(--card); border-radius: var(--card-r);
  box-shadow: var(--card-shadow); padding: var(--sp-lg);
  display: flex; flex-direction: column; gap: var(--sp-md);
}
.cardHead {
  display: flex; flex-direction: column; gap: 4px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 14px;
}
.cardLabel {
  font-size: 18px; font-weight: var(--fw-black);
  color: var(--hall-indigo); line-height: 1.1;
  letter-spacing: -0.01em;
}
.cardMeta { display: flex; align-items: baseline; gap: 6px; }
.cardNum {
  font-size: 16px; font-weight: var(--fw-black);
  color: var(--text-sec); letter-spacing: -0.01em;
  line-height: 1; font-variant-numeric: tabular-nums;
}
.cardNote {
  font-size: 11px; font-weight: var(--fw-bold);
  color: var(--sub); letter-spacing: 0.04em;
}
.cardPara { font-size: 13px; line-height: 1.85; color: var(--text-sec); margin: 0; }
.cardPara strong { font-weight: var(--fw-bold); color: var(--text); }

.cardEx {
  margin-top: auto;
  padding: var(--sp-md);
  background: var(--bg);
  border-radius: 12px;
  display: flex; flex-direction: column; gap: 12px;
  position: relative;
}
.exEyebrow {
  display: inline-block; align-self: flex-start;
  font-size: 9px; font-weight: var(--fw-black);
  letter-spacing: 0.18em; color: white;
  background: var(--hall-indigo);
  text-transform: uppercase;
  padding: 4px 10px; border-radius: 999px;
}

/* archetype chips */
.archChips { display: flex; gap: 4px; }
.archChips span {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: var(--fw-black);
  color: white; font-family: ui-monospace, Menlo, monospace;
}
.archChips span:nth-child(1) { background: var(--A); }
.archChips span:nth-child(2) { background: var(--B); }
.archChips span:nth-child(3) { background: var(--C); }
.archChips span:nth-child(4) { background: var(--D); }
.archChips span:nth-child(5) { background: var(--E); }
.archName {
  font-size: 22px; font-weight: var(--fw-black);
  color: var(--hall-indigo); line-height: 1.15; margin: 0;
}
.archName small {
  font-size: 13px; font-weight: var(--fw-bold);
  color: var(--text-sec); margin-left: 4px;
}
.archDesc { font-size: 12px; line-height: 1.7; color: var(--text-sec); margin: 0; }

/* ranking example */
.exRank {
  display: grid;
  grid-template-columns: 28px 1fr 60px;
  gap: 10px; align-items: center;
  padding: 12px 14px;
  background: linear-gradient(90deg, rgba(76, 175, 125, 0.22), white);
  border: 1.5px solid var(--C-mid);
  border-radius: 10px;
}
.rankPos {
  font-weight: var(--fw-black); color: var(--C);
  font-size: 18px; text-align: center;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.rankName { font-weight: var(--fw-bold); color: var(--text); font-size: 14px; }
.rankPct {
  font-weight: var(--fw-black); color: var(--C);
  font-variant-numeric: tabular-nums; text-align: right;
  font-size: 16px; letter-spacing: -0.01em;
}
.exRankFoot {
  display: flex; flex-direction: column; gap: 2px;
  font-size: 11px; line-height: 1.5; color: var(--text-sec);
}
.exRankFoot span:first-child { font-weight: var(--fw-bold); color: var(--text); }

/* profile bar example */
.exBar { display: flex; flex-direction: column; gap: 6px; }
.exBarHead { display: flex; align-items: baseline; gap: 8px; }
.exBarPct { font-size: 16px; font-weight: var(--fw-black); color: var(--A); font-variant-numeric: tabular-nums; }
.exBarWin { font-size: 12px; font-weight: var(--fw-bold); color: var(--A); }
.exBarRow { display: flex; align-items: center; gap: 8px; }
.exBarEnd { width: 22px; flex-shrink: 0; font-size: 11px; color: var(--sub); text-align: center; font-weight: var(--fw-bold); }
.exBarTrack { position: relative; flex: 1; height: 8px; border-radius: 999px; background: var(--A-mid); }
.exBarDot {
  position: absolute; top: 50%;
  transform: translate(-50%, -50%);
  width: 14px; height: 14px;
  border-radius: 50%; background: white;
  border: 3px solid var(--A);
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.exBarFoot { font-size: 11px; line-height: 1.6; color: var(--text-sec); }
```

- [ ] **Step 4: Mount Slide5Result in carousel**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Add import + replace slideRenderers index 3:

```tsx
import { Slide5Result } from './slides/Slide5Result';
// ...
const slideRenderers: Array<() => JSX.Element> = [
  () => <Slide2Input />,
  () => <Slide3Scoring />,
  () => <Slide4Comparison />,
  () => <Slide5Result />,
  () => <Placeholder n={5} />,
];
```

- [ ] **Step 5: Run e2e**

Run: `npx playwright test homepage-carousel`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomepageCarousel/slides/Slide5Result.tsx \
        src/components/HomepageCarousel/slides/Slide5Result.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel slide 4 — three result-component cards"
```

---

## Task 7: Slide 5 (s6 — Example result: archetype card + ranking)

**Files:**
- Create: `src/components/HomepageCarousel/slides/Slide6Example.tsx`
- Create: `src/components/HomepageCarousel/slides/Slide6Example.module.css`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

**Content source:** deck lines 1484–1584.

- [ ] **Step 1: Add e2e**

Append to `tests/e2e/homepage-carousel.spec.ts`:

```ts
test('slide 5 (例): archetype card + 7-row ranking visible', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('carousel-dot-5').click();
  await expect(page.getByTestId('carousel-slide-5')).toHaveAttribute('data-active', 'true');
  await expect(page.getByText('DASCG', { exact: true })).toBeVisible();
  await expect(page.getByText('教職員課')).toBeVisible();
  await expect(page.getByText('健康総務課')).toBeVisible();
  // remove placeholder check from earlier scaffolding
});
```

- [ ] **Step 2: Run — fails**

- [ ] **Step 3: Implement Slide6Example**

Create `src/components/HomepageCarousel/slides/Slide6Example.tsx`:

```tsx
import s from './Slide6Example.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';
const TRAITS: { key: AxisKey; pct: number; win: string; lo: string; hi: string }[] = [
  { key: 'A', pct: 65, win: '市民対話', lo: '機', hi: '人' },
  { key: 'B', pct: 75, win: '現場対応', lo: '策', hi: '動' },
  { key: 'C', pct: 80, win: '市民支援', lo: '律', hi: '援' },
  { key: 'D', pct: 70, win: '安定運営', lo: '革', hi: '守' },
  { key: 'E', pct: 85, win: '幅広対応', lo: '専', hi: '幅' },
];

const RANKING = [
  { pos: 1, name: '教職員課',     pct: '88.8%', top: true },
  { pos: 2, name: '健康総務課',   pct: '87.5%', top: false },
  { pos: 3, name: '子育て支援課', pct: '84.3%', top: false },
  { pos: 4, name: '市民相談課',   pct: '82.0%', top: false },
  { pos: 5, name: '障害福祉課',   pct: '80.7%', top: false },
  { pos: 6, name: '高齢福祉課',   pct: '79.2%', top: false },
  { pos: 7, name: '地域安全課',   pct: '77.5%', top: false },
];

export function Slide6Example() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>受検者の結果（例）</h2>
        <div className={s.stripe} />
        <div className={s.sub}>DASCG 型の受検者が見る画面の構成。</div>
      </header>
      <div className={s.body}>
        <div className={s.archetype}>
          <div className={s.archEyebrow}>あなたのタイプ</div>
          <h3 className={s.archName}>街のよろず屋<small>型</small></h3>
          <div className={s.archCode}>DASCG</div>
          <p className={s.archDesc}>
            市民に寄り添いながら現場を駆け回り、幅広く対応できる万能タイプ。窓口でも地域でも「あの人に聞けば大丈夫」と頼られる存在です。
          </p>
          <div className={s.profile}>
            <div className={s.ph}>5軸プロファイル</div>
            {TRAITS.map((t) => (
              <div key={t.key} className={`${s.trait} ${s[`trait${t.key}`]}`}>
                <div className={s.traitHead}>
                  <span className={s.traitPct}>{t.pct}%</span>
                  <span className={s.traitWin}>{t.win}</span>
                </div>
                <div className={s.traitRow}>
                  <span className={s.traitEnd}>{t.lo}</span>
                  <div className={s.traitTrack}>
                    <span className={s.traitDot} style={{ left: `${t.pct}%` }} />
                  </div>
                  <span className={s.traitEnd}>{t.hi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.rankCard}>
          <h3 className={s.rankTitle}>あなたに合う部署</h3>
          <div className={s.rankSub}>適合度ランキング（103部署中）</div>
          <div className={s.rankList}>
            {RANKING.map((r) => (
              <div key={r.pos} className={`${s.rankItem} ${r.top ? s.rankItemTop : ''}`}>
                <span className={s.rankPos}>{r.pos}</span>
                <span className={s.rankName}>{r.name}</span>
                <span className={s.rankPct}>{r.pct}</span>
              </div>
            ))}
          </div>
          <div className={s.rankFoot}>⋯ 全103部署を確認可能 ⋯</div>
        </div>
      </div>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/slides/Slide6Example.module.css`:

```css
.slide { display: flex; flex-direction: column; gap: var(--sp-lg); }
.head { display: flex; flex-direction: column; gap: 8px; }
.title { font-size: 32px; font-weight: var(--fw-bold); color: var(--hall-indigo); margin: 0; line-height: 1.2; }
.stripe { height: 5px; width: 64px; background: var(--hall-indigo); }
.sub { font-size: 15px; color: var(--text-sec); }

.body {
  display: grid; grid-template-columns: 1.15fr 0.85fr;
  gap: var(--sp-md);
}
@media (max-width: 800px) { .body { grid-template-columns: 1fr; } }

.archetype {
  background: var(--card); border-radius: var(--card-r);
  box-shadow: var(--card-shadow);
  padding: var(--sp-lg);
  display: flex; flex-direction: column; gap: 14px;
}
.archEyebrow {
  font-size: 10px; font-weight: var(--fw-bold);
  letter-spacing: 0.18em; color: var(--sub);
  text-transform: uppercase;
}
.archName {
  font-size: 28px; font-weight: var(--fw-black);
  color: var(--hall-indigo); line-height: 1.15; margin: 0;
}
.archName small {
  font-size: 14px; font-weight: var(--fw-bold);
  color: var(--text-sec); margin-left: 5px;
}
.archCode {
  font-size: 11px; font-weight: var(--fw-bold);
  color: var(--sub); letter-spacing: 0.24em;
  font-family: ui-monospace, Menlo, monospace;
  margin-top: -6px;
}
.archDesc { font-size: 13px; line-height: 1.7; color: var(--text-sec); margin: 0; }

.profile {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border-light);
}
.ph {
  font-size: 10px; font-weight: var(--fw-bold);
  letter-spacing: 0.14em; color: var(--sub);
  text-transform: uppercase; margin-bottom: 2px;
}
.trait { display: flex; flex-direction: column; gap: 3px; }
.traitHead { display: flex; align-items: baseline; gap: 8px; }
.traitPct { font-size: 13px; font-weight: var(--fw-black); font-variant-numeric: tabular-nums; }
.traitWin { font-size: 11px; font-weight: var(--fw-bold); }
.traitRow { display: flex; align-items: center; gap: 8px; }
.traitEnd {
  width: 22px; flex-shrink: 0;
  font-size: 11px; color: var(--sub);
  text-align: center; font-weight: var(--fw-bold);
}
.traitTrack { position: relative; flex: 1; height: 8px; border-radius: 999px; }
.traitDot {
  position: absolute; top: 50%;
  transform: translate(-50%, -50%);
  width: 12px; height: 12px;
  border-radius: 50%; background: white;
  border: 2.5px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,.18);
  z-index: 2;
}
.traitA .traitPct, .traitA .traitWin { color: var(--A); }
.traitA .traitTrack { background: var(--A-mid); }
.traitA .traitDot { border-color: var(--A); }
.traitB .traitPct, .traitB .traitWin { color: var(--B); }
.traitB .traitTrack { background: var(--B-mid); }
.traitB .traitDot { border-color: var(--B); }
.traitC .traitPct, .traitC .traitWin { color: var(--C); }
.traitC .traitTrack { background: var(--C-mid); }
.traitC .traitDot { border-color: var(--C); }
.traitD .traitPct, .traitD .traitWin { color: var(--D); }
.traitD .traitTrack { background: var(--D-mid); }
.traitD .traitDot { border-color: var(--D); }
.traitE .traitPct, .traitE .traitWin { color: var(--E); }
.traitE .traitTrack { background: var(--E-mid); }
.traitE .traitDot { border-color: var(--E); }

.rankCard {
  background: var(--card); border-radius: var(--card-r);
  box-shadow: var(--card-shadow);
  padding: var(--sp-lg);
  display: flex; flex-direction: column;
}
.rankTitle { margin: 0 0 4px; font-size: 16px; color: var(--hall-indigo); font-weight: var(--fw-bold); }
.rankSub {
  font-size: 11px; color: var(--sub);
  margin-bottom: 14px; letter-spacing: 0.04em;
}
.rankList { display: flex; flex-direction: column; gap: 6px; }
.rankItem {
  display: grid;
  grid-template-columns: 26px 1fr 64px;
  gap: 10px; align-items: center;
  padding: 8px 12px;
  background: var(--bg);
  border-radius: 8px;
}
.rankItemTop {
  background: linear-gradient(90deg, rgba(76, 175, 125, 0.18), var(--bg));
  border: 1px solid var(--C-mid);
}
.rankPos {
  font-weight: var(--fw-black); color: var(--text-sec);
  font-size: 14px; font-variant-numeric: tabular-nums;
}
.rankItemTop .rankPos { color: var(--C); }
.rankName { font-weight: var(--fw-bold); color: var(--text); font-size: 13px; }
.rankPct {
  font-weight: var(--fw-black); color: var(--hall-indigo);
  font-variant-numeric: tabular-nums;
  font-size: 14px; text-align: right;
}
.rankFoot {
  margin-top: 14px; padding-top: 10px;
  border-top: 1px solid var(--border-light);
  text-align: center; font-size: 11px; color: var(--sub);
}
```

- [ ] **Step 4: Mount Slide6Example, remove placeholder**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Add import + replace slideRenderers index 4. Then remove the `Placeholder` helper (no longer used):

```tsx
import { Slide6Example } from './slides/Slide6Example';
// ...
const slideRenderers: Array<() => JSX.Element> = [
  () => <Slide2Input />,
  () => <Slide3Scoring />,
  () => <Slide4Comparison />,
  () => <Slide5Result />,
  () => <Slide6Example />,
];
```

Delete the `function Placeholder({ n }: { n: number })` definition.

- [ ] **Step 5: Run e2e + reducer tests + lint + typecheck**

Run all of:

```
npx playwright test homepage-carousel
npm test
npm run lint
npm run build
```

Expected: All pass. `npm run build` runs `tsc -b && vite build`, so type errors will surface here.

- [ ] **Step 6: Commit**

```bash
git add src/components/HomepageCarousel/slides/Slide6Example.tsx \
        src/components/HomepageCarousel/slides/Slide6Example.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel slide 5 — example archetype + ranking result"
```

---

## Task 8: Touch swipe nav

**Files:**
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `tests/e2e/homepage-carousel.spec.ts`

- [ ] **Step 1: Add e2e for swipe**

Append:

```ts
test('homepage carousel: horizontal swipe advances slide', async ({ page }) => {
  await page.goto('/');
  const viewport = page.locator('[data-testid="carousel-viewport"]');
  const box = await viewport.boundingBox();
  if (!box) throw new Error('viewport not found');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // swipe left ⇒ next slide
  await page.mouse.move(cx + 80, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 80, cy, { steps: 12 });
  await page.mouse.up();

  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
});
```

- [ ] **Step 2: Run — fails (`carousel-viewport` testid missing or no swipe logic)**

- [ ] **Step 3: Add swipe logic + viewport testid**

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`. Add a `useRef` for the viewport element + pointer handlers. Update viewport JSX:

```tsx
import { useEffect, useRef, useState } from 'react';

// inside component:
const startX = useRef<number | null>(null);
const onPointerDown = (e: React.PointerEvent) => { startX.current = e.clientX; };
const onPointerUp = (e: React.PointerEvent) => {
  if (startX.current === null) return;
  const dx = e.clientX - startX.current;
  startX.current = null;
  const THRESHOLD = 60;
  if (dx <= -THRESHOLD) go(idx + 1);
  else if (dx >= THRESHOLD) go(idx - 1);
};

// in JSX, replace viewport opening tag:
<div
  className={s.viewport}
  data-testid="carousel-viewport"
  onPointerDown={onPointerDown}
  onPointerUp={onPointerUp}
  onPointerCancel={() => { startX.current = null; }}
>
```

- [ ] **Step 4: Run e2e**

Run: `npx playwright test homepage-carousel`
Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/HomepageCarousel/HomepageCarousel.tsx \
        tests/e2e/homepage-carousel.spec.ts
git commit -m "feat(homepage): carousel pointer-swipe nav"
```

---

## Task 9: Final polish — arrow buttons + reduced motion + visual review

**Files:**
- Modify: `src/components/HomepageCarousel/HomepageCarousel.tsx`
- Modify: `src/components/HomepageCarousel/HomepageCarousel.module.css`
- Create: `src/components/HomepageCarousel/CarouselDots.tsx` (extracted)
- Create: `src/components/HomepageCarousel/CarouselDots.module.css`

- [ ] **Step 1: Extract dots + add prev/next buttons**

Create `src/components/HomepageCarousel/CarouselDots.tsx`:

```tsx
import s from './CarouselDots.module.css';

export function CarouselDots({
  total,
  idx,
  onJump,
  onPrev,
  onNext,
}: {
  total: number;
  idx: number;
  onJump: (i: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className={s.row}>
      <button
        type="button"
        className={s.arrow}
        onClick={onPrev}
        disabled={idx === 0}
        aria-label="前のスライド"
      >
        ‹
      </button>
      <div className={s.dots}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            data-testid={`carousel-dot-${i + 1}`}
            className={i === idx ? s.dotActive : s.dot}
            onClick={() => onJump(i)}
            aria-label={`スライド${i + 1}へ`}
          />
        ))}
      </div>
      <button
        type="button"
        className={s.arrow}
        onClick={onNext}
        disabled={idx === total - 1}
        aria-label="次のスライド"
      >
        ›
      </button>
    </div>
  );
}
```

Create `src/components/HomepageCarousel/CarouselDots.module.css`:

```css
.row {
  display: flex; align-items: center; justify-content: center;
  gap: var(--sp-md);
}
.arrow {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card);
  font-size: 22px; line-height: 1;
  color: var(--hall-indigo);
  cursor: pointer;
  font-family: inherit;
  transition: background 200ms ease, transform 200ms ease;
}
.arrow:hover:not(:disabled) { background: var(--bg); transform: translateY(-1px); }
.arrow:disabled { opacity: 0.35; cursor: default; }
.arrow:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.dots { display: flex; gap: 10px; }
.dot, .dotActive {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 0; padding: 0;
  background: var(--border);
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
}
.dotActive { background: var(--hall-indigo); transform: scale(1.25); }
.dot:hover { background: var(--text-sec); }
.dot:focus-visible, .dotActive:focus-visible {
  outline: 2px solid var(--focus-ring); outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .arrow, .dot, .dotActive { transition: none; }
  .arrow:hover:not(:disabled) { transform: none; }
}
```

Edit `src/components/HomepageCarousel/HomepageCarousel.tsx`:

```tsx
import { CarouselDots } from './CarouselDots';
// remove inline dots block, replace with:
<CarouselDots
  total={SLIDE_COUNT}
  idx={idx}
  onJump={go}
  onPrev={() => go(idx - 1)}
  onNext={() => go(idx + 1)}
/>
```

Delete the `.dotsRow`, `.dot`, `.dotActive` rules from `HomepageCarousel.module.css`.

- [ ] **Step 2: Add slide-enter animation respecting reduced motion**

Edit `src/components/HomepageCarousel/HomepageCarousel.module.css`. Add:

```css
.slide {
  animation: slideEnter 240ms cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes slideEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .slide { animation: none; }
}
```

- [ ] **Step 3: Manual visual check in dev server**

Run: `npm run dev`, open `http://localhost:5173`, click through all 5 slides, use arrow keys, click TOC, click dots, swipe with mouse drag. Check: header still renders, start CTA below carousel still works, no layout shift, axes/colors match deck.

**Fold check:** at 1920×1080 and 1440×900 viewports (Chrome devtools → device emulation → Responsive), confirm `診断をはじめる →` button is at or above the fold without scrolling. Some scroll is acceptable on laptops < 900px tall (per design — first-time visitor is primary, scroll cost is trivial). If button sits well below the fold at 1440×900, trim per-slide vertical padding or carousel `min-height` further until it fits.

- [ ] **Step 4: Run full e2e + reducer tests + lint + typecheck**

```
npx playwright test homepage-carousel
npm test
npm run lint
npm run build
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/HomepageCarousel/CarouselDots.tsx \
        src/components/HomepageCarousel/CarouselDots.module.css \
        src/components/HomepageCarousel/HomepageCarousel.tsx \
        src/components/HomepageCarousel/HomepageCarousel.module.css
git commit -m "polish(homepage): extract carousel dots + arrows, respect reduced motion"
```

---

## Self-Review Checklist (must run before handing off)

1. **Spec coverage:**
   - Replace homepage explainer with mechanism slides 2–6 ✅ Tasks 3–7
   - Carousel nav: ←/→/swipe/dots/pipeline TOC ✅ Tasks 1, 2, 8, 9
   - Title block + start CTA preserved on welcome ✅ Task 1 step 5
   - No CTA inside carousel ✅ Slides contain no start button
   - Desktop-first, deck visuals 1:1 ✅ Tokens reused, class shapes mirrored

2. **Placeholder scan:** None — every code block contains real content.

3. **Type consistency:** `go()`, `idx`, `slideRenderers`, `AxisKey`, `SLIDE_COUNT = 5` are used identically in every task that references them. `data-testid` ids (`carousel-slide-N`, `carousel-dot-N`, `pipeline-step-N`, `axis-row-K`, `s3-q-N`, `s3-right-q`, `s4-bar-K`, `s4-pct`, `carousel-viewport`, `s2-example-q`) are stable across tasks.

4. **Notes for executor:**
   - `JSX.Element` in `slideRenderers` requires `import type { JSX } from 'react'` if TS strict balks; otherwise `React.ReactElement` is fine — adjust if the build fails.
   - Playwright defaults to Chromium; if `playwright install` was never run, the executor must run it once before Task 1 step 3.
