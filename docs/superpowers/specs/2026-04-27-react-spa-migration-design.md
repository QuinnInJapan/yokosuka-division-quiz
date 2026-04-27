# React SPA Migration — Design

**Date:** 2026-04-27
**Status:** Approved for implementation planning
**Scope:** Migrate the existing vanilla-JS quiz app to an idiomatic React + TypeScript SPA. No database. No backend.

---

## 1. Goal

Replace the current hand-rolled vanilla-JS architecture (Python concat build → single `dist/index.html`) with an idiomatic React 18 + TypeScript SPA built with Vite. Behavior is preserved, except share functionality is **removed** in this migration and slated for a later rebuild as a PNG export.

The migration is the foundation for adding new features later. It is not itself a feature change.

### Why React

The app is rendered via full `innerHTML` replacement plus targeted DOM patches (`patchSel`, `patchTrait`). Derived state (`results`, `userScores`, `type`) is stored alongside source state and risks drift on every action. React's render model and `useMemo` eliminate both classes of problem and remove the need for the manual patch functions entirely.

### Non-goals

- No visual redesign. Existing CSS, tokens, and layout are preserved 1:1 where practical.
- No new questions, divisions, or scoring logic.
- No routing library. App has three screens, not navigable URL hierarchy.
- No global state library (Zustand, Redux). Context + `useReducer` is sufficient and idiomatic.
- No CSS framework migration (Tailwind, etc.). The existing tokenized CSS is kept.
- No e2e or component tests. Pure-logic unit tests only.

---

## 2. Stack & Tooling

- **React 18** + **TypeScript 5+**
- **Vite** (`npm create vite@latest -- --template react-ts`)
- **Vitest** for unit tests (no jsdom required — tests cover pure functions and reducer only)
- **ESLint + Prettier** with Vite defaults; no custom rules
- **Node 20+**
- **`package.json` scripts**: `dev`, `build`, `preview`, `test`
- Drop `build.py`. `vite build` outputs to `dist/`. Deployment target unchanged (static hosting).

---

## 3. File Structure

By-type organization. Three screens does not justify feature-folder overhead.

```
src/
  data/
    types.ts            shared TypeScript types
    axes.ts             AXES
    questions.ts        QUESTIONS, ORDER
    divisions.ts        DIVISIONS (DIV_ABOUT folded into Division.about)
    archetypes.ts       TYPES (32 archetypes)
    descriptions.ts     AXIS_DESC + getAxisDesc()
  lib/
    scoring.ts          pure scoring + ranking + type determination
    scoring.test.ts
  state/
    store.tsx           Context + reducer + Provider + hooks
    reducer.test.ts
  screens/
    Welcome.tsx
    Welcome.module.css
    Quiz.tsx
    Quiz.module.css
    Results.tsx
    Results.module.css
  components/
    AppShell.tsx
    ProgressBar.tsx + ProgressBar.module.css
    TypeReveal.tsx + TypeReveal.module.css
    TraitsPanel.tsx + TraitsPanel.module.css
    TraitCarousel.tsx + TraitCarousel.module.css
    TraitBar.tsx + TraitBar.module.css
    MatchBrowse.tsx + MatchBrowse.module.css
    MatchList.tsx + MatchList.module.css
    MatchDetail.tsx + MatchDetail.module.css
    FitRing.tsx
    ComparisonBars.tsx + ComparisonBars.module.css
    RetakeButton.tsx + RetakeButton.module.css
  styles/
    tokens.css          global :root vars (imported once in main.tsx)
    reset.css           global
    layout.css          global structural classes (.card, .section-gap, body)
  App.tsx
  main.tsx
index.html              Vite entry
package.json
tsconfig.json
vite.config.ts
```

Co-locate component CSS Modules with their component file. Group small presentational components without their own CSS module (e.g. `FitRing` uses inline SVG only).

---

## 4. Data Layer (`src/data/`)

All data ships as TypeScript modules with `as const` where it gives literal types. No JSON imports. This gives full IDE autocomplete and compile-time validation of axis keys and division shape.

### Shared types (`types.ts`)

```ts
export type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';
export type Response = 1 | 2 | 3 | 4 | 5;
export type Responses = Record<string, Response>;

export type Axis = {
  label: string;
  minus: string; plus: string;
  color: string; dark: string; tint: string;
  kanji_plus: string; kanji_minus: string;
  letter_plus: string; letter_minus: string;
  en_plus: string; en_minus: string;
};

export type Question = {
  id: string;
  axis: AxisKey;
  reversed: boolean;
  scenario: string;
  options: [string, string, string, string, string];
};

export type Division = {
  dept: string;
  name: string;
  en: string;
  about?: string;
} & Record<AxisKey, number>;

export type Archetype = { code: string; name: string; desc: string };

export type RankedDivision = Division & {
  user: Record<AxisKey, number>;
  fit: number;
};
```

### Module exports

- `axes.ts` → `export const AXES: Record<AxisKey, Axis>`
- `questions.ts` → `export const QUESTIONS: readonly Question[]`, `export const ORDER: readonly string[]`
- `divisions.ts` → `export const DIVISIONS: readonly Division[]` (the current `DIV_ABOUT` lookup is folded into each `Division.about` field — single source per record, drops the `"市長室|秘書課"` key-join trick)
- `archetypes.ts` → `export const TYPES: Record<string, Archetype>`
- `descriptions.ts` → `export const AXIS_DESC: Record<AxisKey, AxisDescTiers>`, `export function getAxisDesc(axis, score): string`

---

## 5. Pure Logic (`src/lib/`)

Zero React, zero DOM, zero side effects. Functions are pure and deterministic.

### `scoring.ts`

```ts
export function scoreResp(r: Response, reversed: boolean): number;
export function axisScores(resp: Responses): Record<AxisKey, number>;
export function dist(u: Record<AxisKey, number>, d: Division): number;
export function fitPct(d: number): number;
export function rankAll(resp: Responses): RankedDivision[];
export function determineType(scores: Record<AxisKey, number>): Archetype;
export function scoreToPct(score: number): { pct: number; isPlus: boolean };
export function fitColor(p: number): { text: string; fill: string; bg: string };
```

These are direct ports of the current `03-algorithm.js` and `05-helpers.js` math. Components import from `lib/`, never inline math.

---

## 6. Store (`src/state/store.tsx`)

Single React Context with a `useReducer` inside the provider. Idiomatic global state for an app this size; no external dependency.

### Stored state

```ts
type State = {
  screen: 'welcome' | 'quiz' | 'results';
  step: number;          // 0..19
  resp: Responses;
  sel: number;           // selected division index in ranked results
  traitIdx: number;      // 0..4 axis carousel index
};
```

### Derived state (selectors)

Computed via `useMemo` from `resp`, **not stored**:

```ts
useDerived() → {
  userScores: Record<AxisKey, number>;
  type: Archetype;
  results: RankedDivision[];
}
```

This eliminates the entire class of bugs where `S.results`/`S.userScores`/`S.type` go stale relative to `S.resp` in the current code.

### Actions

```
START                  → screen=quiz, step=0, resp={}
ANSWER(Response)       → record resp[step], advance step, last → screen=results
BACK                   → step = max(0, step-1)
SEL(idx)               → sel = idx
TPREV / TNEXT          → traitIdx = (traitIdx ± 1 + 5) % 5
TAXS(AxisKey)          → traitIdx = AX.indexOf(payload)
RETAKE                 → screen=welcome, clear resp, step=0
```

### Side effects

`<StoreProvider>` runs no URL effects in this migration. Initial state is the static `initial` constant (no read-from-URL).

### API surface

```ts
function StoreProvider({ children }): JSX.Element;
function useStore(): { state: State; dispatch: React.Dispatch<Action> };
function useDerived(): { userScores; type; results };
```

### Dropped from current code

- `S.showAll` — dead state. Current results screen renders the full list directly.
- `SHARE` action — share is removed entirely (see §11).
- `restoreFromUrl()` / `getShareUrl()` / URL sync — removed.

---

## 7. Components

Each component reads what it needs via `useStore()` / `useDerived()`. No prop drilling. React's reconciliation replaces the current `patchSel` and `patchTrait` manual DOM updates.

### Screens (`src/screens/`)

- **`Welcome.tsx`** — port of `renderWelcome()`. Static layout + axis pills + start button (`dispatch({ type: 'START' })`).
- **`Quiz.tsx`** — port of `renderQuiz()`. Reads `state.step`, `state.resp`. Dispatches `ANSWER(value)` and `BACK`. Renders `<ProgressBar>`.
- **`Results.tsx`** — composes `<TypeReveal>` + `<TraitsPanel>` + `<MatchBrowse>` + `<RetakeButton>`.

### Shared (`src/components/`)

- **`AppShell.tsx`** — `<main>` wrapper. `useEffect` keyed on `state.screen` performs `window.scrollTo(0,0)` and focuses `h1` for keyboard / screen-reader users (replaces current `manageFocus()`).
- **`ProgressBar.tsx`** — quiz progress segments (`role="progressbar"`).
- **`TypeReveal.tsx`** — type banner, chips, name, code, desc.
- **`TraitsPanel.tsx`** — grid container for the carousel + 5-bar panel.
- **`TraitCarousel.tsx`** — left panel: kanji hero, bar, description, prev/next nav, dots.
- **`TraitBar.tsx`** — five compact rows on the right; clicking dispatches `TAXS`.
- **`MatchBrowse.tsx`** — wrapper for list + detail side-by-side.
- **`MatchList.tsx`** — 102 ranked buttons; clicking dispatches `SEL`.
- **`MatchDetail.tsx`** — detail card for `state.sel`. Includes `<FitRing>` + per-axis `<ComparisonBars>`.
- **`FitRing.tsx`** — pure presentational SVG arc; props: `pct`, `color`.
- **`ComparisonBars.tsx`** — user-vs-division bar pair per axis.
- **`RetakeButton.tsx`** — dispatches `RETAKE`.

### Component rules

- All `onclick="go(...)"` strings become real React handlers.
- All `manageFocus()` and `window.scrollTo(0, 0)` move into `<AppShell>`'s effect.
- `prefers-reduced-motion` handling stays in CSS, not JS.
- Console banner stays as a one-shot in `main.tsx`.

---

## 8. Styling

CSS Modules per component. Global stylesheets stay global.

```
src/styles/tokens.css   imported once in main.tsx (CSS :root vars)
src/styles/reset.css    global
src/styles/layout.css   global structural classes (.card, .section-gap, body)
src/components/<X>/<X>.module.css   co-located, scoped per component
src/screens/<X>.module.css          co-located, scoped per screen
```

- **Tokens stay global.** Existing `var(--A)` / `var(--A-tint)` etc. stay as-is. No rewrite.
- **Class namespacing** in current code (`tc-`, `match-`, `all-`) becomes redundant under CSS Modules — kept on initial port for diff-ability, can be cleaned later.
- **Inline data-driven styles** (axis colors from `AXES`, dot positions, fit-ring arc dasharray) become React `style={{...}}` objects. Same shape, just typed.
- **Animations** stay in CSS. React class toggling drives transitions.
- **`.card`, `.section-gap`** stay in global `layout.css` — promoting to a `<Card>` component is overkill for pure structural reuse.

---

## 9. Tests (`Vitest`)

Pure logic only. ~12–15 tests total.

```
src/lib/scoring.test.ts
  - scoreResp(): forward and reversed branches
  - axisScores(): aggregates 4 questions/axis with correct sign for reversed
  - fitPct(): 0% and 100% endpoints
  - dist(): symmetric, zero on identical scores
  - rankAll(): output sorted descending by fit, length === 102
  - determineType(): code maps to AXES letter_plus/letter_minus, fallback Archetype on unknown code

src/state/reducer.test.ts
  - START: clears resp, screen → quiz, step → 0
  - ANSWER: advances step, final ANSWER → screen=results
  - BACK: respects step floor at 0
  - SEL: bounds-safe assignment
  - TPREV / TNEXT: wraps 0..4 (modular)
  - TAXS: maps AxisKey to traitIdx
  - RETAKE: clears resp, screen → welcome
```

No component tests. No DOM tests. No e2e.

---

## 10. Migration Sequence

Each step is independently verifiable. The old vanilla code is untouched until step 10 — both versions can be A/B compared in the browser.

1. **Scaffold** Vite + React + TS into a `react/` subdir. Install Vitest, ESLint defaults.
2. **Data** — port `AXES`, `QUESTIONS`/`ORDER`, `DIVISIONS` (folding `DIV_ABOUT`), `TYPES`, `AXIS_DESC` to `src/data/*.ts` with shared `types.ts`.
3. **Pure logic** — port `src/lib/scoring.ts` from `03-algorithm.js` and `05-helpers.js`. Add type annotations.
4. **Tests** — write Vitest suite per §9. Confirm green.
5. **Store** — `src/state/store.tsx` (reducer + Provider + `useStore` + `useDerived`). Reducer test green.
6. **Components & screens** — top-down: `<AppShell>` → `<Welcome>` → `<Quiz>` (+ `<ProgressBar>`) → `<Results>` (`<TypeReveal>` → `<TraitsPanel>` → `<MatchBrowse>`).
7. **Styles** — port CSS to Modules per component. Keep `tokens.css`, `reset.css`, `layout.css` global.
8. **App wiring** — focus management, scroll-to-top in `<AppShell>`. Console banner in `main.tsx`.
9. **Browser smoke test** — all three screens, retake, keyboard nav, `prefers-reduced-motion`. Visual diff against old `dist/`.
10. **Cutover** — promote `react/src` → `src/`. Delete old `src/scripts/`, `src/styles/`, `build.py`, `matcher.py` (verify unused first), `DESIGN.json`. Update `.gitignore`. Update root `package.json`. Update `README` (or create one) with `npm run dev` / `npm run build`.
11. **Verify** — `npm run build` succeeds. Deploy preview matches.

---

## 11. Out of Scope / Future Work

### Share functionality (removed in this migration)

The current URL-based share (`?r=12345...`) is dropped. The `RetakeButton` is the only action button on the results screen post-migration.

**Future work:** Rebuild share as a **PNG export** that produces a screenshot-quality, portrait-shaped artifact — type name, archetype description, axis readouts, and top-N division ranking — that can be downloaded or sent through the OS share sheet. This is a better fit for the "people screenshot and send to a coworker" goal in `PRODUCT.md` than a URL link, and gives more design control over the shareable artifact.

Implementation candidates (out of scope here):

- Client-side: render a hidden DOM tree styled for export, capture via `html2canvas` or `dom-to-image`, hand the blob to `navigator.share({ files: [...] })` with download fallback.
- Pre-rendered template: build a `<canvas>` painter that draws from result state directly, avoiding HTML capture quirks (Japanese font rendering, especially).

Decision deferred until after migration is stable.

### Other deferred ideas (placeholders, not committed)

- Routing if/when more than three screens emerge.
- Component-level tests if/when behavior gets complex enough to warrant them.
- Theming (currently single committed palette per `PRODUCT.md`).

---

## 12. Decisions Recorded

| # | Decision | Choice |
|---|----------|--------|
| 1 | Language | TypeScript |
| 2 | Existing share-link compat | Break (free to redesign) |
| 3 | Styling | CSS Modules + global tokens |
| 4 | State | Context + `useReducer` (no Zustand) |
| 5 | Routing | None — single screen state |
| 6 | Tests | Vitest, pure logic only |
| 7 | File structure | By-type |
| 8 | Share functionality | Removed; PNG export deferred |

---

## 13. Open Questions

None at spec time. Implementation may surface:

- Vite config tweaks for Japanese font preload / `font-display` if a visible regression appears.
- Whether to mirror token values in TypeScript for use in `style={{}}` props. Most data-driven inline styles already pull from `AXES` (a TS module), so likely unnecessary.
