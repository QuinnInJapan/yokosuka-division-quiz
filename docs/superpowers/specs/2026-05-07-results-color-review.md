# Results Page — Color Scheme Audit

> **Status: SUPERSEDED** by `2026-05-07-app-color-audit.md` (2026-05-07).
> Reviewers rejected this doc for: aesthetics-only framing without user-task grounding, missing measurements, Results-only scope (cross-file impact unaddressed), stale axis-E values. Retained for history.

**Date:** 2026-05-07
**Scope:** `src/screens/Results.tsx` and direct dependencies
**Author:** Color/UI review pass

## Files in scope

- `src/screens/Results.tsx`
- `src/screens/Results.module.css`
- `src/components/SukarinCard.{tsx,module.css}`
- `src/components/TraitsPanel.tsx`
- `src/components/TraitBar.{tsx,module.css}`
- `src/components/MatchBrowse.{tsx,module.css}`
- `src/components/MatchList.{tsx,module.css}`
- `src/components/MatchDetail.{tsx,module.css}`
- `src/components/ComparisonBars.module.css`
- `src/components/FitRing.tsx`
- `src/components/ExportButton.module.css`
- `src/components/RetakeButton.module.css`
- `src/lib/archetypePalette.ts`
- `src/lib/scoring.ts` (`fitColor`)
- `src/styles/tokens.css`

## Page structure

Four stacked bands:

1. **Hero** — per-archetype dark gradient + 3 colored blobs, white text. Holds Sukarin character + type name.
2. **Traits** — `--cream` (#FAF7F2) bg, indigo chapter mark. 5-axis trait carousel + bars.
3. **Match** — `--C-tint` (#ECF8F1, mint) bg, `--C` (green) chapter mark. List + detail of ranked divisions.
4. **Actions** — `--hero-accent` (#F5EBD8, warm cream) bg. Export + retake buttons.

## Token inventory used on this page

- Axis families: `--A/B/C/D/E` × `dark/mid/tint` (15 hues)
- Brand: `--hall-indigo` (#1C2340) + hover variant
- Neutrals: `--text`, `--text-sec` (#4A5568), `--sub` (#6B7280), `--border` (#E4E7ED), `--border-light` (#F0F2F7)
- Selection tints: `--indigo-tint` (#DCE4F8), `--indigo-tint-soft` (#F0F3FF)
- Band bgs: `--cream`, `--C-tint`, `--hero-accent`
- Focus: `--focus-ring` (#2E6DB4)

Total distinct hues actively rendered on a single Results screen: **~10–12** (axis colors used in bars + blobs + chapter mark + fit ring + section bgs).

## Findings

### F1. Section temperature bounces

Hero (cool dark) → Traits (warm cream) → **Match (cool mint)** → Actions (warm cream).

No temperature progression. Mint band reads as outlier. Cream → mint → cream creates a "what is this section?" visual hiccup at scroll. No emotional or informational reason for the temperature flip mid-page.

### F2. Mint band hardcodes axis-C semantics

`--band-match: var(--C-tint)` and `match .chapterMark { color: var(--C); }`.

Axis C in this app means R/S poles (a personality dimension). Reusing its color tokens for the unrelated "match a division" chapter conflates meanings. Compounds with:

- `TraitBar` for axis C renders bars in same green family.
- `MatchList` active state (just changed) now also uses `--C` at 20% alpha.

Three distinct UI affordances share one hue. Color-as-semantic signal collapses.

### F3. Active-state language inconsistent

- `TraitBar` active: `--indigo-tint-soft` (#F0F3FF, blue-leaning)
- `MatchList` active: `rgba(30, 115, 69, 0.20)` (green)

Two interactive selection patterns on the same screen, two hue families. Users can't transfer learning between the trait carousel and the division list. Both are "I clicked this row" affordances; both should speak the same color language.

### F4. `fitColor` reuses axis tokens as a fit ramp

```ts
if (p >= 80) return { fill: '#4CAF7D', ... }; // == --C-mid
if (p >= 60) return { fill: '#4A90D9', ... }; // == --B-mid
if (p >= 45) return { fill: '#F5A623', ... }; // == --E-mid
return { fill: '#E8534A', ... };              // == --A-mid
```

Same hexes carry axis meaning elsewhere. A 60% fit ring is the same blue as the B-axis bar two sections up. Cross-channel ambiguity: is the user reading "B-axis-ness" or "fit tier"?

### F5. Hero blob hue ≠ gradient temperature

`archetypePalette.ts` derives gradient from a `warmth` heuristic (sum of A+/C+ pole counts). Blobs are independently sampled from axes 0/1/2 of the archetype code. Result: a "cool" gradient (warmth=0, dark indigo) can host A-red and D-purple blobs that fight the bg. No temperature contract between gradient and blobs.

### F6. Cream vs hero-accent collision

- `--cream` #FAF7F2 (Traits)
- `--hero-accent` #F5EBD8 (Actions)

Both warm off-whites within ~5 ΔE. Last two bands read as the same temp/tone, weakening the chapter rhythm. Reader doesn't perceive Actions as a distinct section.

### F7. List vs detail card surface parity

`MatchList` bg = `rgba(255, 255, 255, 0.6)` over mint band → washed mint surface.
`MatchDetail` `.match-card` bg = solid white.

Detail card pops; list looks demoted. Both are equally important — list is where users actually choose. Surface hierarchy implies list is secondary.

### F8. Suffix contrast

`SukarinCard .suffix` (型) renders at `rgba(255, 255, 255, 0.7)`, ~24px effective size on dark hero gradient. Borderline for small text. WCAG AA needs 4.5:1; 0.7 white alpha drops to ~3.5:1 against the lighter parts of the gradient.

### F9. Match chapter mark green is the only green text on the page

Other axis colors only appear as bars/dots/rings. The Match chapter label being green is a one-off. No echo elsewhere unless the user happens to land on a high-fit (≥80%) division → green fit ring. Even then: the chapter mark is a navigational signpost, the fit ring is data; they shouldn't share a color by coincidence.

### F10. No band seams

Bands butt directly. Mint→cream-warm transition is jarring without a divider. The hero→traits transition works because of the dramatic value jump (dark→cream), but traits→match→actions all sit in the mid-light value range and need explicit separators.

## Proposed fixes

### A. Drop mint band

- `--band-match`: `var(--C-tint)` → new `var(--paper-warm, #F4EEE0)` (one step deeper than `--cream`)
- `Results.module.css`: `.match .chapterMark { color: var(--C); }` → `color: var(--hall-indigo);`

Resolves F1, F2, F9. Establishes a paper-tone progression (cream → deeper cream → sand) instead of a temperature flip.

### B. Unify active-state language

- `MatchList .all-item.on`: `rgba(30, 115, 69, 0.20)` → `var(--indigo-tint)` (#DCE4F8)
- Hover non-active: `rgba(30, 115, 69, 0.08)` → `var(--hover-wash-list)` (already exists, #F6F7FB)

Resolves F3. Brand indigo becomes the single "selected" signal across TraitBar and MatchList.

### C. Dedicated fit-tier tokens

Add to `tokens.css`:

```css
--fit-top:  #1E7345; --fit-top-fill:  #4CAF7D; --fit-top-bg:  #ECF8F1;
--fit-high: #0F766E; --fit-high-fill: #14B8A6; --fit-high-bg: #ECFDF5;
--fit-mid:  #B45309; --fit-mid-fill:  #F59E0B; --fit-mid-bg:  #FFFBEB;
--fit-low:  #B91C1C; --fit-low-fill:  #EF4444; --fit-low-bg:  #FEF2F2;
```

Refactor `fitColor` to consume tokens. Hexes deliberately diverge from axis tokens (teal not blue for "high", etc.) so a fit ring can never be confused with an axis bar.

Resolves F4.

### D. Blob temperature filter in `archetypePalette`

When `warmth >= 2` (warm gradient), filter blob pool to `{A, D, E}` (warm axes).
When `warmth === 0` (cool gradient), filter to `{B, C, D}` (cool/cool-purple).
When `warmth === 1`, allow full pool but cap saturation via lower max opacity (0.32 instead of 0.48).

Resolves F5.

### E. Differentiate Actions band

- `--hero-accent` (#F5EBD8) currently used for both Welcome hero accent and Results actions band.
- Decouple: introduce `--band-actions: #EBDDC2` (clearly sandier) OR neutral `var(--bg)` (#F0F2F7) for an "exit/wind-down" feel.

Resolves F6.

### F. Solid list surface

- `MatchList .all-list--side` bg: `rgba(255, 255, 255, 0.6)` → `white`
- Active state from fix B (indigo tint) provides the contrast delta now that we can no longer go "deeper than white".

Resolves F7.

### G. Suffix alpha

`SukarinCard .suffix`: `rgba(255, 255, 255, 0.7)` → `rgba(255, 255, 255, 0.85)`.

Resolves F8.

### H. Band seams

Add to `Results.module.css`:

```css
.traits, .match, .actions {
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.04);
}
```

Or 32px gradient fades at top of each band. Pick one; not both.

Resolves F10.

## Priority

- **High-impact, low-risk**: A, B, C, F. Address structural color-semantic confusion.
- **Polish**: G, H. Quick wins.
- **Behavior change**: D (touches blob algorithm), E (touches Welcome hero by removing shared token).

## Open questions

1. Do axis colors need to remain reserved for axis context only? (Recommended: yes.)
2. Is mint specifically meaningful to the "match" section in any user-research finding, or is it inherited from earlier prototype? (Assume inherited unless told otherwise.)
3. Should fit ramp use sequential (single-hue lightness) or categorical (4 distinct hues) encoding? Categorical proposed above; sequential (e.g., teal lightness ramp) would feel calmer but discriminate worse at glance.
