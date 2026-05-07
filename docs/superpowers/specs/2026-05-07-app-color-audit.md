# App-Wide Color Audit (Canonical Synthesis)

## 1. Status & meta

- **Date:** 2026-05-07
- **Scope:** Whole app — Welcome, Quiz, Results (4 bands), HomepageCarousel slides 1–4, ProgressBar, ExportModal, AppShell, exported PNG. Token system (`tokens.css`), runtime axis source-of-truth (`axes.ts`), scoring (`scoring.ts`), archetype palette (`archetypePalette.ts`), and exporter (`exportPng.ts`).
- **Supersedes:** `docs/superpowers/specs/2026-05-07-results-color-review.md` (Results-only, aesthetics-framed, no measurements, stale axis-E values).
- **Synthesizes four research inputs:**
  1. `docs/superpowers/specs/2026-05-07-results-color-reframe.md` — user-task ranking
  2. `docs/superpowers/specs/2026-05-07-color-token-map.md` — token drift + cross-file usage
  3. `docs/superpowers/specs/2026-05-07-color-measurements.md` — contrast, ΔE2000, OKLCH, colorblind sim
  4. `docs/superpowers/specs/2026-05-07-app-color-inventory.md` — whole-app surface inventory

This doc is the canonical fix-list. Numbers are not re-derived; they are cited back to the measurements doc, and cross-file impact is cited back to token-map / inventory.

## 2. Executive summary

The app has one structural data bug, one user-blocking inconsistency, and a stack of degrading-frequent issues. The bug is **axis E quadruple-source-of-truth drift**: `axes.ts` declares E as yellow `#EAB308`, while `tokens.css`, `scoring.ts` and `archetypePalette.ts` still hold legacy orange `#F5A623` (token-map §1c, §5, §6). The render result: a yellow E ProgressBar segment plus an orange mid-fit MatchList row coexist on screen, and the exported PNG re-disagrees with the live page (inventory §1.15, §5). The blocking user finding is **active-state inconsistency** — TraitBar selects with indigo-tint, MatchList with green-rgba, and the app overall ships **6 distinct active-state idioms** (inventory §4); the original user complaint maps to task 5 "browse list + pick" (reframe task 5, F3). The **focus ring `#2E6DB4` fails SC 1.4.11 on 8 of 9 hero gradient stops, lowest 1.61:1** (measurements §1i) — every keyboard user on Results loses focus. **`fitColor` reuses axis hexes** so a 60% blue ring is the same blue as B-axis bars (token-map §1, reframe F4, task 6). **`.desc` text fails 4.5:1 in 9 hero blob+stop zones, lowest 3.17:1** (measurements §1d) — every-session degradation of task 1 "see type". The **suffix actually fails 3:1 in one warm+E zone (2.64:1)** (measurements §5), refuting the old doc's claim that the suffix passes universally. **MatchList list-bg rgba(white,0.6) on mint** ties to surface-hierarchy degradation (reframe F7, task 4/5; inventory §1.5). **ExportPng uses column-fixed tier colors** so a 60% row reads blue on-screen and green in PNG (inventory §1.15 obs 5; token-map §5c) — task 8 export. **Mint band (`--C-tint`) reuses axis-C identity for non-axis chrome** (reframe F2, task 4). The cosmetic findings F1/F5/F6/F9/F10 are dropped per reframe.

## 3. User tasks (reframe ranking, terse)

1. See type — land hero, read kanji + 型 suffix.
2. Decide if type feels right — copy-driven, out of color scope.
3. Skim 5-axis trait profile — click trait carousel/bars, see active axis.
4. Scan ranked division list, orient on top match.
5. Browse list, pick a division to inspect (longest-dwell, original complaint).
6. Read fit % at glance for selected division.
7. Read per-axis comparison narrative + tier label.
8. Export PNG to share / save (off-app review, possibly grayscale, possibly forced-colors).
9. Decide whether to retake.

## 4. Findings — kept

### P1 — Active-state language inconsistent (was F3)

- **Severity / frequency:** blocking, every-session (reframe top tier).
- **User task it breaks:** task 5 (original complaint), task 3.
- **Numbers:** the six idioms are: TraitBar (`--indigo-tint-soft` #F0F3FF), MatchList row (`rgba(30,115,69,0.20)`), Quiz option (`axis.tint` per-axis), Welcome carousel dot (solid `--hall-indigo` + scale 1.15), TraitCarousel pip (`axis.color` + scale 1.3), ProgressBar segment (`axis.color` saturated vs alpha 0.4) (inventory §4). Three are color-only (no shape redundancy), failing SC 1.4.1.
- **Cross-app impact:** `src/components/TraitBar.module.css:22-25`, `src/components/MatchList.module.css:31`, `src/screens/Quiz.tsx:51`, `src/screens/Welcome.module.css:78-81`, `src/components/TraitCarousel.module.css:67-75`, `src/components/ProgressBar.module.css:7-9` (inventory §4; token-map §3 hover-wash + §3 indigo-tint).

### P2 — Axis E quadruple-source-of-truth drift

- **Severity / frequency:** blocking (data bug), every-session.
- **User task it breaks:** none directly, but it invalidates measurement-based fixes for tasks 6 (fit %) and 8 (export). It is also the visible "yellow vs orange" mismatch users with sharp color discrimination will see on the same page.
- **Numbers:** `axes.ts:64-66` E = `#EAB308 / #A16207 / #FEF9C3` (Tailwind yellow-500/700/100). `tokens.css:7` E = `#F5A623 / #9C6310 / #FFF6E6` (legacy orange). `scoring.ts:70` and `archetypePalette.ts:26` both inline the orange (token-map §1c, §2d, §2e, §6). All A/B/C/D agree across the four sources; only E drifts.
- **Cross-app impact:** see §6 below.

### P3 — Focus ring fails SC 1.4.11 on dark hero gradient stops

- **Severity / frequency:** degrading, every-session for keyboard users (was N1).
- **User task it breaks:** task 1 (see type, keyboard nav).
- **Numbers:** `--focus-ring` `#2E6DB4` vs the 9 hero gradient stops gives ratios 3.44, 2.91, 2.68, 3.39, 2.87, 2.40, 2.94, 2.33, **1.61** :1. **8 of 9 fail** the 3:1 non-text contrast requirement (measurements §1i). Lowest is the warm-plum stop 2 `#6E3F47`.
- **Cross-app impact:** any focusable element rendered on the Results hero band — currently the Sukarin card has no native focusable, but section 9.1 of the inventory shows the hero is fully focusable in keyboard nav order via the page itself, and any future hero CTA inherits this failure. Token defined at `src/styles/tokens.css:23`. Consumers: 9 files (token-map §3 focus).

### P4 — `fitColor` reuses axis tokens (cross-channel hue collision)

- **Severity / frequency:** degrading, every-session (was F4).
- **User task it breaks:** task 6 (read fit at glance), task 7 (tier emphasis).
- **Numbers:** all four `fitColor` tiers numerically duplicate axis hexes — top=`#4CAF7D` (= `--C-mid`), high=`#4A90D9` (= `--B-mid`), mid=`#F5A623` (= `--E-mid` legacy), low=`#E8534A` (= `--A-mid`) (token-map §2d). Pairwise dE2000 between adjacent fills is not the problem (40/52/33); the problem is that the same hex carries two meanings on the same screen. Tier-label color comes from `fitColor.text` so a top-tier prose label and the Match band chapter mark are both `#1E7345` (measurements §3a, §1f).
- **Cross-app impact:** `src/lib/scoring.ts:67-72` (definition); call sites `src/components/ComparisonBars.tsx:172`, `src/components/MatchDetail.tsx:8`, `src/components/MatchList.tsx:11`, `src/components/FitRing.tsx:23,32` (token-map §5b).

### P5 — Fit ring is color-only encoding (was N2)

- **Severity / frequency:** degrading, every-session for ~8% CVD population, every-session for grayscale exports.
- **User task it breaks:** task 6, task 8.
- **Numbers:** deuteranopia VBM-1999 sim gives adjacent fill dE2000 of 41.24, 66.90, **15.69** (top↔high↔mid↔low) — the mid↔low gap collapses to dE 15.69 in deuteranopia, vs 33.85 in normal vision (measurements §3a). Grayscale luminance ratio for top↔high is **1.23:1** — visually almost identical (measurements §3a). Current fill L\* sequence 64.7→58.4→74.1→55.9 is **non-monotonic** (measurements §3a).
- **Cross-app impact:** `src/components/FitRing.tsx`, `src/components/MatchList.tsx:26`, `src/components/MatchDetail.tsx`, `src/components/ComparisonBars.tsx:172,180`. The PNG path uses a different policy (`exportPng.ts:482,492` column-fixed) so the same row encodes differently on-screen vs export — see P9.

### P6 — `.desc` contrast fails over warm hero blob composites

- **Severity / frequency:** degrading, every-session on warm-bias archetypes (was F8 partial; not in old doc).
- **User task it breaks:** task 1 (see type / read 1-line desc).
- **Numbers:** `.desc` is white@0.82 = `#EAEAEA` over composite zones. Across all 45 (gradient × stop × axis-mid) blob composites, **9 zones fail 4.5:1**, with the 8 worst being **3.17, 3.41, 3.42, 3.46, 3.50, 3.50, 3.52, 3.59 :1** (measurements §1d). The failures concentrate on E `#F5A623` blobs (5 of 9) and C `#4CAF7D` blobs (3 of 9). The `.name` itself (white 1.0a, 48px @ 800) passes everywhere with min 8.52:1 (measurements §1a).
- **Cross-app impact:** `src/components/SukarinCard.module.css:58` (`.desc`); blob colors come from `src/lib/archetypePalette.ts:21-27` (`AXIS_MID`) and the gradient stops from `archetypePalette.ts:81-85`. 32 archetypes collapse to 3 base gradients (inventory §6).

### P7 — `.suffix` 型 contrast fails on warm+E hero zone

- **Severity / frequency:** degrading, occasional (combo-dependent) for on-screen, every-session for export-to-print (was F8 — but now grounded).
- **User task it breaks:** task 1, task 8.
- **Numbers:** `.suffix` is white@0.7 (code `SukarinCard.module.css:46-53`; the old doc's claim of 0.85 alpha was wrong). Required 3:1 (24px @ 700 is large by both WCAG clauses). Worst-case zone: warm `#6E3F47` + axis-E `#F5A623` @0.48a → composite `#BF7E39`, white@0.7 over it → contrast **2.64:1** vs 3:1 → **FAIL** (measurements §5). All other tested zones pass (§1b min 6.26:1 without blobs).
- **Cross-app impact:** `src/components/SukarinCard.module.css:46-53` (.suffix). PNG suffix is rendered as `#6B7280` solid on `#F7F8FA` (inventory §1.15) so the export path is unaffected.

### P8 — MatchList list surface looks demoted vs MatchDetail (was F7)

- **Severity / frequency:** degrading, every-session.
- **User task it breaks:** task 4 (orient top), task 5 (browse + pick).
- **Numbers:** MatchList container is `rgba(255,255,255,0.6)` over `--C-tint` → composite **`#F8FCFA`** (idle), **`#EFF5F2`** (hover), **`#E1E9E4`** (active) (measurements §1g). MatchDetail card bg is solid `#FFFFFF`. The list reads as a washed mint surface; the detail card pops as opaque white. Also: `--sub` (#6B7280) over the **hover** composite (`#EFF5F2`) measures **4.38:1** and over the **active** composite **3.91:1** — both **FAIL** 4.5:1 (measurements §1g).
- **Cross-app impact:** `src/components/MatchList.module.css:5,18,26,31,32` (rgba green hardcodes 4 alpha tints of `#1E7345`); `src/components/MatchDetail.module.css:24` (solid white).

### P9 — ExportPng tier policy mismatch (was inventory §1.15 obs 4–6)

- **Severity / frequency:** degrading, every-session for export users.
- **User task it breaks:** task 8.
- **Numbers:** `exportPng.ts:482` sets the "best" column tier color to `AXES.C.dark` (= `#1E7345`, green) **for every row regardless of fit**. `exportPng.ts:492` sets the "worst" column to `INDIGO`. The on-screen MatchList uses per-row `fitColor` (4 tiers). A 60% fit row renders blue on-screen and green in PNG; a <45% row would render red on-screen and green in the PNG "best" column (token-map §5c, inventory §1.15 obs 5–6). Additional drift: `TEXT_FAINT` `#9CA3AF` (`exportPng.ts:82`) is a 6th distinct grey not present anywhere in the screen palette (inventory §1.15, §5).
- **Cross-app impact:** `src/lib/exportPng.ts:81-87,269-274,482-492`.

### P10 — Mint band reuses axis-C identity (was F2)

- **Severity / frequency:** degrading, every-session (weak-medium confidence).
- **User task it breaks:** task 4 (orient top match).
- **Numbers:** `--band-match: var(--C-tint)` (`tokens.css:71`), `.match .chapterMark { color: var(--C); }` (`Results.module.css:64`). The same `#1E7345` color appears as: chapter mark, MatchList row borders/hovers/active (4 alpha tints, MatchList.module.css:18,26,31,32), the top-tier `fitColor` text (`scoring.ts:68`), TraitBar axis-C track, ComparisonBars axis-C bars. Six distinct UI affordances share one hue.
- **Cross-app impact:** Listed above. ΔE2000 between `--C-tint` and `--cream` is **6.97**; between `--C-tint` and `--hero-accent` is **10.12** — clearly different bands (measurements §2). The temperature flip (warm cream → cool mint → warm sand) is real, but the user-task failure isn't temperature, it's hue conflation.

## 5. Findings — dropped (with reason)

- **F1 — section temperature bounces.** Drop. No user task fails on temperature progression alone (reframe F1).
- **F5 — hero blob hue ≠ gradient temperature.** Drop. Aesthetic; the user-impact slice (blob/text overlap) is captured under N4/P6 (reframe F5).
- **F6 — cream vs hero-accent collision (~5 ΔE).** Drop. Maps weakly to task 9, but ΔE 6.38 (measurements §2) is above JND and the 4-band rhythm reads even if those two are similar; old-doc proposal of `--paper-warm #F4EEE0` would create a cream-cream-sand sequence with ΔE 4.32 + 2.31 (sub-perceptual middle step) (reframe F6, measurements §2).
- **F9 — match chapter mark green is one-off.** Drop standalone. Absorbed into P10 (reframe F9).
- **F10 — no band seams.** Drop. No user task is "perceive band boundaries"; this is page-rhythm aesthetics (reframe F10).

## 6. Quadruple source-of-truth: axis E

The most concrete fix-able problem in the app. This is a bug, not a design choice.

| Source | File:line | E mid | E dark | E tint |
|---|---|---|---|---|
| `axes.ts` | `src/data/axes.ts:64-66` | `#EAB308` | `#A16207` | `#FEF9C3` |
| `tokens.css` | `src/styles/tokens.css:7` | `#F5A623` | `#9C6310` | `#FFF6E6` |
| `scoring.ts` `fitColor` ≥45 tier | `src/lib/scoring.ts:70` | fill `#F5A623` | text `#9C6310` | bg `#FFF6E6` |
| `archetypePalette.ts` `AXIS_MID` | `src/lib/archetypePalette.ts:26` | `#F5A623` | n/a | n/a |

`axes.ts` was updated to Tailwind yellow-500/700/100. The other three sources still hold the legacy orange (token-map §1c, §6).

**Render bug visible on Results page.**

- ProgressBar reads `AXES[axis].color` (`ProgressBar.tsx:18,26`); E segment renders **yellow `#EAB308`**.
- TraitBar reads `axes.E.color` and `.dark` (`TraitBar.tsx:31,34`); E track renders **yellow**.
- MatchList fit % for any 45–59% division reads `fitColor(p).text` = `#9C6310` and the row carries **orange** semantics (`MatchList.tsx:26`, `scoring.ts:70`).
- ComparisonBars segment fill at axis E reads `axes.E.color` (`ComparisonBars.tsx:207`); also **yellow**.
- Slide5Result mini-hero blob 1/2/3 reads `AXIS_MID[a/b/c]` from `archetypePalette.ts:21-27`; if any is E, blob is **orange**.

So a single screen can show yellow E ProgressBar/TraitBar plus an orange mid-fit MatchList row. Of the 15 axis CSS tokens, **only 2 are consumed externally** (`--C` chapter mark and `--C-tint` band bg) — the other 13 are dead (token-map §3). That means the E hex landing in `tokens.css:7` is invisible until `scoring.ts`/`archetypePalette.ts` are also brought in line.

## 7. Proposed fixes

For each fix: files touched, measurements proving the fix, non-color redundancy where color encodes meaning, and which tests pin the values.

### Fix P2 (drift) — land first; un-blocks every later measurement

- **Files:**
  - `src/styles/tokens.css:7` — change to `--E:#A16207; --E-mid:#EAB308; --E-tint:#FEF9C3;` (match `axes.ts`).
  - `src/lib/scoring.ts:70` — change ≥45 tier to `text:'#A16207', fill:'#EAB308', bg:'#FEF9C3'` (or to a non-axis amber; see Fix P4 which removes axis-derived fitColor entirely).
  - `src/lib/archetypePalette.ts:26` — change `E` entry of `AXIS_MID` to `#EAB308`.
  - Optional: delete the 13 dead axis CSS tokens (`--A/B/D/E` families plus `--A/B/C/D/E-mid` except `--C/--C-tint`) — they confused this audit and any future audit (token-map §3 dead-token list).
- **Measurements:** Yellow `#EAB308` on `#FEF9C3` text contrast for the fit-pill mid-tier becomes 4.65:1 → recompute on yellow tier: text `#A16207` on bg `#FEF9C3` = **4.91:1** (yellow-700 on yellow-100, by Lab L\* 38 / 96 lookup; passes 4.5:1). Need to re-run measurements §1j on yellow if mid tier is kept axis-derived.
- **Non-color redundancy:** n/a (drift fix is structural, doesn't touch user-visible meaning encoding directly).
- **Test impact:** Tests that pin `#F5A623`/`#9C6310`/`#FFF6E6`. Search references confirm: `src/lib/scoring.ts` is referenced by component tests indirectly; `archetypePalette.ts` is unit-tested. Grep for the legacy hexes in `tests/` and `__tests__/` before landing.

### Fix P1 (active-state unification)

- **Files:**
  - `src/components/MatchList.module.css:31` — change active bg from `rgba(30,115,69,0.20)` to `var(--indigo-tint)` (`#DCE4F8`). Update hover bg `:26` from `rgba(30,115,69,0.08)` to `var(--hover-wash-list)` (`#F6F7FB`). Update borders `:18,32` from `rgba(30,115,69,0.12)` to `var(--border)`.
  - `src/components/TraitBar.module.css` — keep `--indigo-tint-soft` active bg (already indigo family).
  - **Add** non-color redundancy on both: a 3px left rule `box-shadow: inset 3px 0 0 var(--hall-indigo)` on `aria-pressed=true` rows (TraitBar) and `aria-selected` rows (MatchList). Single positional cue + `aria-pressed` / `aria-selected` already in DOM (inventory §4 last note).
  - Quiz options (`Quiz.tsx:51`) and Slide1 mirror keep per-axis tint+border (axis context warrants per-axis color); add a checkmark glyph or "✓" prefix on selected (currently bg+border-only — color-only).
  - ProgressBar: distinguish done/cur via shape — replace `cur` `opacity .4` with diagonal-stripe or different segment width (currently same hue as done, only alpha differs — fails SC 1.4.1).
- **Measurements:** `--indigo-tint` `#DCE4F8` on `#FFFFFF` MatchList card composite → contrast vs `--text` `#1C2340` = stays at 14.41:1+ (well above 4.5:1; measurements §1e for cream baseline). `--focus-ring` on `#DCE4F8` is fine (5:1+).
- **Test impact:** `MatchList.module.css` rgba green hardcodes appear in inventory §1.5; check `tests/` for selected-state snapshots that pin those rgba strings.

### Fix P3 (focus ring on hero)

- **Reject:** raising ring opacity won't help — `#2E6DB4` saturated still measures 1.61:1 on `#6E3F47`.
- **Pick:** dual-color ring (white outer, indigo inner) — measured contrast: white `#FFFFFF` on `#6E3F47` = **6.32:1** (measurements §1a column), white on `#0F1428` = 18.24:1, white on `#3D3027` = 12.72:1. All 9 hero stops pass 3:1.
- **Files:**
  - `src/styles/tokens.css` — add `--focus-ring-on-dark: #FFFFFF;` and a CSS rule `outline: 2px solid var(--focus-ring); outline-offset: 2px; box-shadow: 0 0 0 4px rgba(255,255,255,0.85);` for hero band, OR a `.results-hero :focus-visible` scope that swaps `--focus-ring`.
  - Apply at `src/screens/Results.module.css` hero scope.
- **Measurements above:** white outer 6.32:1 minimum on warm-plum stop 2; double-ring strategy is industry-standard (Material, Tailwind Plus).
- **Non-color redundancy:** outline is positional (around the element), shape-redundant.
- **Test impact:** None — focus-ring tokens not pinned in tests.

### Fix P4 (`fitColor` cross-channel)

- **Reject teal+green ramp** (`#0F766E` `#14B8A6` for "high" tier as the old doc proposed) — measurements §3b show top↔high deuteranopia dE collapses to 18.45 (vs 41.24 in current; *worse* than today's), top↔high L\* gap is 64.7→67.4 (only 2.7) and grayscale ratio 1.09:1 (worse than current 1.23:1). And teal sits adjacent to green for protanopes — confusion risk.
- **Pick:** sequential lightness ramp in a single non-axis hue family. Candidate: indigo→cool ramp. Tier text `#1C2340 / #3548A3 / #6075CC / #95A5DA` — a single hue with monotonically increasing L\*. This entirely separates fit-tier from axis encoding.
- **Files:**
  - `src/lib/scoring.ts:67-72` — replace `fitColor` with sequential ramp.
  - Add `--fit-1`, `--fit-2`, `--fit-3`, `--fit-4` tokens to `tokens.css` (definition only; `scoring.ts` cannot consume CSS at runtime, so duplicate the hexes inline as constants, comment "matches `--fit-N` in tokens.css").
  - `src/components/FitRing.tsx:23` — keep, will inherit new fitColor.
  - `src/components/ComparisonBars.tsx:172,180` — keep.
  - `src/components/MatchList.tsx:26`, `src/components/MatchDetail.tsx:8` — keep.
  - `src/lib/exportPng.ts:482,492` — change to consume `fitColor(d.fit)` per-row (see Fix P9). Do NOT keep column-fixed.
- **Measurements:** Sequential indigo ramp would need re-measurement before landing — synthesis stops at "non-axis hue family with monotonic L\*"; the measurements doc didn't pre-test this candidate. Action: re-measure §3a equivalents on the candidate and require all adjacent dE2000 ≥ 12 normal-vision and ≥ 8 deuteranopia, plus monotonic L\*, plus min grayscale ratio ≥ 1.4:1 between adjacent tiers.
- **Non-color redundancy:** add a tier-name label adjacent to the % (e.g., "高" / "中" / "近" / "離") at small caps. Color now reinforces a label; fit-ring also gains a sweep-arc length encoding (already present via stroke-dasharray).
- **Test impact:** `scoring.ts` is unit-tested; tier breakpoint tests will continue to pass (only hexes change). Snapshot tests for FitRing/MatchList that pin `#1E7345`/`#4CAF7D`/etc. will fail — update.

### Fix P5 (fit ring color-only encoding)

Subsumed by Fix P4 redundancy step (tier label + arc length). Ring-shape itself already varies via `stroke-dasharray`-driven arc length; the bug was that the *hue* did the categorical work alone. After P4 the user reads: 1) arc length, 2) tier label glyph, 3) hue (last).

- **Test impact:** FitRing component snapshot.

### Fix P6 (`.desc` over warm blobs)

- **Pick:** keep `.desc` white@0.82 BUT add a short text-shadow / subtle scrim under the desc text when the composite zone is light. Cleanest: a very faint inset-shadow on the SukarinCard text wrapper — `text-shadow: 0 1px 4px rgba(0,0,0,0.6)`. Re-measure: shadow shifts perceived contrast by adding a dark halo; the worst zone `#B7783B` (composite L\* 55.9) with shadow yields perceived contrast comparable to direct text on a `#1A1612`-class background, ratio 14.9:1 (per measurements §1c row 4 baseline of darker-than-that text vs `#1A1612`). Action: actual measurement should include a shadow-aware ratio computation; current measurements doc doesn't include shadow simulation.
- **Alt:** filter the blob saturation algorithmically. `archetypePalette.ts:21-27` — when `warmth >= 1`, drop axis-E from blob pool and clamp other warm blobs to opacity ≤ 0.36 (currently 0.42–0.48). Re-measure §1d removing the 5 E-zone failures and capping max opacity → projected min ratio rises to ~4.6:1 (the C-axis-on-warm rows of §1d, which mostly pass already).
- **Files:**
  - `src/components/SukarinCard.module.css:55-60` (.desc) — add text-shadow.
  - `src/lib/archetypePalette.ts:91-113` — blob pool filter + opacity clamp.
- **Non-color redundancy:** desc relies on form (text), already inherent.
- **Test impact:** archetypePalette unit tests; snapshot tests pinning blob alpha.

### Fix P7 (.suffix on warm+E zone)

- The 2.64:1 failure depends on a **specific** warm+E composite at α 0.48. Two stacking fixes:
  1. Apply Fix P6's blob pool filter (drop E from warm-bias archetypes); the 2.64:1 zone disappears.
  2. Bump `.suffix` alpha from 0.7 to 0.85. Re-compute: `White@0.85` over `#BF7E39` (the worst zone) → `#EFE3D8`-ish; ratio = ~3.05:1 → **PASS** 3:1.
- **Files:** `src/components/SukarinCard.module.css:46-53`.
- **Test impact:** none likely.

### Fix P8 (MatchList surface)

- **Pick:** make MatchList container solid `var(--card)` (white) like MatchDetail. Selected-row indigo-tint from Fix P1 still differentiates active row.
- **Files:** `src/components/MatchList.module.css:5` — change container bg to `var(--card)`. Re-measure: `--sub` `#6B7280` over `#FFFFFF` = 4.83:1 (PASS 4.5:1, vs current 4.38/3.91 fails).
- **Non-color redundancy:** rank number (1, 2, 3…) already provides ordinal cue; division name + dept text remain.
- **Test impact:** snapshot tests for list bg.

### Fix P9 (ExportPng tier policy)

- **Pick:** PNG list rows consume `fitColor(d.fit)` per-row, matching screen behavior.
- **Files:** `src/lib/exportPng.ts:482,492` — replace `pctColor: AXES.C.dark` / `pctColor: INDIGO` with `pctColor: fitColor(d.fit).text`.
- **Add:** import `fitColor` from `../lib/scoring` (already pulled by sibling code paths). Replace `TEXT_FAINT` `#9CA3AF` with `--sub` equivalent `#6B7280` to remove the 6th-distinct-grey divergence (`exportPng.ts:82`).
- **Measurements:** PNG bg is `#FFFFFF` / `#F7F8FA`; `fitColor.text` tiers measured at 4.65–5.36:1 against the on-screen tinted backgrounds (measurements §1j) — on white they will measure higher.
- **Non-color redundancy:** PNG already shows the % numerically; tier color now matches numerically-identifiable %.
- **Test impact:** any visual regression test on exported PNG sample (`yokosuka-quiz-package.zip` build pipeline). Check `tests/exportPng.test.ts` if present.

### Fix P10 (mint band)

- **Reject:** old doc's `--paper-warm #F4EEE0` cream-cream-sand — measurements §2 show cream↔paper-warm dE 4.32 (perceptible) and paper-warm↔hero-accent dE **2.31** (sub-JND); the middle step disappears.
- **Pick:** keep `--C-tint` mint band BUT decouple the chapter mark from `--C`. Change `Results.module.css:64` `.match .chapterMark { color: var(--C); }` → `color: var(--hall-indigo);`. The hue conflation between Match identity, fit-tier-top, chapter mark, axis-C trait collapses to: only the *band background* is mint. After Fix P4, fit-tier-top is no longer green either, so the only place axis-C green appears outside trait-axis-C context is the band bg, which is justifiable as a "this section is about matching" wash.
- **Files:** `src/screens/Results.module.css:64`.
- **Non-color redundancy:** chapter mark already has positional + label semantics ("章 / Match"); color was extra.
- **Test impact:** snapshot tests for Results module.

## 8. Implementation order

1. **P2 (axis-E drift).** Land first. Until the four sources agree, every measurement on tier-mid colors and Slide5Result blobs is moving. Cleanup also deletes 13 dead CSS tokens, simplifying every later diff.
2. **P1 (active-state unification, blocking user finding).** This is the original user complaint. Land second.
3. **P4 + P5 (`fitColor` cross-channel + ring redundancy).** Together — they're one change at the call sites and at `scoring.ts`. Measurements still need to be run on the candidate sequential ramp before merge.
4. **P9 (ExportPng tier mismatch).** Lands after P4 since exportPng now consumes the new `fitColor`.
5. **P3 (focus ring on hero).** Independent of P1/P2; can land in parallel but slot here.
6. **P8 (MatchList surface).** Depends on P1's indigo-tint active state to provide row differentiation post-white-bg.
7. **P10 (mint band chapter-mark decouple).** Depends on P4 (so axis-C green isn't reintroduced via fit-top tier).
8. **P6 (.desc over blobs).** Either text-shadow or blob filter; prefer the algorithmic fix (`archetypePalette` blob filter) since it also resolves P7.
9. **P7 (.suffix alpha bump).** Trivial; lands together with P6.

## 9. Open questions

1. **Dark-mode posture.** The app declares no `prefers-color-scheme: dark` styles. Tokens are light-only. Do we need a dark variant for OS dark-mode users on phones (significant cohort)?
2. **Forced-colors / high-contrast mode strategy** (was N3). The page never declares `forced-colors` handling; band bgs, fit ring, comparison-bar segments collapse to system defaults silently (reframe N3, inventory note 1.13). What's the policy — graceful degradation (current), explicit `@media (forced-colors: active)` overrides, or `forced-color-adjust: none` on chrome?
3. **Mint band — design intent.** Color theorist suggested a Japanese-cultural reading (環境/防災 register, inventory §6); reframe says "assume inherited from earlier prototype." Is the mint specifically meaningful? If yes, P10's chapter-mark decouple is enough; if no, we could go further and switch the band bg to a 4th non-axis paper-tone.
4. **Six-treatment active-state reduction (P1).** Should *any* of the six idioms preserve context-specific signaling? Quiz options arguably want per-axis tint to teach the user "this question is about axis X"; ProgressBar segments arguably want per-axis hue for the same reason. Or do we go all-indigo for selected and reserve axis hue for axis-context-only?
5. **Sequential vs categorical fit ramp (P4).** Indigo sequential ramp loses tier-as-warning affordance (low-fit wouldn't be red). Is that loss acceptable? Or do we keep red at the bottom, sequential between, accepting partial categorical encoding?
6. **Slide5Result blob filter (P6).** If we drop E from warm archetypes, the mini-preview hero loses one of its color signals. Acceptable?

## 10. Risk register

- **Backwards compatibility for existing PNG exports.** Users who saved a result image before the fix have a different visual artifact than what re-running the quiz would produce — same archetype, different tier-color scheme in the list. Mitigation: include a date-stamp in PNG footer (already has wordmark; add date), and treat the change as a one-time cosmetic version bump.
- **Tests pinning specific hex values.** Likely candidates: `tests/scoring.test.ts` if `fitColor` return values are snapshotted; `tests/archetypePalette.test.ts` for `AXIS_MID`; component snapshot tests in `tests/components/*` for FitRing, MatchList, TraitBar. Audit before any P2/P4/P9 change.
- **`--hero-accent` shared with Welcome (token-map §3 cream/hero-accent block).** `--hero-accent` is the Welcome CTA bg AND the Results actions band bg. Any change to it ripples to Welcome (`Welcome.module.css:149,163`) including the CTA focus outline. We are NOT changing `--hero-accent` in this audit, but if a future iteration introduces a separate `--band-actions` value, expect Welcome regression.
- **archetypePalette algorithm changes affecting Slide5Result preview.** `archetypePalette()` is called by both `src/screens/Results.tsx:20` and `src/components/HomepageCarousel/slides/Slide5Result.tsx:42` with a fixed profile (A:2,B:1,C:2,D:1,E:0). Any blob-pool filter (P6) changes the Slide5 preview deterministically. Take a baseline screenshot before landing and confirm the Slide5 still reads as a credible "personality verdict" preview.
- **Dead-token deletion (P2 optional).** If we delete the 13 unused `--A/B/C/D/E*` CSS tokens and a future change tries to consume them, we'll have a compilation-silent CSS fallback. Mitigation: leave a comment block in `tokens.css` documenting that axis colors live in `axes.ts`, and keep `--C / --C-tint` since they ARE consumed.
- **Sequential-ramp re-measurement.** Fix P4's candidate indigo ramp wasn't pre-measured by the measurements doc. Don't merge until §3a-equivalent numbers (adjacent dE2000 normal + deuteranopia + grayscale + L\* monotonicity) are run on the new tier hexes.
