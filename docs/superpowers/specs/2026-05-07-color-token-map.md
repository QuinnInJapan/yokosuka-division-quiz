# Color Token Map — Yokosuka Quiz

Date: 2026-05-07
Status: Map only. No fixes proposed.
Scope: Verify drift between `src/data/axes.ts` and `src/styles/tokens.css`, audit
`src/lib/exportPng.ts` for hardcoded duplicates, build a cross-file token usage
map, list non-data hex literals, document `fitColor` call sites, and compute
per-screen token consumption.

---

## 1. Drift Verification (axes.ts vs tokens.css)

### 1a. `src/data/axes.ts` — every hex per axis

| Axis | Field   | Hex       | Line |
|------|---------|-----------|------|
| A    | color   | `#E8534A` | `src/data/axes.ts:8`  |
| A    | dark    | `#C0392B` | `src/data/axes.ts:9`  |
| A    | tint    | `#FFF0EE` | `src/data/axes.ts:10` |
| B    | color   | `#4A90D9` | `src/data/axes.ts:22` |
| B    | dark    | `#2E6DB4` | `src/data/axes.ts:23` |
| B    | tint    | `#EBF3FC` | `src/data/axes.ts:24` |
| C    | color   | `#4CAF7D` | `src/data/axes.ts:36` |
| C    | dark    | `#1E7345` | `src/data/axes.ts:37` |
| C    | tint    | `#ECF8F1` | `src/data/axes.ts:38` |
| D    | color   | `#9B59B6` | `src/data/axes.ts:50` |
| D    | dark    | `#7B3F9E` | `src/data/axes.ts:51` |
| D    | tint    | `#F5EDF8` | `src/data/axes.ts:52` |
| E    | color   | `#EAB308` | `src/data/axes.ts:64` |
| E    | dark    | `#A16207` | `src/data/axes.ts:65` |
| E    | tint    | `#FEF9C3` | `src/data/axes.ts:66` |

### 1b. `src/styles/tokens.css` — every axis-related token

| Token     | Hex       | Line |
|-----------|-----------|------|
| `--A`     | `#C0392B` | `src/styles/tokens.css:3` |
| `--A-mid` | `#E8534A` | `src/styles/tokens.css:3` |
| `--A-tint`| `#FFF0EE` | `src/styles/tokens.css:3` |
| `--B`     | `#2E6DB4` | `src/styles/tokens.css:4` |
| `--B-mid` | `#4A90D9` | `src/styles/tokens.css:4` |
| `--B-tint`| `#EBF3FC` | `src/styles/tokens.css:4` |
| `--C`     | `#1E7345` | `src/styles/tokens.css:5` |
| `--C-mid` | `#4CAF7D` | `src/styles/tokens.css:5` |
| `--C-tint`| `#ECF8F1` | `src/styles/tokens.css:5` |
| `--D`     | `#7B3F9E` | `src/styles/tokens.css:6` |
| `--D-mid` | `#9B59B6` | `src/styles/tokens.css:6` |
| `--D-tint`| `#F5EDF8` | `src/styles/tokens.css:6` |
| `--E`     | `#9C6310` | `src/styles/tokens.css:7` |
| `--E-mid` | `#F5A623` | `src/styles/tokens.css:7` |
| `--E-tint`| `#FFF6E6` | `src/styles/tokens.css:7` |

Mapping convention used elsewhere in the codebase:
- `axes[X].dark`  ↔ `--X`        (axis-dark text)
- `axes[X].color` ↔ `--X-mid`    (saturated mid for fills/tracks)
- `axes[X].tint`  ↔ `--X-tint`   (very pale background)

### 1c. Diff — `axis | field | axes.ts value | tokens.css value`

Confirmed mismatches (E axis ONLY; A/B/C/D are aligned):

| Axis | Field        | axes.ts   | tokens.css | Token  |
|------|--------------|-----------|------------|--------|
| E    | dark         | `#A16207` | `#9C6310`  | `--E`      |
| E    | color (mid)  | `#EAB308` | `#F5A623`  | `--E-mid`  |
| E    | tint         | `#FEF9C3` | `#FFF6E6`  | `--E-tint` |

All three E values differ. The brand-consistency reviewer's flag is fully
confirmed. The `axes.ts` E values (`#EAB308`/`#A16207`/`#FEF9C3`) are the
Tailwind `yellow-500` / `yellow-700` / `yellow-100` family. The `tokens.css`
E values (`#F5A623`/`#9C6310`/`#FFF6E6`) are the legacy orange/amber family.

A/B/C/D: zero drift across all three fields.

---

## 2. ExportPng Dual-Source-of-Truth Audit

### 2a. Hardcoded hex literals in `src/lib/exportPng.ts`

| Line | Hex       | Bound to constant / inline use |
|------|-----------|--------------------------------|
| `src/lib/exportPng.ts:81`  | `#1C2340` | `const INDIGO`        |
| `src/lib/exportPng.ts:82`  | `#9CA3AF` | `const TEXT_FAINT`    |
| `src/lib/exportPng.ts:83`  | `#1C2340` | `const TEXT_BODY`     |
| `src/lib/exportPng.ts:87`  | `#F7F8FA` | `const TOP_ZONE_BG`   |
| `src/lib/exportPng.ts:171` | `#FFFFFF` | white dot fill (axis bar) |
| `src/lib/exportPng.ts:269` | `#6B7280` | `型` suffix grey      |
| `src/lib/exportPng.ts:274` | `#4A5568` | description body grey |
| `src/lib/exportPng.ts:439` | `#FFFFFF` | canvas page background |

### 2b. AXES / axis color references in `src/lib/exportPng.ts`

| Line | Reference | Role |
|------|-----------|------|
| `src/lib/exportPng.ts:3`   | `import { AXES } from '../data/axes';` | source-of-truth import |
| `src/lib/exportPng.ts:310` | `const a = AXES[ax];`                  | row binding in profile loop |
| `src/lib/exportPng.ts:324` | `drawBar(... a.color, a.dark, dotPct)` | axis-color track + axis-dark dot border |
| `src/lib/exportPng.ts:334` | `ctx.fillStyle = a.dark;`              | winning-pole label (plus side) |
| `src/lib/exportPng.ts:339` | `ctx.fillStyle = a.dark;`              | winning-pole label (minus side) |
| `src/lib/exportPng.ts:482` | `pctColor: AXES.C.dark`                | "best fits" column tier color (greens) |

### 2c. Cross-source comparison

The export-png hardcoded constants do NOT directly duplicate any axis hex.
Specifically: `INDIGO/TEXT_BODY = #1C2340` matches `--hall-indigo` in
`src/styles/tokens.css:10`, but `exportPng.ts` does not read CSS variables
(canvas context can't resolve `var(...)`), so this is a known parallel
constant — not drift.

Hex values that DO have token equivalents but are inlined in exportPng.ts:

| Hex       | exportPng line                    | Equivalent token           | Token line |
|-----------|-----------------------------------|----------------------------|------------|
| `#1C2340` | `81`, `83`                        | `--hall-indigo`            | `tokens.css:10` |
| `#6B7280` | `269`                             | `--sub`                    | `tokens.css:18` |
| `#4A5568` | `274`                             | `--text-sec`               | `tokens.css:17` |
| `#FFFFFF` | `171`, `439`                      | `--card`                   | `tokens.css:15` |

`#9CA3AF` (TEXT_FAINT) and `#F7F8FA` (TOP_ZONE_BG) have NO token equivalent
in `tokens.css`. These are export-canvas-only values.

Cross-source **drift** flags between exportPng axis-derived rendering and
tokens.css: NONE directly — exportPng pulls from `AXES` at runtime
(`src/lib/exportPng.ts:310`, `:324`, `:334`, `:339`, `:482`), so the export
PNG inherits the (correct) `axes.ts` E hexes. **However**, this means the
export PNG will render with E = yellow `#EAB308`, while every CSS-rendered
surface (Quiz, TraitBar, ProgressBar, etc., when they hit `--E-*`) renders
with E = orange `#F5A623`. The screen UI and the exported PNG disagree on
what color E is.

Note that of the screen UI renderings, most JSX paths actually consume axis
hexes via inline `style={{ }}` props that read from `AXES[ax]` (TraitBar
`src/components/TraitBar.tsx:31,34,40,45`, Quiz `src/screens/Quiz.tsx:30,35,51,56`,
Slide2Input `src/components/HomepageCarousel/slides/Slide2Input.tsx:47,52,71,79`,
TraitCarousel `src/components/TraitCarousel.tsx:21,32`, ComparisonBars
`src/components/ComparisonBars.tsx:199,207,211,215`, ProgressBar
`src/components/ProgressBar.tsx:17`, Slide3Scoring
`src/components/HomepageCarousel/slides/Slide3Scoring.tsx:46,53,75,79,85`).
These follow `axes.ts`. The `--A`-style CSS tokens are consumed only twice
(see Section 3 below), so screen drift is limited but real.

### 2d. `src/lib/scoring.ts` — `fitColor` (also a parallel source of truth)

| Line | Hexes used | Source-of-truth aligned with |
|------|------------|------------------------------|
| `src/lib/scoring.ts:68` (≥80) | text `#1E7345`, fill `#4CAF7D`, bg `#ECF8F1` | C-axis (`axes.ts:36-38`) ✓ |
| `src/lib/scoring.ts:69` (≥60) | text `#2E6DB4`, fill `#4A90D9`, bg `#EBF3FC` | B-axis (`axes.ts:22-24`) ✓ |
| `src/lib/scoring.ts:70` (≥45) | text `#9C6310`, fill `#F5A623`, bg `#FFF6E6` | E-axis OLD (`tokens.css:7`) — **drift vs `axes.ts:64-66`** |
| `src/lib/scoring.ts:71` (<45) | text `#C0392B`, fill `#E8534A`, bg `#FFF0EE` | A-axis (`axes.ts:8-10`) ✓ |

Same E-axis stale-orange values appear here: `fitColor` is a third source of
truth, and its medium-fit tier matches `tokens.css` (legacy orange) instead
of `axes.ts` (new yellow).

### 2e. `src/lib/archetypePalette.ts` — fourth parallel source

`AXIS_MID` constant at `src/lib/archetypePalette.ts:21-27` duplicates
`axes[X].color` for all five axes. Comment on line 20 says "same hex values
as the `--A-mid` / `--B-mid` / ... tokens." E-axis entry on line 26 is
`#F5A623` — matches `tokens.css` (orange), drifts from `axes.ts:64`
(`#EAB308`, yellow). Same E drift pattern.

---

## 3. Cross-File Token Usage Map

Format: token → `(file:line, role)` rows. CSS file-internal definitions are
omitted unless they alias another token.

### Axis tokens (`--A`, `--A-mid`, `--A-tint`, etc.)

`--A`, `--A-mid`, `--A-tint`: defined `src/styles/tokens.css:3`. Not
referenced anywhere else in the codebase (axis-A consumers read from
`AXES.A` in JS).

`--B`, `--B-mid`, `--B-tint`: defined `src/styles/tokens.css:4`. Not
referenced elsewhere except as `--focus-ring: #2E6DB4` shares the `--B`
hex coincidentally (`tokens.css:23`).

`--C`:
- `src/screens/Results.module.css:64` — Match band chapter-mark color (`color: var(--C);`)

`--C-mid`: defined `tokens.css:5`. No external consumers.

`--C-tint`:
- `src/styles/tokens.css:71` — aliased by `--band-match: var(--C-tint);` (Match band background)

`--D`, `--D-mid`, `--D-tint`: defined `tokens.css:6`. No external consumers.

`--E`, `--E-mid`, `--E-tint`: defined `tokens.css:7`. No external consumers.

Net: of the 15 axis tokens, only `--C` and `--C-tint` have any external
consumer. The other 13 are dead — every axis-color path in the screen
JSX/CSS reads from `AXES[ax]` in JS instead.

### Brand anchor

`--hall-indigo`:
- `src/styles/tokens.css:16` — aliased by `--text: var(--hall-indigo);`
- `src/styles/tokens.css:69` — value duplicated as `--band-hero-base: #1C2340`
- `src/screens/Welcome.module.css:13` — Welcome left-hero background
- `src/screens/Welcome.module.css:73` — explainer dot border
- `src/screens/Welcome.module.css:79` — active explainer dot fill
- `src/screens/Welcome.module.css:98` — explainer nav button text
- `src/screens/Welcome.module.css:150` — CTA text on hero-accent button
- `src/screens/Results.module.css:57` — Traits band chapter-mark color
- `src/components/ExportButton.module.css:4`  — Export button border
- `src/components/ExportButton.module.css:12` — Export button background
- `src/components/ExportModal.module.css:35`  — modal title text
- `src/components/ExportModal.module.css:69`  — modal button border
- `src/components/ExportModal.module.css:73`  — primary modal button bg
- `src/components/ExportModal.module.css:79`  — secondary modal button text
- `src/components/RetakeButton.module.css:4`  — Retake button border
- `src/components/RetakeButton.module.css:12` — Retake button text
- `src/components/RetakeButton.module.css:14` — Retake hover bg
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:18` — slide title
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:26` — slide stripe
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:31` — slide title
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:39` — slide stripe
- `src/components/HomepageCarousel/slides/Slide4Comparison.module.css:24` — slide title
- `src/components/HomepageCarousel/slides/Slide4Comparison.module.css:32` — slide stripe
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:24` — slide title
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:32` — slide stripe
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:84` — annotation numerals (01/02/03 gutter)

`--hall-indigo-hover`:
- `src/components/ExportButton.module.css:15` — hover bg
- `src/components/ExportModal.module.css:76`  — primary button hover bg + border

### Indigo wash family

`--indigo-tint`:
- `src/components/TraitBar.module.css:17` — active TraitBar hover bg

`--indigo-tint-soft`:
- `src/screens/Quiz.module.css:26` — `q-flourish` pill bg ("ラスト1問")
- `src/components/TraitBar.module.css:23` — active TraitBar bg
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:59` — flourish pill bg

### Cream / hero accent

`--cream`:
- `src/styles/tokens.css:70` — fallback inside `--band-traits: var(--cream, #FAF7F2)` (self-reference; `--cream` is then defined at line 73)

`--hero-accent`:
- `src/styles/tokens.css:72` — aliased by `--band-actions: var(--hero-accent);`
- `src/screens/Welcome.module.css:149` — CTA button background
- `src/screens/Welcome.module.css:163` — CTA focus outline

### Band backgrounds

`--band-hero-base`: defined `tokens.css:69`. No external consumers — Results
hero band (`Results.tsx:19`) inlines `style={{ background: palette.baseGradient }}`
from `archetypePalette` instead. This token is dead in current code.

`--band-traits`:
- `src/screens/Results.module.css:54` — Traits band background

`--band-match`:
- `src/screens/Results.module.css:61` — Match band background

`--band-actions`:
- `src/screens/Results.module.css:68` — Actions band background

### Neutrals

`--text` (= `var(--hall-indigo)` per `tokens.css:16`):
- `src/styles/reset.css:6` — body color
- `src/screens/Quiz.module.css:25` — q-flourish text
- `src/screens/Quiz.module.css:78` — option button text
- `src/screens/Quiz.module.css:103` — back-button hover text
- `src/components/TraitBar.module.css:37` — trait label
- `src/components/ComparisonBars.module.css:4` — section label
- `src/components/ComparisonBars.module.css:44` — user legend dot bg
- `src/components/ComparisonBars.module.css:45` — user legend dot border
- `src/components/ComparisonBars.module.css:49` — division legend dot border
- `src/components/MatchList.module.css:46` — division name
- `src/components/TraitCarousel.module.css:58` — nav hover text
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:58` — flourish text
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:102` — option button text
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:131` — row label

`--text-sec`:
- `src/screens/Welcome.module.css` — (none direct; uses `var(--sub)` and rgba whites)
- `src/components/ComparisonBars.module.css:10`, `:17`, `:80` — summary, rationale, badge text
- `src/components/MatchBrowse.module.css:9` — match-section subtitle
- `src/components/MatchDetail.module.css:49` — division about
- `src/components/ExportModal.module.css:40` — modal copy
- `src/components/TraitCarousel.module.css:29` — trait description
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:30` — sub
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:43` — sub
- `src/components/HomepageCarousel/slides/Slide4Comparison.module.css:36` — sub
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:36` — sub

`--sub`:
- `src/screens/Quiz.module.css:12`, `:16`, `:61`, `:98` — q-num, q-num secondary, opts-label, back button
- `src/screens/Welcome.module.css:60` — explainer eyebrow
- `src/components/ComparisonBars.module.css:29`, `:119` — legend, poles
- `src/components/MatchDetail.module.css:17`, `:37` — fit-lbl, div-dept
- `src/components/MatchList.module.css:37`, `:53` — all-rn, all-dept
- `src/components/TraitCarousel.module.css:5`, `:52` — eyebrow, nav text
- `src/components/TraitBar.module.css:57` — trait-poles
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:46`, `:50`, `:85` — qNum, qNum aria-hidden, optsLabel
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:88`, `:101`, `:125`, `:146`, `:200`, `:215` — pre-label, q-index, rowId, revFlag, dividerLabel, foot
- `src/components/HomepageCarousel/slides/Slide4Comparison.module.css:63` — listHead
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:101`, `:114`, `:127` — regionLabel, allMore, foot

`--card`:
- `src/screens/Quiz.module.css:69` — option button bg
- `src/styles/layout.css:43` — `.card` shell bg
- `src/components/ComparisonBars.module.css:48`, `:111` — division legend dot bg, marker--div bg
- `src/components/ExportModal.module.css:21` — modal panel bg
- `src/components/RetakeButton.module.css:11` — retake button bg
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:93` — option button bg
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:51` — focal card bg
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:44` — preview frame bg

`--bg`:
- `src/styles/reset.css:5` — body bg
- `src/screens/Welcome.module.css:5` — split layout bg

### Borders

`--border`:
- `src/screens/Quiz.module.css:70`, `:95` — option border, back button border
- `src/components/MatchDetail.module.css:34` — match-top hairline
- `src/components/ComparisonBars.module.css:87` — track bg
- `src/components/ExportModal.module.css:49` — canvas border
- `src/components/TraitCarousel.module.css:47`, `:70` — nav button border, dot bg
- `src/components/ProgressBar.module.css:5` — progress bar track
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:94` — option button border
- `src/components/HomepageCarousel/slides/Slide3Scoring.module.css:66`, `:147`, `:193` — tag hairline, revFlag border, divider line
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:42`, `:62`, `:119` — preview border, region border, allMore top border

`--border-light`:
- `src/components/TraitBar.module.css:7` — trait row hairline
- `src/components/ComparisonBars.module.css:79` — badge bg

### Focus

`--focus-ring`:
- `src/screens/Quiz.module.css:86`, `:105` — option focus outline, back button focus
- `src/screens/Welcome.module.css:86`, `:108` — dot focus, navBtn focus
- `src/components/MatchList.module.css:28` — list item focus
- `src/components/ExportButton.module.css:17` — focus outline
- `src/components/ExportModal.module.css:84` — modal button focus
- `src/components/RetakeButton.module.css:16` — focus outline
- `src/components/TraitBar.module.css:19` — trait focus
- `src/components/TraitCarousel.module.css:60` — nav focus
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:111` — option focus

### Hover wash

`--hover-wash`:
- `src/screens/Quiz.module.css:84` — option hover bg
- `src/screens/Welcome.module.css:83`, `:105` — dot hover, navBtn hover
- `src/components/ExportModal.module.css:81` — secondary button hover
- `src/components/HomepageCarousel/slides/Slide2Input.module.css:109` — option hover bg

`--hover-wash-list`:
- `src/components/HomepageCarousel/slides/Slide5Result.module.css:118` — allMore strip bg

---

## 4. Hardcoded Hex Literals (excluding axes.ts / archetypePalette.ts / scoring.ts)

These are the hex literals that bypass the token system. Sorted by file.

| File:line | Hex | Context (what it styles) |
|-----------|-----|--------------------------|
| `src/components/ComparisonBars.module.css` (none) | — | All hex via tokens; rgba(0,0,0,.15) shadow only |
| `src/components/ExportButton.module.css:13` | `#fff` | button text color (on indigo bg) |
| `src/components/ExportModal.module.css:51` | `#fff` | canvas bg fallback |
| `src/components/ExportModal.module.css:74` | `#fff` | btnPrimary text color |
| `src/components/FitRing.tsx:18`             | `#E4E7ED` | SVG ring track stroke (= `--border` hex) |
| `src/components/MatchDetail.module.css` (none) | — | — |
| `src/components/MatchList.module.css` (none, but rgba 30,115,69 — see note) | — | hover/selected state uses rgba alpha tints of `#1E7345` (C-dark): line 18, 26, 31, 32 |
| `src/components/RetakeButton.module.css` (none direct hex; `white` keyword) | — | — |
| `src/components/SukarinCard.module.css` (none direct hex; uses `white` and rgba whites) | — | — |
| `src/components/TraitBar.module.css:16` | `#E6EAF5` | non-active `.trait:hover` bg (no token) |
| `src/components/TraitCarousel.module.css:58` | `#aaa` | `.tc-nav:hover` border-color (no token) |
| `src/main.tsx:16` | `#1C2340` | console-banner inline style (matches `--hall-indigo`) |
| `src/main.tsx:17` | `#6B7280` | console-banner inline style (matches `--sub`) |
| `src/screens/Quiz.module.css:84` | `#b0b4be` | `.opt:hover` border (no token) |
| `src/screens/Quiz.module.css:103` | `#aaa` | `.btn-back:hover` border (no token) |
| `src/components/HomepageCarousel/slides/Slide2Input.module.css:109` | `#b0b4be` | `.opt:hover` border (no token) |
| `src/lib/exportPng.ts:81` | `#1C2340` | `INDIGO` (= `--hall-indigo`) |
| `src/lib/exportPng.ts:82` | `#9CA3AF` | `TEXT_FAINT` (no token) |
| `src/lib/exportPng.ts:83` | `#1C2340` | `TEXT_BODY` (= `--hall-indigo`) |
| `src/lib/exportPng.ts:87` | `#F7F8FA` | `TOP_ZONE_BG` (no token) |
| `src/lib/exportPng.ts:171` | `#FFFFFF` | bar dot fill (= `--card`) |
| `src/lib/exportPng.ts:269` | `#6B7280` | `型` suffix (= `--sub`) |
| `src/lib/exportPng.ts:274` | `#4A5568` | description body (= `--text-sec`) |
| `src/lib/exportPng.ts:439` | `#FFFFFF` | canvas bg (= `--card`) |

Tokens that arguably should exist but don't:
- A "hover-border" or "muted-border-hover" token for `#b0b4be` and `#aaa`
  (Quiz.module.css:84,103; Slide2Input.module.css:109; TraitCarousel.module.css:58).
- A "trait-hover-soft" token for `#E6EAF5` (TraitBar.module.css:16; this is a
  different shade than `--indigo-tint` `#DCE4F8` and `--indigo-tint-soft`
  `#F0F3FF`).
- A "list-stroke-c" or generic list-divider rgba family for the
  `rgba(30, 115, 69, X)` family in MatchList.module.css:18,26,31,32
  (these hardcode the C-dark hex into rgba()).
- A "text-faint" token for `#9CA3AF` in exportPng.ts:82.
- A "surface-elevated" token for `#F7F8FA` in exportPng.ts:87.

---

## 5. JS-Side Hardcoded Fit Colors

### 5a. `fitColor` definition (`src/lib/scoring.ts:67-72`)

```ts
export function fitColor(p: number): { text: string; fill: string; bg: string } {
  if (p >= 80) return { text: '#1E7345', fill: '#4CAF7D', bg: '#ECF8F1' }; // C-axis
  if (p >= 60) return { text: '#2E6DB4', fill: '#4A90D9', bg: '#EBF3FC' }; // B-axis
  if (p >= 45) return { text: '#9C6310', fill: '#F5A623', bg: '#FFF6E6' }; // E-axis (LEGACY ORANGE — drifts vs axes.ts)
  return       { text: '#C0392B', fill: '#E8534A', bg: '#FFF0EE' };       // A-axis
}
```

The four tier triplets duplicate axis hex constants. Tier 3 (≥45) duplicates
the **stale** orange E values from `tokens.css` rather than the **new** yellow
E values from `axes.ts`. This is the same drift as Section 1c.

### 5b. Call sites of `fitColor`

| File:line | Usage |
|-----------|-------|
| `src/components/ComparisonBars.tsx:172` | `const tierColor = fitColor(fit).text;` — drives `<strong>` tier emphasis color in narrative copy |
| `src/components/MatchDetail.tsx:8` | `const fc = fitColor(division.fit);` — passed to `<FitRing fillColor={fc.fill} textColor={fc.text} />` |
| `src/components/MatchList.tsx:11` | `const fc = fitColor(d.fit);` — `style={{ color: fc.text }}` on the fit% number per row |

### 5c. Fit-tier colors in the export PNG

The export PNG does NOT call `fitColor`. Instead it uses a single column-level
tier color hard-coded per column at `src/lib/exportPng.ts:482,492`:
- Best column: `pctColor: AXES.C.dark` (always green-dark)
- Worst column: `pctColor: INDIGO` (always indigo)

So the export PNG uses a different tier policy than the screen. The screen
shows per-row tier color (5 tiers), the PNG shows per-column policy
(2 tiers tied to best/worst lists).

### 5d. Fit-tier colors in HomepageCarousel slides

- `Slide4Comparison` mounts `<MatchDetail>` and `<MatchList>` directly
  (`src/components/HomepageCarousel/slides/Slide4Comparison.tsx:40,43`), so it
  reuses `fitColor` via those components.
- `Slide5Result` mounts `<MatchList>` directly
  (`src/components/HomepageCarousel/slides/Slide5Result.tsx:78`), same path.
- Slides 2 and 3 do not render fit tiers.

---

## 6. Per-Screen Token Consumption

### Welcome (`src/screens/Welcome.tsx`, `Welcome.module.css`)
Tokens used (CSS): `--bg`, `--hall-indigo`, `--hero-w`, `--col-pad`, `--sp-md`,
`--sub`, `--fw-bold`, `--fw-black`, `--fw-normal`, `--hover-wash`,
`--focus-ring`, `--hero-accent`, `--sp-xl`.

JS axis tokens read: none directly.

### Quiz (`src/screens/Quiz.tsx`, `Quiz.module.css` + `ProgressBar.tsx`)
Tokens used (CSS): `--sp-lg`, `--fs-sm`, `--sub`, `--fw-bold`, `--fs-xs`,
`--text`, `--indigo-tint-soft`, `--fw-medium`, `--card`, `--border`,
`--fs-base`, `--fs-xl`, `--hover-wash`, `--focus-ring`, `--content-max`,
`--border` (ProgressBar).

JS axis access: `AXES[q.axis]` at `src/screens/Quiz.tsx:11`; reads
`.tint`, `.dark`, `.color` (via ProgressBar), inlined onto JSX
`style={{...}}`.

### Results — Hero band
CSS tokens: `--app-max`, `--sp-lg`, `--fs-xs`, `--fw-black`. Background is
inline `style={{ background: palette.baseGradient }}` from
`archetypePalette` (does NOT use `--band-hero-base`).

### Results — Traits band
CSS tokens: `--band-traits` (= `--cream` `#FAF7F2`), `--hall-indigo`,
plus the TraitBar/TraitCarousel sub-systems which use `--border-light`,
`--indigo-tint`, `--indigo-tint-soft`, `--focus-ring`, `--text`,
`--bar-h`, `--sub`, `--text-sec`, `--border`.

JS axis access: `AXES[axis]` in `TraitBar.tsx`, `TraitCarousel.tsx`.

### Results — Match band
CSS tokens: `--band-match` (= `--C-tint`), `--C` (chapter mark), and
match sub-system: `--text-sec`, `--sub`, `--text`, `--border`, `--card`,
`--fs-*`, `--sp-*`, `--focus-ring`, `--lh-*`. MatchList hardcodes rgba
of `#1E7345` (C-dark).

JS: `fitColor()` for per-row text color.

### Results — Actions band
CSS tokens: `--band-actions` (= `--hero-accent`), plus
RetakeButton/ExportButton: `--hall-indigo`, `--hall-indigo-hover`,
`--card`, `--focus-ring`.

### HomepageCarousel slide 2 (`Slide2Input`)
CSS tokens: `--hall-indigo`, `--text-sec`, `--sub`, `--text`,
`--indigo-tint-soft`, `--card`, `--border`, `--hover-wash`, `--focus-ring`,
`--fs-*`, `--fw-*`, `--sp-*`.

JS axis access: `AXES.C` (hard-pinned to axis C in slide data,
`Slide2Input.tsx:14`).

### HomepageCarousel slide 3 (`Slide3Scoring`)
CSS tokens: `--hall-indigo`, `--text-sec`, `--sub`, `--card`, `--card-r`,
`--card-shadow`, `--border`, `--text`, `--bar-h`, `--mkr-size`. Mounts
real `<TraitBar>`.

JS axis access: `AXES.A` (hard-pinned, `Slide3Scoring.tsx:13`).

### HomepageCarousel slide 4 (`Slide4Comparison`)
CSS tokens: `--hall-indigo`, `--text-sec`, `--sub`. Mounts real
`<MatchDetail>` + `<MatchList>` so transitively consumes the entire match
sub-system (see Match band above, plus `fitColor`).

### HomepageCarousel slide 5 (`Slide5Result`)
CSS tokens: `--hall-indigo`, `--text-sec`, `--sub`, `--border`, `--card`,
`--card-r`, `--card-shadow`, `--hover-wash-list`. Mounts real
`<SukarinCard>` + `<TraitBar>` + `<MatchList>`. Background of regionHero is
inline `style={{ background: PALETTE.baseGradient }}` from
`archetypePalette` (same as Results hero).

### System-wide vs local

System-wide (≥3 distinct screens or used in shared components):
`--hall-indigo`, `--text`, `--text-sec`, `--sub`, `--card`, `--bg`,
`--border`, `--focus-ring`, `--hover-wash`, `--indigo-tint-soft`,
`--card-shadow`, `--card-r`.

Screen-local (exactly one screen):
- `--hero-accent`: Welcome only (CTA button) + Results Actions band (via
  `--band-actions` alias)
- `--hero-w`, `--col-pad`: Welcome only
- `--cream` / `--band-traits`: Results Traits band only
- `--band-match`: Results Match band only
- `--C`: Results Match band only (chapter mark)
- `--C-tint`: Results Match band only (via `--band-match` alias)
- `--indigo-tint`: TraitBar (Results) only
- `--hover-wash-list`: Slide5Result only
- `--hall-indigo-hover`: ExportButton/ExportModal only

Tokens defined but currently dead:
- `--A`, `--A-mid`, `--A-tint`, `--B`, `--B-mid`, `--B-tint`, `--C-mid`,
  `--D`, `--D-mid`, `--D-tint`, `--E`, `--E-mid`, `--E-tint` — defined in
  `tokens.css:3-7` but never referenced via `var(--X)` anywhere in `src/`
  (consumers read JS `AXES` instead).
- `--band-hero-base` — defined `tokens.css:69`, never referenced
  (Results hero uses `archetypePalette` inline gradient).

---

## Appendix: source-of-truth count by axis hex

Each axis triple appears across these parallel source-of-truth locations:

| Source                             | Lines                                | Notes |
|------------------------------------|--------------------------------------|-------|
| `src/data/axes.ts:8-10,22-24,36-38,50-52,64-66`     | per-axis     | canonical for JS |
| `src/styles/tokens.css:3-7`        | `--X / --X-mid / --X-tint`          | canonical for CSS; **E drifts** |
| `src/lib/scoring.ts:68-71`         | `fitColor` tiers (C,B,E,A only)     | **E drifts (uses tokens.css legacy)** |
| `src/lib/archetypePalette.ts:21-27`| `AXIS_MID` (mid only)               | **E drifts (uses tokens.css legacy)** |
| `src/lib/exportPng.ts:310,324,...` | reads `AXES` at runtime             | inherits axes.ts (so E = yellow on PNG) |

Net: 4 parallel sources contain explicit E hexes. 1 of them (axes.ts) was
updated to yellow (`#EAB308`/`#A16207`/`#FEF9C3`); the other 3
(`tokens.css`, `scoring.ts`, `archetypePalette.ts`) still hold the legacy
orange (`#F5A623`/`#9C6310`/`#FFF6E6`).
