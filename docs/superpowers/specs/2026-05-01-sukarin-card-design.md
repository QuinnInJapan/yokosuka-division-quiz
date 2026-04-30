# Sukarin Card — Design Spec

**Date:** 2026-05-01
**Branch:** `sukarin-rebrand`
**Status:** Draft, awaiting user review
**Mockup reference:** `.superpowers/brainstorm/<session>/content/mockup-tiers.html` (Tier 1)

## Goal

Recenter the quiz around Sukarin so the result feels like a personal artifact, not a stat readout. The user finishes the quiz, sees their archetype's Sukarin presented in a framed card, and exports a PNG that shows the same card. Nothing else about the app changes.

## Decisions (already validated during brainstorming)

- **Sukarin appears at reveal only.** Welcome and Quiz screens are unchanged.
- **Minimum-change implementation.** Current palette, typography, components, layout, and tokens are preserved.
- **The 32 PNG assets** in `src/assets/sukarin/<CODE>.png` are imported at build time and resolved by archetype code.
- **A new `SukarinCard` component replaces** the existing indigo `TypeReveal` banner on the results screen. The composition mirrors into the export PNG.
- **Multi-hue axis chips, indigo body text, white card surfaces, cool-gray bg, Hiragino sans body type, and the existing TypeReveal entrance animation are all retained.**

## In scope

- New component: `SukarinCard` (replaces `TypeReveal` on results screen).
- Asset import strategy for the 32 archetype PNGs.
- Update `Results.tsx` to render `SukarinCard` instead of `TypeReveal`.
- Update `exportPng.ts` masthead region to render the same card composition (Sukarin + eyebrow + code + name + chips + description), preserving the rest of the canvas (profile bars, top-5/bottom-3 lists, footer + QR).
- Tests:
  - Unit: archetype-code → image resolution (all 32 codes resolve, no missing).
  - E2E: existing export e2e continues to pass; canvas pixel snapshot for one archetype.
- Delete the now-unused `TypeReveal` component + module after migration verifies clean.

## Out of scope

- Color palette, design tokens, typography stack, axis chip recipe.
- Welcome screen, Quiz screen, HomepageCarousel, ComparisonBars, MatchList, MatchDetail, MatchBrowse, RetakeButton, TraitsPanel, TraitCarousel, TraitBar, ProgressBar, ExportButton, AppShell.
- Scoring, archetype data, divisions data, question data.
- The 32 prompt files in `prompts/` and the generator in `scripts/` (image-generation workstream, not consumed by app).
- Animation rework (existing `type-rise` / `chip-pop` keyframes are reused as-is on the new card).
- Welcome-side teaser of any kind.
- New CTAs, new copy, new flows.

## Architecture

### Components

```
src/components/
  SukarinCard.tsx           ← NEW (replaces TypeReveal)
  SukarinCard.module.css    ← NEW
  TypeReveal.tsx            ← DELETED after migration
  TypeReveal.module.css     ← DELETED after migration
```

### `SukarinCard` composition (top → bottom)

1. **Frame container** — white card (`var(--card)`), 2px border tinted with `var(--B-tint)` (the existing soft blue), 16px radius, `var(--card-shadow)`. Lives directly on results page (no longer overlapping a banner — the indigo banner is removed entirely).
2. **Eyebrow** — text `あなたのスカリン`, color `var(--B)`, small uppercase tracked label.
3. **Sukarin image** — centered, 200×200 px on desktop / 140×140 px on mobile, sourced from `archetypeImages[code]`. Soft drop-shadow for lift. Fallback: hide image silently if missing (no broken icon).
4. **Type code** — `data.code`, small tracked uppercase, color `var(--A)` (existing red accent — currently used for rank numbering on lists).
5. **Type name** — `「{name}」型`, large body sans, weight 800, color `var(--text)` (indigo).
6. **Axis chips** — five chips, one per axis, current multi-hue recipe (`tc-A` … `tc-E`) untouched, kanji per `userScores[ax] >= 0`. Same chip dimensions and spacing as today.
7. **Type description** — `data.desc`, body text, `var(--text-sec)`, max-width 480px, centered.

The existing TypeReveal animation (`type-rise` = fade + small upward translate, `chip-pop` = fade + scale-from-92% with staggered delays) is ported into `SukarinCard.module.css` unchanged. The Sukarin image gets the `type-rise` keyframe with the earliest delay (~60ms) so it's the first element to settle. Reduced-motion users see the card statically.

### Asset pipeline

Add `src/lib/sukarinImages.ts`:

```ts
const modules = import.meta.glob<{ default: string }>(
  '../assets/sukarin/*.png',
  { eager: true },
);

export const sukarinImages: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const code = path.match(/([A-Z]{5})\.png$/)?.[1] ?? '';
    return [code, mod.default];
  }),
);

export function sukarinSrc(code: string): string | undefined {
  return sukarinImages[code];
}
```

Vite's `import.meta.glob({ eager: true })` produces a module map at build time; URLs are stable, hashed, and tree-shakeable. The code parameter is typed as `string` to match how archetype codes flow through the existing app (keys of the `TYPES` record). A unit test confirms all 32 archetype codes resolve.

### Export PNG masthead update

`drawMasthead(ctx, data)` in `src/lib/exportPng.ts` is reworked to draw the SukarinCard composition inside the existing masthead region (top of A4 portrait). The rest of the export — `drawProfile` (axis bars), top-5 / bottom-3 list, footer + QR — is unchanged.

New masthead layout:

```
┌────────────────────────────────────────────────────────┐
│ YOKOSUKA · 課適性診断                       2026-05-01 │
│                                                        │
│   ┌──────────────────────────────────────────────┐     │
│   │  あなたのスカリン                              │     │
│   │       [ Sukarin image, ~150×150 ]            │     │
│   │       DASCG                                  │     │
│   │       「街のよろず屋」型                       │     │
│   │       [人][動][援][守][幅]                    │     │
│   │       市民に寄り添いながら…(2-3 lines)        │     │
│   └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────┘
```

Implementation details:

- The canvas API loads the Sukarin PNG via `Image()` and `drawImage`; the existing `document.fonts.ready` wait in `ExportModal.tsx` is replaced with a `Promise.all([fontsReady, imagesReady])` so the PNG draws after the asset finishes loading.
- The 32-archetype mini-grid in the right half of the current masthead is removed — the SukarinCard takes the full width.
- Existing helpers (`drawTrackedText`, `drawHairline`, font/size constants, MASTHEAD_H, PAGE_PAD_X, INDIGO, CREAM) are reused. No new render helpers needed beyond an image-draw step.
- `MASTHEAD_H` may need to adjust to fit the card; if so, downstream Y offsets (`PROFILE_TOP`, etc.) shift uniformly. Spec'd as a single constant tweak, not a layout rewrite.

### Data flow

```
ResolvedArchetype (code, name, desc) ──┐
userScores (5 axis sign+magnitude) ────┤
                                       ├── SukarinCard ─→ DOM
                                       │
                                       └── exportPng.drawMasthead ─→ canvas
                                            ↑
                            sukarinImages[code] ──┘
```

Both paths source from the same `useDerived()` hook (results screen) and `buildExportData(...)` (PNG); no new state, no new selectors.

## Error handling

- **Missing Sukarin image for a code.** UI: render the existing type-name + chips + description without the image; no error UI. PNG: skip image draw; bars + lists still render. Risk is negligible since unit test enforces all 32 codes resolve.
- **Image load failure on PNG export.** `imagesReady` Promise resolves on `error` so export still proceeds without the image (text-only fallback). User can retry.
- **No new failure modes** introduced for scoring, ranking, or quiz state.

## Testing

- **Unit:** `src/lib/sukarinImages.test.ts` — all 32 archetype codes resolve to a non-empty URL.
- **E2E:** existing `tests/export.spec.ts` (open modal → render canvas → download PNG) continues to pass. Add an assertion that `data:image/png` blob size > existing masthead-only baseline (signals image embed worked).
- **Snapshot:** add a Playwright pixel screenshot for the results screen showing `SukarinCard` for one archetype (e.g., DASCG), accept under `prefers-reduced-motion` to keep snapshot stable.

## Migration order (Approach 2 — vertical slice, results first)

1. Add `src/lib/sukarinImages.ts` + unit test.
2. Build `SukarinCard.tsx` + module CSS, port `TypeReveal` animation.
3. Wire `Results.tsx` to render `SukarinCard` instead of `TypeReveal`. Smoke-test in browser.
4. Update `drawMasthead` in `exportPng.ts` to render new composition; verify canvas in `ExportModal`.
5. Add `Promise.all` for fonts + images in `ExportModal.tsx`.
6. Run e2e + manual export check.
7. Delete `TypeReveal.tsx` + `TypeReveal.module.css`.

Each step is a single commit, in this order. Rollback at any step is local revert; no migrations or data changes.

## Acceptance criteria

- Results screen for any of 32 archetypes shows the SukarinCard with the correct Sukarin image, type code, type name, multi-hue axis chips matching `userScores`, and description.
- Indigo `TypeReveal` banner is gone from the results screen.
- Existing components below the card (TraitsPanel, MatchBrowse) render unchanged.
- Exported PNG visually mirrors the SukarinCard inside its masthead area; bars, top-5, bottom-3, footer, and QR remain visually equivalent to today (with minor coordinate shifts if `MASTHEAD_H` changes).
- All existing tests pass; new unit + snapshot tests added.
- `prefers-reduced-motion` users see a static SukarinCard, no animation.
- WCAG AA contrast preserved on body text and interactive controls.
