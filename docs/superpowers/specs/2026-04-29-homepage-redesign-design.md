# Homepage Redesign — Design Spec

**Date:** 2026-04-29
**Branch target:** prototype directory (`prototypes/homepage-v2/`), no merge yet
**Carousel preserved wholesale.** Hero column, page chrome, and stepper rebuilt from scratch by an agent forbidden to read the originals.

## Goals

Rebuild the homepage to fix three concrete complaints from the existing design:

1. Left column is mono-tonal — only indigo + white, hierarchy carried entirely by opacity tiers.
2. Vertical stepper TOC has heavy chrome (border-radius + inset stripe collision, badges, double-language labels) and steals horizontal space from the carousel.
3. Page contains ~14 boxes; nothing aligns cleanly because of the sheer count.

## Non-Goals

- No change to carousel internals (`HomepageCarousel.tsx`, `slides/*`). Ported verbatim.
- No new design tokens unless an existing token cannot express the value.
- No change to copy-deck semantics (Japanese stays primary). Agent may rewrite English/eyebrow copy where layout demands; JP titles, stat numbers, and CTA stay verbatim.
- No mobile work in this pass. Single-screen desktop ≥1280px is the only target. Mobile = stacked, untuned.

## Anti-Patterns to Forbid

The agent must avoid each of these explicitly. They are the failures of the existing design:

1. **Opacity-only hierarchy.** Do not use `opacity: 0.55 / 0.6 / 0.82` to differentiate three text levels on the dark column. Use size and weight.
2. **Border-radius + inset-stripe collision.** Do not place a square inset shadow stripe (e.g. `box-shadow: inset 4px 0 0 indigo`) on a button that also has `border-radius`. The square stripe reads as clipped.
3. **Bilingual stacked labels everywhere.** Do not pair an English eyebrow with a Japanese title in every section. Pick one per section. Stepper carries no English sub-labels.
4. **Box jungle.** Do not give every primitive a card (panel + 5 stepper rows + 5 axis cards + 6 question pills + CTA + hero column = 18+ adjacencies). Cards only where affordance requires shape. Net target: 6 visible boxes on the page.
5. **Decorative stat trio.** Do not render `20 / 5 / 102` as a small eyebrow-weight strip. They are the most impressive content; they must anchor.
6. **Floating sub-columns with no container relationship.** Do not let secondary content (lists, examples, callouts) hang off in their own column with no anchor to the main flow. (Note: slide internals are out of scope; this rule applies to outer chrome only.)
7. **Inconsistent column padding.** Do not use different `clamp()` values per column (e.g. `6vw` left, `5vw` right). Both columns share one horizontal padding token.
8. **TOC mass.** Do not build a vertical rail of 36px circular badges with double-language labels and dotted connectors. The five steps fit in <40px of vertical space.
9. **Wasted axis colors.** Do not reduce the five axis colors (A red, B blue, C green, D purple, E amber) to 26px letter circles only. They are tokens for *meaning*; use them as section accents.

## Layout

Two-column split, fixed proportions:

- Left (hero): `420px` fixed
- Right (content): fluid

Both columns share `padding-inline: var(--sp-2xl)` (48px). Same vertical padding clamp. Single-screen on desktop ≥1280px (no scroll). Mobile (<900px): stacked, hero on top, no min-height enforcement.

## Hero Column (Left)

Background: `var(--hall-indigo)` full-bleed. Ink: white.

**Color budget:** indigo + white + ONE accent. Accent = warm cream `#F5EBD8` OR a single axis hue (agent picks; documented choice). Accent is used for stat numerals only.

**Type hierarchy** — by size and weight, never opacity:

| Element  | Size           | Weight         | Color                          |
|----------|----------------|----------------|--------------------------------|
| Eyebrow  | 12px caps      | 700            | `white@70%` (one tier, used once) |
| Title    | 56px           | 800 (`--fw-black`) | white                      |
| Lede     | 16px           | 400            | white                          |
| Stat numerals | 56px      | 800            | accent color                   |
| Stat labels   | 11px caps | 700            | white                          |

**Stats anchor the column.** Stack: eyebrow → title → lede → stats trio (large) → CTA. Stats sit above CTA, not below.

**CTA:** white pill button, indigo text. No "所要時間" subtitle — fold into button micro-copy or drop entirely.

**Axis-color hint:** five 4px-wide × 60px-tall vertical stripes at bottom-left of hero column, one per axis color (A/B/C/D/E). Subtle preview that "color = meaning" in the right column.

## Right Column (Content)

**No panel background.** No border. Right column inherits `--bg`. Just whitespace.

**No "How it works / 仕組みを見る" header.** The carousel slide content speaks for itself.

### Stepper (rebuilt from scratch)

Lives at the **bottom of the carousel viewport** (pagination footer placement, not header).

Structure:

- Numerals row: `01 · 02 · 03 · 04 · 05` (separated by hairlines, not connectors)
- Active numeral: bold, indigo, 2px indigo underline
- Done numerals: indigo, no underline
- Upcoming numerals: `var(--sub)` gray, no underline
- No badges, no circles, no JP/EN double labels in the strip itself

**Single contextual label below the strip.** One line, small gray text, shows ONLY the current step's JP label (e.g. "採点"). Updates per slide. Layout never shifts. No other labels visible.

Total stepper height: ~36px.

### Carousel

Imported verbatim from `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/`. Files copied unchanged:

- `HomepageCarousel.tsx`
- `HomepageCarousel.module.css`
- `index.ts`
- `slides/Slide2Input.tsx` through `slides/Slide6Example.tsx`

The new `Welcome.tsx` renders `<NewStepper />` and `<HomepageCarousel />` separately so stepper can be reordered and restyled without touching carousel internals. (May require a small refactor to extract stepper out of `HomepageCarousel.tsx` — agent decides; document choice.)

### Slide Internals — Out of Scope

The 5 axis cards, question examples, and other slide-level content are part of the verbatim port and **must not be restyled**. Anti-pattern fixes (box reduction, axis colors as accents) apply only to the outer chrome the agent is rebuilding (hero column, page split, stepper, surrounding whitespace). If slides look stylistically inconsistent with new chrome, that mismatch is logged for follow-up, not fixed in this pass.

## Files & Scaffold

```
prototypes/homepage-v2/
├── index.html              # standalone Vite entry
├── vite.config.ts          # isolated dev server (port 5174 to avoid collision)
├── package.json            # extends root, adds dev script
├── src/
│   ├── main.tsx
│   ├── App.tsx             # renders new Welcome
│   ├── Welcome.tsx         # rebuilt
│   ├── Welcome.module.css
│   ├── Stepper.tsx         # rebuilt: numerals + contextual label, bottom placement
│   ├── Stepper.module.css
│   └── HomepageCarousel/   # COPIED VERBATIM from worktree
│       ├── HomepageCarousel.tsx
│       ├── HomepageCarousel.module.css
│       ├── index.ts
│       └── slides/...
```

Reuses root `src/styles/tokens.css` via relative import. No new token files. New tokens may be added to a local `prototype-tokens.css` only if absolutely needed; document each addition.

## Files Agent May Read

- `src/styles/tokens.css`
- `src/data/axes.ts` (axis colors and labels)
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/**` (verbatim port reference)

## Files Agent Must NOT Read

- Original `src/screens/Welcome.tsx`
- Original `src/screens/Welcome.module.css`
- `.worktrees/feat-homepage-carousel/src/screens/Welcome.tsx`
- `.worktrees/feat-homepage-carousel/src/screens/Welcome.module.css`
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/Stepper.tsx`
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/Stepper.module.css`

The agent rebuilds these from this spec only. No copying patterns.

## Constraints

- **Tokens:** Use `tokens.css` (indigo, axis colors, spacing scale, fonts). New tokens require justification.
- **Copy:** JP titles, stat numbers, CTA verbatim. English eyebrows / sub-labels / TOC labels: agent may rewrite or drop where layout demands.
- **Viewport:** Single-screen desktop ≥1280px = no scroll. Mobile <900px = stacked, untuned.

## Acceptance Criteria

- New homepage renders at `prototypes/homepage-v2/` via isolated Vite dev server.
- Carousel functions identically (5 slides, keyboard nav, swipe).
- Stepper sits at bottom of carousel viewport, numerals-only with single contextual label.
- Net visible box count ≤ 6.
- Hero column uses size+weight hierarchy, not opacity tiers.
- Axis colors visible as accent in hero column (5 vertical stripes hint).
- No bilingual label stacking anywhere.
- No border-radius + inset-stripe collisions.
- Both columns share horizontal padding token.

## Open Questions

None. Hand off to writing-plans.

## Implementation Notes

**Accent color for stat numerals:** `--hero-accent: #F5EBD8` (cream, per spec recommendation). Defined at `Welcome.module.css:4`, consumed only by `.statN` at `Welcome.module.css:67`. Not added to `tokens.css` — it is a local prototype variable, not a shared design token.

**Carousel refactor (Task 3):** `idx` / `onIdxChange` were lifted to props on `HomepageCarousel`. `Welcome.tsx` owns the state via `useState(0)` and passes both down to `<HomepageCarousel idx={idx} onIdxChange={setIdx} />` and `<Stepper idx={idx} onJump={onJump} />`. No surprise diffs — exactly as planned.

**New tokens added:** Zero. `--hero-w` (420px), `--col-pad` (alias for `--sp-2xl`), and `--hero-accent` (#F5EBD8) are all local CSS custom properties declared in `Welcome.module.css:root` scoped to that file. `tokens.css` is unchanged.

**Box count audit:** Visible boxes (elements with a background color or visible border, excluding slide internals):
1. Hero aside — `background: var(--hall-indigo)` — 1 box
2. CTA button — `background: white` — 1 box
3. Five axis stripes — `background: AXIS_COLORS[i]` — 5 colored stripes (counted as 1 group / 1 "visible box" in chrome)

Total outer-chrome boxes: **3** (hero column, CTA pill, stripe row). Well under the ≤6 target. Right column has no background, no border. Stepper has no box backgrounds.

**Anti-pattern audit results:**

1. **Opacity-only hierarchy** — PASS. Eyebrow: `rgba(255,255,255,0.7)` (one tier, used once, `Welcome.module.css:34`). Title, lede, stat labels: all solid white. Hierarchy carried by 56px/fw-black (title), 16px/fw-normal (lede), 12px/fw-bold (eyebrow). No additional opacity tiers.
2. **Border-radius + inset-stripe collision** — PASS. CTA has `border-radius: 999px` and zero `box-shadow` (`Welcome.module.css:86-91`). Stepper buttons have `border-bottom: 2px solid` (bottom-only underline, not inset), with `border: 0` for the outer border — no rounded container with inset stripe.
3. **Bilingual stacked labels** — PASS. Stepper renders only numerals (`01`–`05`) and a single JP contextual label below the strip (`入力`, `採点`, etc.). No EN sub-labels anywhere in stepper or outer chrome.
4. **Box jungle** — PASS. Box count = 3 (hero, CTA, stripes group). Target ≤6. Passes with large margin.
5. **Stat numbers as decoration** — PASS. `.statN` is `font-size: 56px; font-weight: var(--fw-black)` (`Welcome.module.css:65-69`). Stats anchor the column between lede and CTA.
6. **Floating sub-columns** — PASS. Outer chrome is strictly two columns (`.split` grid). No secondary content hangs in a disconnected column. Slide internals are out-of-scope verbatim port.
7. **Inconsistent column padding** — PASS. Both `.hero` and `.right` use `padding-inline: var(--col-pad)` (`Welcome.module.css:22` and `Welcome.module.css:118`). `--col-pad` resolves to `var(--sp-2xl)` for both.
8. **Heavy stepper chrome** — PASS. Stepper has no badges, no circles, no dotted connectors. Five numeral buttons separated by 1px hairlines (`Stepper.module.css:46-50`). Total stepper height ≈ 36px.
9. **Wasted axis colors** — PASS. Five `4px × 60px` vertical stripes at bottom-left of hero (`Welcome.module.css:105-115`) use all five axis tokens (A/B/C/D/E) as visible color meaning cues.
10. **Section titles competing with content** — PASS. No "How it works" or "仕組みを見る" header above the carousel. Right column is pure carousel + stepper, no section heading.

**Close calls / avoidance notes:**

- Anti-pattern 2 (border-radius + inset stripe) was the most likely trap given the CTA pill button. Avoided by using `transform: translateY(-1px)` on hover rather than any box-shadow decoration.
- Anti-pattern 4 (box jungle) required consciously not wrapping the carousel or stepper in card panels. The right column is backgroundless — tempting to add a subtle card for visual separation, which was deliberately avoided.

**Acceptance criteria check:** All 9 criteria met (see anti-pattern results above). E2e suite: 6/6 PASS.

**Open follow-ups for future work:**

- Mobile layout is stacked but untuned. Hero at 100% width with 56px title and large stats will likely need type-scale reduction and padding adjustment for small viewports.
- Slide internals (axis cards, question pills) are verbatim port from the old design and retain their own box/padding patterns. A future pass could harmonize slide chrome with the new outer design language.
- Reference screenshot captured at `docs/superpowers/specs/2026-04-29-homepage-v2-screenshot.png` (50.2 KB, 1440×900).
