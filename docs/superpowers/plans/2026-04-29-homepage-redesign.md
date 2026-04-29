# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a from-scratch homepage at `prototypes/homepage-v2/` — new hero column, new bottom-mounted stepper, carousel ported verbatim — guided by `docs/superpowers/specs/2026-04-29-homepage-agent-brief.md`.

**Architecture:** Isolated Vite app at `prototypes/homepage-v2/` so the prototype runs alongside the real app. Carousel files copied verbatim from `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/`, then minimally refactored to lift `idx` state up so the new external `Stepper` can drive it. New `Welcome.tsx` owns layout (420px hero / fluid right) + `idx` state.

**Tech Stack:** React 19, TypeScript, Vite 8, CSS Modules, Playwright (e2e). Reuses root `src/styles/tokens.css` via relative import.

---

## File Structure

**Create:**
```
prototypes/homepage-v2/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── playwright.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── Welcome.tsx
│   ├── Welcome.module.css
│   ├── Stepper.tsx
│   ├── Stepper.module.css
│   └── HomepageCarousel/        # copied verbatim, then Task 3 refactor
│       ├── HomepageCarousel.tsx
│       ├── HomepageCarousel.module.css
│       ├── index.ts
│       └── slides/...
└── tests/e2e/
    └── homepage-v2.spec.ts
```

**Reference (read-only):**
- `src/styles/tokens.css` — design tokens
- `src/data/axes.ts` — axis colors/labels
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/**` — carousel source
- `docs/superpowers/specs/2026-04-29-homepage-agent-brief.md` — design brief

**Forbidden:** Original `Welcome.tsx` / `Welcome.module.css` (root or worktree), original `Stepper.tsx` / `Stepper.module.css`. Build from brief, not precedent.

---

### Task 1: Scaffold the prototype Vite app

**Files:**
- Create: `prototypes/homepage-v2/package.json`
- Create: `prototypes/homepage-v2/vite.config.ts`
- Create: `prototypes/homepage-v2/tsconfig.json`
- Create: `prototypes/homepage-v2/index.html`
- Create: `prototypes/homepage-v2/src/main.tsx`
- Create: `prototypes/homepage-v2/src/App.tsx`

- [ ] **Step 1: Create `prototypes/homepage-v2/package.json`**

```json
{
  "name": "homepage-v2-proto",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 5174",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Create `prototypes/homepage-v2/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
```

- [ ] **Step 3: Create `prototypes/homepage-v2/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": false,
    "noEmit": true
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 4: Create `prototypes/homepage-v2/index.html`**

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>横須賀市役所 部署タイプ診断 (prototype)</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `prototypes/homepage-v2/src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/styles/reset.css';
import '../../../src/styles/tokens.css';
import '../../../src/styles/layout.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 6: Create `prototypes/homepage-v2/src/App.tsx`**

```tsx
import { Welcome } from './Welcome';

export function App() {
  return <Welcome />;
}
```

- [ ] **Step 7: Verify the dev server boots**

```bash
cd prototypes/homepage-v2 && npm run dev
```

Expected: Vite prints `Local: http://localhost:5174/`. The page is empty (Welcome not built yet) but no errors. Stop the server (Ctrl-C).

- [ ] **Step 8: Commit**

```bash
git add prototypes/homepage-v2/
git commit -m "feat(prototype): scaffold homepage-v2 Vite app"
```

---

### Task 2: Port carousel files verbatim

**Files:**
- Create: `prototypes/homepage-v2/src/HomepageCarousel/HomepageCarousel.tsx` (from worktree)
- Create: `prototypes/homepage-v2/src/HomepageCarousel/HomepageCarousel.module.css` (from worktree)
- Create: `prototypes/homepage-v2/src/HomepageCarousel/index.ts` (from worktree)
- Create: `prototypes/homepage-v2/src/HomepageCarousel/slides/Slide2Input.tsx` + `.module.css`
- Create: `prototypes/homepage-v2/src/HomepageCarousel/slides/Slide3Scoring.tsx` + `.module.css`
- Create: `prototypes/homepage-v2/src/HomepageCarousel/slides/Slide4Comparison.tsx` + `.module.css`
- Create: `prototypes/homepage-v2/src/HomepageCarousel/slides/Slide5Result.tsx` + `.module.css`
- Create: `prototypes/homepage-v2/src/HomepageCarousel/slides/Slide6Example.tsx` + `.module.css`

- [ ] **Step 1: Copy carousel directory verbatim**

```bash
cp -R .worktrees/feat-homepage-carousel/src/components/HomepageCarousel \
      prototypes/homepage-v2/src/HomepageCarousel
```

- [ ] **Step 2: Verify file count and that no Welcome / outer-screen files leaked in**

```bash
find prototypes/homepage-v2/src/HomepageCarousel -type f | sort
```

Expected output (15 files):
```
prototypes/homepage-v2/src/HomepageCarousel/HomepageCarousel.module.css
prototypes/homepage-v2/src/HomepageCarousel/HomepageCarousel.tsx
prototypes/homepage-v2/src/HomepageCarousel/Stepper.module.css
prototypes/homepage-v2/src/HomepageCarousel/Stepper.tsx
prototypes/homepage-v2/src/HomepageCarousel/index.ts
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide2Input.module.css
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide2Input.tsx
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide3Scoring.module.css
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide3Scoring.tsx
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide4Comparison.module.css
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide4Comparison.tsx
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide5Result.module.css
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide5Result.tsx
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide6Example.module.css
prototypes/homepage-v2/src/HomepageCarousel/slides/Slide6Example.tsx
```

- [ ] **Step 3: Confirm no slide imports anything outside HomepageCarousel/ or src/data/**

```bash
grep -rE "^import" prototypes/homepage-v2/src/HomepageCarousel/slides | grep -vE "from '[\\./]" | grep -vE "from 'react'"
```

Expected: empty output. (Slides only import from React, relative paths, or `src/data/*` via `../../../../../src/data/`.) If any slide imports break in later tasks, adjust the relative paths in that slide file to point at `../../../../../src/data/...` from the new prototype location.

- [ ] **Step 4: Commit**

```bash
git add prototypes/homepage-v2/src/HomepageCarousel
git commit -m "feat(prototype): port HomepageCarousel verbatim from worktree"
```

---

### Task 3: Lift carousel `idx` state so external Stepper can drive it

The ported carousel currently owns `idx` internally and renders its own `<Stepper />`. For the new layout, `Welcome` owns `idx`, the new external `Stepper` reflects/sets it, and the carousel just renders the active slide. This is the smallest refactor that keeps slide behavior intact.

**Files:**
- Modify: `prototypes/homepage-v2/src/HomepageCarousel/HomepageCarousel.tsx`
- Delete: `prototypes/homepage-v2/src/HomepageCarousel/Stepper.tsx`
- Delete: `prototypes/homepage-v2/src/HomepageCarousel/Stepper.module.css`
- Modify: `prototypes/homepage-v2/src/HomepageCarousel/index.ts`

- [ ] **Step 1: Replace `HomepageCarousel.tsx` with the controlled version**

```tsx
import { useEffect } from 'react';
import s from './HomepageCarousel.module.css';
import { Slide2Input } from './slides/Slide2Input';
import { Slide3Scoring } from './slides/Slide3Scoring';
import { Slide4Comparison } from './slides/Slide4Comparison';
import { Slide5Result } from './slides/Slide5Result';
import { Slide6Example } from './slides/Slide6Example';

export const SLIDE_COUNT = 5;

const slides = [
  <Slide2Input />,
  <Slide3Scoring />,
  <Slide4Comparison />,
  <Slide5Result />,
  <Slide6Example />,
];

type Props = {
  idx: number;
  onIdxChange: (i: number) => void;
};

export function HomepageCarousel({ idx, onIdxChange }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const tag = ae?.tagName;
      const editable = ae?.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onIdxChange(Math.min(SLIDE_COUNT - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onIdxChange(Math.max(0, idx - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, onIdxChange]);

  return (
    <section className={s.carousel} aria-label="部署タイプ診断の仕組み">
      <div className={s.viewport} data-testid="carousel-viewport">
        {slides.map((node, i) => (
          <div
            key={i}
            data-testid={`carousel-slide-${i + 1}`}
            data-active={i === idx ? 'true' : 'false'}
            className={s.slide}
            hidden={i !== idx}
          >
            {node}
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Delete the carousel-internal Stepper files**

```bash
rm prototypes/homepage-v2/src/HomepageCarousel/Stepper.tsx
rm prototypes/homepage-v2/src/HomepageCarousel/Stepper.module.css
```

- [ ] **Step 3: Update `index.ts` to export `SLIDE_COUNT`**

```ts
export { HomepageCarousel, SLIDE_COUNT } from './HomepageCarousel';
```

- [ ] **Step 4: Verify no remaining imports of the deleted Stepper**

```bash
grep -r "from.*HomepageCarousel/Stepper" prototypes/homepage-v2/ ; echo "---"
grep -r "import.*Stepper" prototypes/homepage-v2/src/HomepageCarousel/
```

Expected: both empty.

- [ ] **Step 5: Commit**

```bash
git add prototypes/homepage-v2/src/HomepageCarousel
git commit -m "refactor(prototype): lift carousel idx state, drop internal Stepper"
```

---

### Task 4: Write Playwright tests for stepper + carousel behavior (TDD)

**Files:**
- Create: `prototypes/homepage-v2/playwright.config.ts`
- Create: `prototypes/homepage-v2/tests/e2e/homepage-v2.spec.ts`

- [ ] **Step 1: Create the Playwright config**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://localhost:5174' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
```

- [ ] **Step 2: Create the e2e spec**

```ts
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('hero: title, lede, stats trio, CTA all visible above fold', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('横須賀市役所')).toBeVisible();
  await expect(page.getByText('部署タイプ診断')).toBeVisible();
  for (const n of ['20', '5', '102']) {
    await expect(page.getByTestId(`hero-stat-${n}`)).toBeVisible();
  }
  const cta = page.getByRole('button', { name: /診断をはじめる/ });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  if (!box) throw new Error('CTA not found');
  expect(box.y + box.height).toBeLessThan(900);
});

test('hero: five axis color stripes render at bottom-left', async ({ page }) => {
  await page.goto('/');
  for (const ax of ['A', 'B', 'C', 'D', 'E']) {
    await expect(page.getByTestId(`hero-axis-stripe-${ax}`)).toBeVisible();
  }
});

test('stepper: numerals 01-05 visible, active gets data-active', async ({ page }) => {
  await page.goto('/');
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toBeVisible();
  }
  await expect(page.getByTestId('stepper-step-1')).toHaveAttribute('data-active', 'true');
  for (let i = 2; i <= 5; i++) {
    await expect(page.getByTestId(`stepper-step-${i}`)).toHaveAttribute('data-active', 'false');
  }
});

test('stepper: contextual label shows current step JP label only', async ({ page }) => {
  await page.goto('/');
  const label = page.getByTestId('stepper-current-label');
  await expect(label).toHaveText('入力');
  await page.getByTestId('stepper-step-3').click();
  await expect(label).toHaveText('比較');
  await expect(page.getByTestId('carousel-slide-3')).toHaveAttribute('data-active', 'true');
});

test('stepper: keyboard arrows update both carousel and stepper', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('carousel-slide-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-step-2')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('stepper-current-label')).toHaveText('採点');
});

test('layout: page does not scroll vertically at 1440x900', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
```

- [ ] **Step 3: Run the tests and confirm they fail (Welcome + Stepper not built)**

```bash
cd prototypes/homepage-v2 && npx playwright test
```

Expected: All 6 tests FAIL. Reason will vary (Welcome empty, no testids, no Stepper). This proves the tests are wired up correctly.

- [ ] **Step 4: Commit**

```bash
git add prototypes/homepage-v2/playwright.config.ts prototypes/homepage-v2/tests
git commit -m "test(prototype): e2e specs for hero, stepper, layout"
```

---

### Task 5: Build the new Stepper component

**Files:**
- Create: `prototypes/homepage-v2/src/Stepper.tsx`
- Create: `prototypes/homepage-v2/src/Stepper.module.css`

- [ ] **Step 1: Create `Stepper.tsx`**

```tsx
import s from './Stepper.module.css';

const STEPS = [
  { num: '01', label: '入力' },
  { num: '02', label: '採点' },
  { num: '03', label: '比較' },
  { num: '04', label: '結果' },
  { num: '05', label: '例'   },
] as const;

type Props = {
  idx: number;
  onJump: (i: number) => void;
};

export function Stepper({ idx, onJump }: Props) {
  const current = STEPS[idx];
  return (
    <div className={s.wrap}>
      <ol className={s.row} aria-label="ステップ">
        {STEPS.map((st, i) => {
          const state =
            i === idx ? s.active
            : i < idx ? s.done
            : s.upcoming;
          return (
            <li key={i} className={s.cell}>
              <button
                type="button"
                className={`${s.btn} ${state}`}
                data-testid={`stepper-step-${i + 1}`}
                data-active={i === idx ? 'true' : 'false'}
                aria-current={i === idx ? 'step' : undefined}
                onClick={() => onJump(i)}
              >
                <span className={s.num}>{st.num}</span>
              </button>
              {i < STEPS.length - 1 && <span className={s.sep} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <p className={s.contextLabel} data-testid="stepper-current-label">
        {current.label}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `Stepper.module.css`**

```css
.wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-block: var(--sp-md);
}

.row {
  list-style: none; margin: 0; padding: 0;
  display: flex; align-items: center;
  gap: 0;
}

.cell {
  display: flex; align-items: center;
}

.btn {
  background: transparent;
  border: 0;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  color: var(--sub);
  border-bottom: 2px solid transparent;
  transition: color 150ms ease, border-color 150ms ease;
}
.btn:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  border-radius: 2px;
}

.done { color: var(--hall-indigo); }
.active {
  color: var(--hall-indigo);
  border-bottom-color: var(--hall-indigo);
  font-weight: var(--fw-black);
}

.sep {
  width: 1px;
  height: 12px;
  background: var(--border);
}

.contextLabel {
  margin: 0;
  font-size: 12px;
  color: var(--sub);
  letter-spacing: 0.04em;
}

@media (prefers-reduced-motion: reduce) {
  .btn { transition: none; }
}
```

- [ ] **Step 3: Commit (Stepper exists; tests still fail because Welcome doesn't render it yet)**

```bash
git add prototypes/homepage-v2/src/Stepper.tsx prototypes/homepage-v2/src/Stepper.module.css
git commit -m "feat(prototype): Stepper component — numerals + contextual label"
```

---

### Task 6: Build Welcome layout, hero column, and compose carousel + stepper

**Files:**
- Create: `prototypes/homepage-v2/src/Welcome.tsx`
- Create: `prototypes/homepage-v2/src/Welcome.module.css`

- [ ] **Step 1: Create `Welcome.tsx`**

```tsx
import { useState } from 'react';
import { HomepageCarousel, SLIDE_COUNT } from './HomepageCarousel';
import { Stepper } from './Stepper';
import s from './Welcome.module.css';

const AXIS_COLORS = [
  'var(--A)', 'var(--B)', 'var(--C)', 'var(--D)', 'var(--E)',
] as const;
const AXIS_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;

export function Welcome() {
  const [idx, setIdx] = useState(0);
  const onJump = (i: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, i)));

  return (
    <main className={s.split}>
      <aside className={s.hero}>
        <div className={s.eyebrow}>YOKOSUKA CITY HALL</div>
        <h1 className={s.title}>
          横須賀市役所<br />部署タイプ診断
        </h1>
        <p className={s.lede}>3分で、あなたに合う課が見つかります。</p>

        <ul className={s.stats}>
          <li>
            <span data-testid="hero-stat-20" className={s.statN}>20</span>
            <span className={s.statL}>問</span>
          </li>
          <li>
            <span data-testid="hero-stat-5" className={s.statN}>5</span>
            <span className={s.statL}>軸</span>
          </li>
          <li>
            <span data-testid="hero-stat-102" className={s.statN}>102</span>
            <span className={s.statL}>課</span>
          </li>
        </ul>

        <button type="button" className={s.cta}>
          診断をはじめる <span aria-hidden="true">→</span>
        </button>

        <div className={s.stripes} aria-hidden="true">
          {AXIS_KEYS.map((k, i) => (
            <span
              key={k}
              data-testid={`hero-axis-stripe-${k}`}
              style={{ background: AXIS_COLORS[i] }}
              className={s.stripe}
            />
          ))}
        </div>
      </aside>

      <section className={s.right}>
        <div className={s.carouselWrap}>
          <HomepageCarousel idx={idx} onIdxChange={setIdx} />
          <Stepper idx={idx} onJump={onJump} />
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create `Welcome.module.css`**

```css
:root {
  --hero-w: 420px;
  --col-pad: var(--sp-2xl);
  --hero-accent: #F5EBD8;
}

.split {
  display: grid;
  grid-template-columns: var(--hero-w) 1fr;
  min-height: 100vh;
  background: var(--bg);
}
@media (max-width: 900px) {
  .split { grid-template-columns: 1fr; min-height: 0; }
}

.hero {
  position: relative;
  background: var(--hall-indigo);
  color: white;
  padding-inline: var(--col-pad);
  padding-block: var(--col-pad);
  display: flex; flex-direction: column;
  gap: var(--sp-md);
  overflow: hidden;
}

.eyebrow {
  font-size: 12px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.18em;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
}

.title {
  font-size: 56px;
  font-weight: var(--fw-black);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin: 0;
  color: white;
}

.lede {
  font-size: 16px;
  font-weight: var(--fw-normal);
  color: white;
  line-height: 1.6;
  margin: 0;
  max-width: 32ch;
}

.stats {
  list-style: none; padding: 0;
  margin: var(--sp-xl) 0 0;
  display: flex; gap: var(--sp-xl);
}
.stats li {
  display: flex; flex-direction: column; gap: 4px;
}
.statN {
  font-size: 56px;
  font-weight: var(--fw-black);
  color: var(--hero-accent);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.statL {
  font-size: 11px;
  font-weight: var(--fw-bold);
  letter-spacing: 0.14em;
  color: white;
  text-transform: uppercase;
}

.cta {
  align-self: flex-start;
  margin-top: var(--sp-lg);
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 28px;
  background: white;
  color: var(--hall-indigo);
  border: 0; border-radius: 999px;
  font-family: inherit;
  font-size: 16px;
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: transform 150ms ease;
}
@media (hover: hover) {
  .cta:hover { transform: translateY(-1px); }
}
.cta:focus-visible {
  outline: 2px solid white;
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .cta { transition: none; }
  .cta:hover { transform: none; }
}

.stripes {
  position: absolute;
  left: var(--col-pad);
  bottom: var(--col-pad);
  display: flex; gap: 4px;
}
.stripe {
  width: 4px;
  height: 60px;
  border-radius: 1px;
}

.right {
  padding-inline: var(--col-pad);
  padding-block: var(--col-pad);
  min-width: 0;
  display: flex;
  align-items: stretch;
}
.carouselWrap {
  width: 100%;
  display: flex; flex-direction: column;
  gap: var(--sp-md);
  min-width: 0;
}
```

- [ ] **Step 3: Run the dev server in the background and run the e2e suite**

```bash
cd prototypes/homepage-v2 && npx playwright test
```

Expected: All 6 tests PASS. If any fail, debug the specific failure (testid mismatch, missing element, etc.) before continuing.

- [ ] **Step 4: Commit**

```bash
git add prototypes/homepage-v2/src/Welcome.tsx prototypes/homepage-v2/src/Welcome.module.css
git commit -m "feat(prototype): Welcome — hero column + carousel/stepper composition"
```

---

### Task 7: Anti-pattern audit + acceptance check

**Files:** none modified — this task is verification.

- [ ] **Step 1: Count visible boxes against the ≤6 budget**

Open `http://localhost:5174` in a browser. Count visible bordered/backed boxes:
1. Hero column (indigo bg) — 1
2. CTA button — 2
3. Carousel viewport (if it has visible chrome) — count it
4. Each axis card inside slides — DO NOT count (slide internals are out of scope)

The boxes the rebuild controls should be ≤ 3 (hero, CTA, optional carousel chrome). Confirm.

- [ ] **Step 2: Visual scan for forbidden anti-patterns**

Confirm by inspection (and DevTools where needed):
- No `opacity: 0.55 / 0.6 / 0.82` triple-tier on hero text → check computed styles
- No `box-shadow: inset Npx 0 0 ...` on rounded buttons → check Stepper buttons
- No EN sub-label under stepper numerals → confirm Stepper renders `01` etc only
- No "How it works" section header above carousel → confirm no `h2` outside hero
- Both columns share `--col-pad` (same padding-inline value) → check computed styles

- [ ] **Step 3: Run lint on the prototype**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz && npx eslint prototypes/homepage-v2/src
```

Expected: 0 errors, 0 warnings. Fix any issues.

- [ ] **Step 4: Take a reference screenshot for review**

```bash
cd prototypes/homepage-v2 && npx playwright screenshot --viewport-size=1440,900 http://localhost:5174 ../../docs/superpowers/specs/2026-04-29-homepage-v2-screenshot.png
```

(If the dev server isn't running, start it first: `npm run dev &`.)

- [ ] **Step 5: Commit the screenshot**

```bash
git add docs/superpowers/specs/2026-04-29-homepage-v2-screenshot.png
git commit -m "docs(prototype): homepage-v2 reference screenshot"
```

- [ ] **Step 6: Final check — list any deviations from the brief**

Append a short section to `docs/superpowers/specs/2026-04-29-homepage-redesign-design.md` titled `## Implementation Notes` listing:
- accent color choice (cream `#F5EBD8` or which axis hue) and why
- whether the carousel refactor went as planned (lifted state) or differed
- any new tokens added (should be none)
- any acceptance criterion not met, with reason

Commit:

```bash
git add docs/superpowers/specs/2026-04-29-homepage-redesign-design.md
git commit -m "docs(spec): implementation notes for homepage-v2"
```

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Layout (420px / fluid, shared padding) → Task 6 (`Welcome.module.css`)
- Hero color budget + type hierarchy → Task 6
- Stats trio anchor → Task 6
- Axis-color stripes → Task 6 + Task 4 test
- No "How it works" header → Task 6 (no header rendered) + Task 7 visual check
- Stepper at bottom, numerals + contextual label → Task 5 + Task 4 tests
- Carousel verbatim → Task 2
- Carousel state lifted → Task 3 (documented refactor)
- Forbidden file list → encoded in plan + brief; agent guidance only (not enforceable in plan)
- Acceptance criteria → Task 7

**Placeholder scan:** No "TBD"/"TODO"/"similar to". Every code step shows full code.

**Type consistency:** `idx`/`onIdxChange` on `HomepageCarousel`, `idx`/`onJump` on `Stepper`. `SLIDE_COUNT` exported from `HomepageCarousel`. Welcome owns state and passes through. Consistent across Tasks 3, 5, 6.
