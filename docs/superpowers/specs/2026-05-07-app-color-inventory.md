# App-Wide Color Inventory

**Date:** 2026-05-07
**Scope:** Every screen + every persistent surface (Welcome, Quiz, Results bands, Homepage carousel slides 1–4, ProgressBar, ExportModal, AppShell, exportPng).
**Author:** System-wide color audit (inventory step).
**Source token file:** `src/styles/tokens.css:1–74`
**Source axis file:** `src/data/axes.ts:1–74`

This document is **inventory only** — no fixes, no recommendations. It catalogs the state of color usage so a follow-up audit can reason about cross-surface consistency.

---

## 0. Token reference (for quick lookup)

Defined in `src/styles/tokens.css:1–74`:

| Token | Hex | Role |
|---|---|---|
| `--A` / `--A-mid` / `--A-tint` | `#C0392B` / `#E8534A` / `#FFF0EE` | Axis A — red |
| `--B` / `--B-mid` / `--B-tint` | `#2E6DB4` / `#4A90D9` / `#EBF3FC` | Axis B — blue |
| `--C` / `--C-mid` / `--C-tint` | `#1E7345` / `#4CAF7D` / `#ECF8F1` | Axis C — green |
| `--D` / `--D-mid` / `--D-tint` | `#7B3F9E` / `#9B59B6` / `#F5EDF8` | Axis D — purple |
| `--E` / `--E-mid` / `--E-tint` | `#9C6310` / `#F5A623` / `#FFF6E6` | Axis E — orange/amber |
| `--hall-indigo` | `#1C2340` | Brand anchor / primary text |
| `--hall-indigo-hover` | `#2A3558` | Indigo hover |
| `--bg` | `#F0F2F7` | Default page bg (cool grey) |
| `--card` | `#FFFFFF` | Card surface |
| `--text` | `#1C2340` (= indigo) | Body text |
| `--text-sec` | `#4A5568` | Secondary text |
| `--sub` | `#6B7280` | Muted/sub text |
| `--border` | `#E4E7ED` | Border |
| `--border-light` | `#F0F2F7` | Light border (= --bg) |
| `--focus-ring` | `#2E6DB4` (= --B) | Focus outline |
| `--hover-wash` | `#FAFBFC` | Hover bg |
| `--hover-wash-list` | `#F6F7FB` | Hover bg (list rows) |
| `--indigo-tint` | `#DCE4F8` | Selected list row |
| `--indigo-tint-soft` | `#F0F3FF` | Trait active highlight |
| `--hero-accent` | `#F5EBD8` | Welcome CTA bg + Results actions band |
| `--cream` / `--band-traits` | `#FAF7F2` | Traits band bg |
| `--band-match` | `var(--C-tint)` = `#ECF8F1` | Match band bg (mint) |
| `--band-actions` | `var(--hero-accent)` = `#F5EBD8` | Actions band bg |
| `--band-hero-base` | `#1C2340` | Fallback before per-archetype palette |

**Note 1 — token vs runtime divergence on axis E.** `tokens.css:7` declares E as orange `#9C6310/#F5A623/#FFF6E6`; `axes.ts:64–66` declares E as yellow `#A16207/#EAB308/#FEF9C3`. The TS object (`AXES`) is what TraitBar/ProgressBar/Quiz tag pills/exportPng consume, so the **rendered E hue is yellow**, while the CSS `--E*` tokens (orange) are referenced nowhere in `src/`. This is a silent token-vs-source-of-truth split.

**Note 2 — `--border-light` collides with `--bg`** (both `#F0F2F7`). Surfaces sitting on `--bg` cannot draw a `--border-light` divider visibly.

---

## 1. Per-surface palette

### 1.1 Welcome (`src/screens/Welcome.tsx`, `src/screens/Welcome.module.css`)

Layout: split — left **hero** (indigo) + right **panel** (mounts HomepageCarousel).

| Role | Value | Cite |
|---|---|---|
| Page bg (split shell) | `var(--bg)` (#F0F2F7) | `Welcome.module.css:5` |
| Hero col bg | `var(--hall-indigo)` (#1C2340) | `Welcome.module.css:13` |
| Right col bg | (inherits `--bg`; no own bg) | `Welcome.module.css:26–35` |
| Hero eyebrow text | `rgba(255,255,255,0.7)` (hardcoded alpha) | `Welcome.module.css:119` |
| Hero title | `white` (hardcoded) | `Welcome.module.css:129` |
| Hero lede | `white` (hardcoded) | `Welcome.module.css:136` |
| Primary CTA bg | `var(--hero-accent)` (#F5EBD8) | `Welcome.module.css:149` |
| Primary CTA text | `var(--hall-indigo)` | `Welcome.module.css:150` |
| CTA focus ring | `var(--hero-accent)` (matches bg, not `--focus-ring`) | `Welcome.module.css:163` |
| Right-panel eyebrow | `var(--sub)` | `Welcome.module.css:60` |
| Slide-indicator dot border | `var(--hall-indigo)` | `Welcome.module.css:73` |
| Slide-indicator dot active fill | `var(--hall-indigo)` | `Welcome.module.css:79` |
| Slide-indicator dot hover | `var(--hover-wash)` (#FAFBFC) | `Welcome.module.css:83` |
| Nav arrow text | `var(--hall-indigo)` | `Welcome.module.css:98` |
| Nav arrow hover bg | `var(--hover-wash)` | `Welcome.module.css:105` |
| Focus outline (dots, nav) | `var(--focus-ring)` (#2E6DB4) | `Welcome.module.css:86, 109` |

Decorative: none (no gradient, no blob, no illustration on Welcome itself — Sukarin lives in the carousel right panel).

Hardcoded hexes: none in CSS (only `rgba(255,255,255,…)` alpha overlays).

---

### 1.2 Quiz (`src/screens/Quiz.tsx`, `src/screens/Quiz.module.css`)

| Role | Value | Cite |
|---|---|---|
| Page bg | inherits `--bg` from `body` (`reset.css:7`) | — |
| Question num text | `var(--sub)` | `Quiz.module.css:12` |
| Flourish pill bg | `var(--indigo-tint-soft)` (#F0F3FF) | `Quiz.module.css:26` |
| Flourish pill text | `var(--text)` (= indigo) | `Quiz.module.css:25` |
| Axis tag pill bg | `ax.tint` (per-axis tint; inline) | `Quiz.tsx:30` |
| Axis tag pill text | `ax.dark` (per-axis dark; inline) | `Quiz.tsx:30` |
| Scenario heading | `ax.dark` (per-axis dark; inline) | `Quiz.tsx:35` |
| Options-label | `var(--sub)` | `Quiz.module.css:61` |
| Option button bg | `var(--card)` (white) | `Quiz.module.css:69` |
| Option button border | `var(--border)` (#E4E7ED) | `Quiz.module.css:70` |
| Option button text | `var(--text)` | `Quiz.module.css:78` |
| Option hover border | `#b0b4be` (hardcoded) | `Quiz.module.css:84` |
| Option hover bg | `var(--hover-wash)` | `Quiz.module.css:84` |
| Option **selected** border | `ax.dark` (per-axis dark; inline) | `Quiz.tsx:51` |
| Option **selected** bg | `ax.tint` (per-axis tint; inline) | `Quiz.tsx:51` |
| Option num | `ax.dark` (inline) | `Quiz.tsx:56` |
| Focus ring | `var(--focus-ring)` | `Quiz.module.css:86` |
| Back button bg | `white` (hardcoded keyword) | `Quiz.module.css:96` |
| Back button border | `var(--border)` | `Quiz.module.css:95` |
| Back button hover border | `#aaa` (hardcoded) | `Quiz.module.css:103` |

ProgressBar (used at top of Quiz):
| Role | Value | Cite |
|---|---|---|
| Track bg (incomplete) | `var(--border)` | `ProgressBar.module.css:6` |
| Done segment | `var(--c)` = `AXES[axis].color` (per-Q axis color, inline custom-prop) | `ProgressBar.module.css:8`, `ProgressBar.tsx:18, 26` |
| Current segment | `var(--c)` at `opacity .4` | `ProgressBar.module.css:9` |

Decorative: none.

---

### 1.3 Results — Hero band (`src/screens/Results.tsx:17–51`, `src/screens/Results.module.css:38–50`)

| Role | Value | Cite |
|---|---|---|
| Bg | `palette.baseGradient` (per-archetype, inline) — 3 hardcoded gradients in `archetypePalette.ts:81–85` | `Results.tsx:20`, `archetypePalette.ts:81–85` |
| `warmth >= 2` gradient | `linear-gradient(135deg, #2C1F32, #4A2B3D, #6E3F47)` (warm dark plum) | `archetypePalette.ts:82` |
| `warmth === 1` gradient | `linear-gradient(135deg, #1A1612, #2D241E, #3D3027)` (warm dark brown) | `archetypePalette.ts:84` |
| `warmth === 0` gradient | `linear-gradient(135deg, #0F1428, #1C2340, #2A2454)` (cool dark indigo) | `archetypePalette.ts:85` |
| Fallback gradient (invalid code) | `linear-gradient(135deg, #0F1428, #1C2340, #2A2454)` | `archetypePalette.ts:43` |
| Text color (band-wide) | `white` | `Results.module.css:39` |
| Chapter mark | `currentColor` (= white at 55% opacity); rule line `currentColor` at .35 alpha | `Results.module.css:23, 34` |
| Blob 1 color | `AXIS_MID[a]` (axis 0 of code, inline; one of 5 hardcoded mids) | `archetypePalette.ts:21–27, 93` |
| Blob 2 color | `AXIS_MID[c]` (axis 2 of code) | `archetypePalette.ts:100` |
| Blob 3 color | `AXIS_MID[b]` (axis 1) | `archetypePalette.ts:107` |
| Blob opacities | `0.42–0.48` / `0.38–0.44` / `0.24–0.28` (jittered) | `archetypePalette.ts:94, 101, 108` |

SukarinCard inside hero (`SukarinCard.module.css`):
- Body text: `white` (lines 27, 40)
- `.suffix` (型): `rgba(255,255,255,0.7)` hardcoded (line 49)
- `.desc`: `rgba(255,255,255,0.82)` hardcoded (line 58)
- Image drop-shadow: `rgba(0,0,0,0.35)` (line 20)

Hardcoded hexes in this band: 9 hex values (3 gradients × 3 stops) + 5 axis-mid hexes duplicated from token semantics.

---

### 1.4 Results — Traits band (`Results.module.css:53–58`, `TraitsPanel.*`, `TraitBar.*`, `TraitCarousel.*`)

| Role | Value | Cite |
|---|---|---|
| Band bg | `var(--band-traits)` = `var(--cream)` (#FAF7F2) | `Results.module.css:54`, `tokens.css:70, 73` |
| Chapter mark | `var(--hall-indigo)` | `Results.module.css:57` |
| TraitsPanel left/right pane bg | `rgba(255, 255, 255, 0.7)` hardcoded | `TraitsPanel.module.css:19, 26` |
| TraitBar bg (idle) | `transparent` | `TraitBar.module.css:5` |
| TraitBar border-bottom | `var(--border-light)` | `TraitBar.module.css:7` |
| TraitBar hover bg | `#E6EAF5` (hardcoded indigo-blue tint) | `TraitBar.module.css:16` |
| TraitBar **active** bg | `var(--indigo-tint-soft)` (#F0F3FF) | `TraitBar.module.css:23` |
| TraitBar active hover bg | `var(--indigo-tint)` (#DCE4F8) | `TraitBar.module.css:17` |
| TraitBar focus ring | `var(--focus-ring)` | `TraitBar.module.css:19` |
| TraitBar label | `var(--text)` | `TraitBar.module.css:37` |
| TraitBar pole win | `a.dark` (inline) | `TraitBar.tsx:41, 47` |
| TraitBar pole loss | `var(--sub)` | `TraitBar.module.css:57` |
| TraitBar track | `a.color` (inline; full-saturated axis color) | `TraitBar.tsx:31` |
| TraitBar dot | `white` bg + `a.dark` border (inline) | `TraitBar.tsx:33`, `TraitBar.module.css:64–69` |
| TraitCarousel hero text | `a.dark` (inline) | `TraitCarousel.tsx:21` |
| TraitCarousel desc | `var(--text-sec)` | `TraitCarousel.module.css:29` |
| TraitCarousel nav button bg | `white` | `TraitCarousel.module.css:49` |
| TraitCarousel nav button border | `var(--border)`; hover `#aaa` | `TraitCarousel.module.css:47, 58` |
| TraitCarousel dot (idle) | `var(--border)` | `TraitCarousel.module.css:70` |
| TraitCarousel dot (active) | `a.color` (inline; per current axis) — color-only signal + 1.3× scale | `TraitCarousel.tsx:33`, `TraitCarousel.module.css:73–75` |

Decorative: cream paper-tone bg, white-frosted inset panes; no gradient, no blob.

Hardcoded hexes: `rgba(255,255,255,0.7)` × 2, `#E6EAF5`, `#aaa`.

---

### 1.5 Results — Match band (`Results.module.css:60–64`, `MatchBrowse.*`, `MatchList.*`, `MatchDetail.*`, `ComparisonBars.*`, `FitRing.tsx`)

| Role | Value | Cite |
|---|---|---|
| Band bg | `var(--band-match)` = `var(--C-tint)` (#ECF8F1, mint) | `Results.module.css:61`, `tokens.css:71` |
| Chapter mark | `var(--C)` (#1E7345, dark green) | `Results.module.css:64` |
| Section sub copy | `var(--text-sec)` | `MatchBrowse.module.css:9` |
| MatchList container bg | `rgba(255, 255, 255, 0.6)` hardcoded | `MatchList.module.css:5` |
| MatchList row border-bottom | `rgba(30, 115, 69, 0.12)` hardcoded (= --C @12%) | `MatchList.module.css:18` |
| MatchList row hover bg | `rgba(30, 115, 69, 0.08)` (= --C @8%) | `MatchList.module.css:26` |
| MatchList row **active** bg | `rgba(30, 115, 69, 0.20)` (= --C @20%) | `MatchList.module.css:31` |
| MatchList row focus | `var(--focus-ring)` | `MatchList.module.css:28` |
| MatchList rank num | `var(--sub)` | `MatchList.module.css:37` |
| MatchList division name | `var(--text)` | `MatchList.module.css:45` |
| MatchList dept | `var(--sub)` | `MatchList.module.css:52` |
| MatchList fit % text | `fitColor(d.fit).text` (inline; one of 4 hardcoded hexes) | `MatchList.tsx:26`, `scoring.ts:67–72` |
| MatchDetail card bg | `white` | `MatchDetail.module.css:24` |
| MatchDetail name text | `var(--text)` (default; not declared) | `MatchDetail.module.css:38–45` |
| MatchDetail dept/about | `var(--sub)`, `var(--text-sec)` | `MatchDetail.module.css:37, 49` |
| FitRing track | `#E4E7ED` hardcoded (= --border) | `FitRing.tsx:18` |
| FitRing arc fill | `fitColor(pct).fill` (4 hardcoded) | `FitRing.tsx:23`, `scoring.ts:67–72` |
| FitRing pct text | `fitColor(pct).text` | `FitRing.tsx:32` |
| FitRing label | `var(--sub)` | `MatchDetail.module.css:18` |
| ComparisonBars badge bg | `var(--border-light)` | `ComparisonBars.module.css:79` |
| ComparisonBars badge text | `var(--text-sec)` | `ComparisonBars.module.css:80` |
| ComparisonBars track | `var(--border)` | `ComparisonBars.module.css:87` |
| ComparisonBars segment fill | `a.color` @ `0.55` opacity (inline) | `ComparisonBars.tsx:207` |
| ComparisonBars user marker | `a.dark` bg + border (inline) | `ComparisonBars.tsx:211` |
| ComparisonBars division marker | `var(--card)` bg + `a.dark` border (inline) | `ComparisonBars.tsx:215`, css line 111 |
| ComparisonBars legend `--user` dot | `var(--text)` filled | `ComparisonBars.module.css:44` |
| ComparisonBars legend `--div` dot | `var(--card)` filled, indigo border | `ComparisonBars.module.css:48–50` |
| ComparisonBars axis label | `a.dark` (inline) | `ComparisonBars.tsx:199` |
| ComparisonBars tier emphasis text | `fitColor(fit).text` (inline) | `ComparisonBars.tsx:172, 180` |

`fitColor` thresholds (`scoring.ts:67–72`):
- `≥80` → `text:#1E7345 / fill:#4CAF7D / bg:#ECF8F1` (= `--C/--C-mid/--C-tint`, green)
- `≥60` → `text:#2E6DB4 / fill:#4A90D9 / bg:#EBF3FC` (= `--B/--B-mid/--B-tint`, blue)
- `≥45` → `text:#9C6310 / fill:#F5A623 / bg:#FFF6E6` (= `--E/--E-mid/--E-tint` from CSS tokens — but axes.ts E renders **yellow**, not orange)
- `<45` → `text:#C0392B / fill:#E8534A / bg:#FFF0EE` (= `--A/--A-mid/--A-tint`, red)

Decorative: none in band itself; ComparisonBars bars use axis hue at 55% alpha as data viz.

Hardcoded hexes in band: 4× rgba green @ list (lines 5, 18, 26, 31), `#E4E7ED` in FitRing track, 12 axis hexes in `fitColor`.

---

### 1.6 Results — Actions band (`Results.module.css:67–76`, `ExportButton.module.css`, `RetakeButton.module.css`)

| Role | Value | Cite |
|---|---|---|
| Band bg | `var(--band-actions)` = `var(--hero-accent)` (#F5EBD8) | `Results.module.css:68`, `tokens.css:72, 61` |
| Export (primary) bg | `var(--hall-indigo)` | `ExportButton.module.css:12` |
| Export text | `#fff` | `ExportButton.module.css:13` |
| Export hover bg | `var(--hall-indigo-hover)` | `ExportButton.module.css:15` |
| Export focus ring | `var(--focus-ring)` | `ExportButton.module.css:17` |
| Retake (secondary) bg | `var(--card)` (white) | `RetakeButton.module.css:11` |
| Retake text | `var(--hall-indigo)` | `RetakeButton.module.css:12` |
| Retake border | `var(--hall-indigo)` 2px | `RetakeButton.module.css:3` |
| Retake hover bg | `var(--hall-indigo)` | `RetakeButton.module.css:14` |
| Retake hover text | `white` | `RetakeButton.module.css:14` |

Decorative: warm sand bg only.

Hardcoded hexes: none.

---

### 1.7 HomepageCarousel viewport (`HomepageCarousel.module.css`)

No color declarations — purely layout. Background bleeds from Welcome's right column (= `--bg`).

---

### 1.8 Slide 1 — Input (`Slide2Input.tsx`, `Slide2Input.module.css`)

| Role | Value | Cite |
|---|---|---|
| Slide bg | inherits (`--bg`) | — |
| Title text | `var(--hall-indigo)` | `Slide2Input.module.css:18` |
| Stripe rule | `var(--hall-indigo)` 4px×56px | `Slide2Input.module.css:23–27` |
| Sub copy | `var(--text-sec)` | `Slide2Input.module.css:30` |
| Q num | `var(--sub)` | `Slide2Input.module.css:46` |
| Flourish pill | `var(--indigo-tint-soft)` bg + `var(--text)` | `Slide2Input.module.css:55–63` |
| Axis tag pill bg | `ax.tint` (inline) | `Slide2Input.tsx:47` |
| Axis tag pill text | `ax.dark` (inline) | `Slide2Input.tsx:47` |
| Scenario | `ax.dark` (inline) | `Slide2Input.tsx:52` |
| Option button bg | `var(--card)` | `Slide2Input.module.css:93` |
| Option button border | `var(--border)` | `Slide2Input.module.css:94` |
| Option text | `var(--text)` | `Slide2Input.module.css:102` |
| Option hover border | `#b0b4be` hardcoded | `Slide2Input.module.css:109` |
| Option hover bg | `var(--hover-wash)` | `Slide2Input.module.css:109` |
| Option selected border | `ax.dark` (inline) | `Slide2Input.tsx:71` |
| Option selected bg | `ax.tint` (inline) | `Slide2Input.tsx:71` |
| Focus ring | `var(--focus-ring)` | `Slide2Input.module.css:111` |

Functional clone of the live Quiz screen (intentional — comments at top of file say so).

Decorative: none.

---

### 1.9 Slide 2 — Scoring (`Slide3Scoring.tsx`, `Slide3Scoring.module.css`)

| Role | Value | Cite |
|---|---|---|
| Slide bg | inherits (`--bg`) | — |
| Title / stripe / sub | `var(--hall-indigo)` / indigo / `var(--text-sec)` | `Slide3Scoring.module.css:31, 38, 43` |
| Card bg | `var(--card)` (white) + `var(--card-shadow)` | `Slide3Scoring.module.css:51–53` |
| Tag border-bottom | `var(--border)` | `Slide3Scoring.module.css:66` |
| Chip bg | `A.tint` (inline; locked to axis A red) | `Slide3Scoring.tsx:46` |
| Chip text | `A.dark` (inline) | `Slide3Scoring.tsx:46` |
| Tag pre-label | `var(--sub)` | `Slide3Scoring.module.css:88` |
| Tag label | `A.dark` (inline) | `Slide3Scoring.tsx:53` |
| Q-index | `var(--sub)` | `Slide3Scoring.module.css:101` |
| Row id / rev flag / divider | `var(--sub)` / `var(--sub)` + `var(--border)` border / `var(--border)` | lines 125, 146–148, 192 |
| Mini-bar track | `A.color` (inline; full-sat red) | `Slide3Scoring.tsx:75` |
| Mini-bar dot | `white` + `A.dark` border (inline) | `Slide3Scoring.module.css:166–172` + tsx:80 |
| Row delta | `A.dark` (inline) | `Slide3Scoring.tsx:84` |
| Embedded `<TraitBar axis="A">` | renders TraitBar idiom (axis A track + indigo-tint-soft on active; here `active=false`) | `Slide3Scoring.tsx:104` |

Decorative: a single hand-illustrated card; uses ONLY axis A (red) colors throughout — the slide demonstrates "scoring one axis", and that one axis is locked to A.

Hardcoded hexes: none in CSS.

---

### 1.10 Slide 3 — Comparison (`Slide4Comparison.tsx`, `Slide4Comparison.module.css`)

| Role | Value | Cite |
|---|---|---|
| Slide bg | inherits (`--bg`) | — |
| Title / stripe / sub | indigo / indigo / `var(--text-sec)` | `Slide4Comparison.module.css:25, 31, 36` |
| List head label | `var(--sub)` | `Slide4Comparison.module.css:64` |
| Inner UI | live `<MatchDetail>` + `<MatchList>` mounted under `pointer-events: none` (inherits all Match-band colors EXCEPT the band bg — slide bg is `--bg`, NOT mint) | `Slide4Comparison.tsx:39–46` |

Notable: the carousel mounts the Match components on the **default `--bg` cool grey**, not the mint `--C-tint` they're designed for on Results. Token-driven colors (white card bg, mint-derived row borders/hovers) still render — so list rows show their green hover/active wash floating on grey rather than mint.

Hardcoded hexes: none.

---

### 1.11 Slide 4 — Result (`Slide5Result.tsx`, `Slide5Result.module.css`)

| Role | Value | Cite |
|---|---|---|
| Slide bg | inherits (`--bg`) | — |
| Title / stripe / sub | indigo / indigo / `var(--text-sec)` | `Slide5Result.module.css:23, 30, 35` |
| **Mini-preview shell** (frames the entire fake Results page) bg | `var(--card)` (white) + `var(--border)` 1px + `var(--card-shadow)` | `Slide5Result.module.css:42–45` |
| Region 01 (mini-hero) bg | `PALETTE.baseGradient` (per-archetype gradient — same algorithm as live Results) | `Slide5Result.tsx:42`, `archetypePalette.ts:80–85` |
| Region 01 annot/label text | `rgba(255, 255, 255, 0.85)` hardcoded | `Slide5Result.module.css:73, 76` |
| Region 02/03 bg | `var(--card)` inherited from `.preview` | — |
| Region annot (gutter num) | `var(--hall-indigo)` | `Slide5Result.module.css:84` |
| Region label (uppercase) | `var(--sub)` | `Slide5Result.module.css:101` |
| Region border-bottom | `var(--border)` | `Slide5Result.module.css:62` |
| AllMore footer bg | `var(--hover-wash-list)` | `Slide5Result.module.css:118` |
| AllMore text / border | `var(--sub)` / `var(--border)` | lines 114, 119 |
| Foot caption | `var(--sub)` | `Slide5Result.module.css:127` |
| Embedded SukarinCard, TraitBar×5, MatchList | inherit each component's own palette | `Slide5Result.tsx:47–78` |

**Mini-hero region critical detail:** This slide DOES render a per-archetype hero — same `archetypePalette()` call as live Results — but it's clipped into the white `.preview` card, NOT a full-bleed band. The preview is a fixed profile (`A:2,B:1,C:2,D:1,E:0`), which through `determineType` produces a stable `code` and therefore a stable gradient/blob set every render.

Hardcoded hexes: 2× `rgba(255,255,255,0.85)`.

---

### 1.12 ProgressBar (`ProgressBar.tsx`, `ProgressBar.module.css`) — already inventoried under §1.2

Persistent on every Quiz step. Per-segment color is per-question's axis color (5 hues across the 20-segment bar). Done = full saturation. Current = same hue at `opacity .4`. Incomplete = `--border`.

**Color signal redundancy:** none — done/current differ only by alpha. No shape/icon difference. No text label.

---

### 1.13 ExportModal (`ExportModal.tsx`, `ExportModal.module.css`)

| Role | Value | Cite |
|---|---|---|
| Overlay bg | `rgba(28, 35, 64, 0.55)` hardcoded (= --hall-indigo @55%) | `ExportModal.module.css:4` |
| Panel bg | `var(--card)` | `ExportModal.module.css:21` |
| Panel shadow | `0 20px 80px rgba(0,0,0,0.25)` hardcoded | `ExportModal.module.css:23` |
| Title | `var(--hall-indigo)` | `ExportModal.module.css:36` |
| Copy | `var(--text-sec)` | `ExportModal.module.css:41` |
| Canvas border | `var(--border)` | `ExportModal.module.css:49` |
| Canvas bg | `#fff` hardcoded | `ExportModal.module.css:51` |
| btnPrimary bg/text | `var(--hall-indigo)` / `#fff` | `ExportModal.module.css:73–74` |
| btnPrimary hover | `var(--hall-indigo-hover)` | line 76 |
| btnSecondary bg | `transparent` | line 78 |
| btnSecondary text | `var(--hall-indigo)` | line 79 |
| btnSecondary hover bg | `var(--hover-wash)` | line 81 |
| Focus ring | `var(--focus-ring)` | line 84 |

Decorative: none.

Hardcoded: indigo-rgba overlay, 0.25 black shadow, `#fff`.

---

### 1.14 AppShell (`AppShell.tsx`)

No color. Pure data-attribute / focus management. Sets `body[data-screen]` which triggers shell-level layout overrides in `layout.css:14–34` (no color overrides there either).

---

### 1.15 Exported PNG (`src/lib/exportPng.ts`)

Constants defined at module top:

| Const | Value | Cite |
|---|---|---|
| `INDIGO` | `#1C2340` | `exportPng.ts:81` |
| `TEXT_FAINT` | `#9CA3AF` | `exportPng.ts:82` |
| `TEXT_BODY` | `#1C2340` | `exportPng.ts:83` |
| `TOP_ZONE_BG` | `#F7F8FA` | `exportPng.ts:87` |
| Canvas page bg | `#FFFFFF` | `exportPng.ts:439` |
| Sukarin shadow | `rgba(28,35,64,0.18)` | `exportPng.ts:228` |
| Eyebrow indigo @ alpha | `globalAlpha 0.55` over `INDIGO` | line 242 |
| 型 suffix text | `#6B7280` | line 269 |
| Description text | `#4A5568` | line 274 |
| Profile-section header | `rgba(28,35,64,0.7)` | line 300 |
| Hairline | `INDIGO` at α 0.18 / 0.6 | lines 303, 381 |
| Profile bar track | `a.color` (per-axis full-sat from `AXES`; see Note 1 — E renders yellow) | line 324 |
| Profile bar dot | `#FFFFFF` + `a.dark` border | lines 171, 176, 324 |
| "Best" pct color | `AXES.C.dark` (= `#1E7345`, green) — fixed, NOT tier-based | line 482 |
| "Worst" pct color | `INDIGO` — fixed, NOT tier-based | line 492 |

**Critical observations on PNG vs on-screen drift:**

1. Page bg in PNG is `#FFFFFF` + `#F7F8FA` top zone — a **3rd off-white** that doesn't match either Results' `--cream` (#FAF7F2) or `--hero-accent` (#F5EBD8). Cool light grey, not paper.
2. Top zone (containing archetype + profile) has NO dark hero treatment, NO per-archetype gradient, NO blobs. The Sukarin and name sit on `#F7F8FA` cool grey with `INDIGO` text — categorically different from the live hero.
3. Profile bars use `a.color` (axes.ts) — so a yellow E-axis bar in PNG, where on-screen tokens.css declared `--E-mid: #F5A623` (orange).
4. Best/worst lists use **fixed column colors**: best column always green (`AXES.C.dark`), worst column always indigo. The on-screen MatchList uses **per-row** `fitColor()` for the % text. So:
   - Top-fit (≥80%) division row in MatchList on-screen: text `#1E7345` green (`fitColor` → `--C` family).
   - Same row in PNG "best" column: text `#1E7345` green (`AXES.C.dark`).
   - **Numerically identical** at this tier — but coincidence (PNG green is column-based, screen green is tier-based).
5. A 60–79%-fit row in MatchList on-screen: blue `#2E6DB4`. Same row in PNG "best" column: still green `#1E7345`. **Drift.**
6. A <45%-fit row in PNG "best" column would still render green (column-based). On-screen: red. Drift, but rare since "best 5" usually exceed that.
7. PNG list rows use `TEXT_BODY` (= INDIGO) for division name; on-screen MatchList uses `var(--text)` (= INDIGO). Match.
8. PNG dept/rank uses `TEXT_FAINT` `#9CA3AF`; on-screen uses `var(--sub)` `#6B7280`. **Different grey.**
9. No green/mint surface anywhere in PNG. The "Match" identity (mint band, green chapter mark) is entirely dropped.
10. No "Actions" band in PNG; only a footer wordmark.

PNG is its own document — typographically cousin (same indigo type, same axis bars), but the band-rhythm and hero-gradient language are absent.

---

## 2. Cross-surface idiom mapping

`—` = role doesn't apply on that surface. `[CSS]` = via token. `[hex]` = hardcoded hex. `[axis]` = per-axis dynamic.

| UX role | Welcome | Quiz | Results-hero | Results-traits | Results-match | Results-actions | Slide 1 (Input) | Slide 2 (Scoring) | Slide 3 (Compare) | Slide 4 (Result) | Export PNG |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Page bg** | `--bg` #F0F2F7 (right col); `--hall-indigo` (left hero col) | `--bg` | per-archetype dark gradient (3 variants) | `--cream` #FAF7F2 | `--C-tint` #ECF8F1 (mint) | `--hero-accent` #F5EBD8 | `--bg` | `--bg` | `--bg` | `--bg` (mini-preview shell is white) | `#FFFFFF` |
| **Primary CTA** | `--hero-accent` bg + `--hall-indigo` text (pill, 999px) | — | — | — | — | `--hall-indigo` bg + `#fff` text (12px radius, 14px pad) | — | — | — | — | — |
| **Secondary CTA** | — | back btn: white bg + `--border` + `--sub` text | — | — | — | retake: white bg + `--hall-indigo` border/text (12px radius) | — | — | — | — | "閉じる" in modal: transparent + `--hall-indigo` text/border (10px radius) |
| **Selected list row** | — | — | — | — | `rgba(30,115,69,0.20)` (= --C @20%) | — | — | — | (inherits Match) | (inherits Match) | — |
| **Active tab/axis** | dot: `--hall-indigo` filled + 1.15× scale | progress segment: `axis.color` saturated | — | TraitBar: `--indigo-tint-soft` bg; TraitCarousel dot: `axis.color` + 1.3× scale | (no tab idiom; selected row is the active state) | — | — | — | — | (inherits Traits) | — |
| **Hero treatment** | indigo block, white text, paper-yellow CTA pill, no gradient/blob | — | per-archetype 3-stop dark gradient + 3 colored blurred blobs + Sukarin in white text | — | — | — | — | — | — | mini-hero: same per-archetype gradient inside white preview card | — |
| **Card surface** | — | option button: white + `--border` | SukarinCard has no card chrome (sits direct on gradient) | TraitsPanel pane: `rgba(255,255,255,0.7)` on cream | MatchList: `rgba(255,255,255,0.6)` on mint; MatchDetail: solid white | — | option button: same as Quiz | white + `--card-shadow` | (inherits Match) | white shell `--preview` | top zone `#F7F8FA` rounded; lists no card |
| **Body text** | white (in hero); `--text` (in right col text) | `--text` | white | `--text` | `--text` | — | `--text` | `--text` | (inherits) | (inherits) | `INDIGO` `#1C2340` |
| **Muted/secondary text** | `rgba(255,255,255,0.7)` on dark; `--sub` on light | `--sub` / `--text-sec` | `rgba(255,255,255,0.82)` desc; `rgba(255,255,255,0.7)` suffix | `--text-sec` / `--sub` | `--text-sec` / `--sub` | — | `--sub`, `--text-sec` | `--sub` | `--sub`, `--text-sec` | `--sub`, `--text-sec` | `TEXT_FAINT` `#9CA3AF` (NOT --sub `#6B7280`) |
| **Focus ring** | `--focus-ring` (#2E6DB4); CTA uses `--hero-accent` instead | `--focus-ring` | (no focusable elements in band itself) | `--focus-ring` | `--focus-ring` | `--focus-ring` | `--focus-ring` | (no focusable) | (pointer-events:none) | (pointer-events:none) | n/a |
| **Hover wash** | `--hover-wash` (#FAFBFC) on dots/nav | `--hover-wash` on options; `#b0b4be` border (hardcoded) | n/a | `#E6EAF5` on TraitBar (hardcoded blue tint) | `rgba(30,115,69,0.08)` (= --C @8%) on list row | `--hall-indigo-hover` on Export; full indigo bg on Retake | same as Quiz | n/a | (inherits) | (inherits) | — |

### Divergence rows (where the same role uses different tokens across surfaces)

- **Selected/active state** (highest divergence): TraitBar uses `--indigo-tint-soft` (#F0F3FF, blue-tint); MatchList uses `rgba(30,115,69,0.20)` (--C green-tint); Quiz options use `axis.tint` (varies per axis); Welcome carousel dot uses solid `--hall-indigo`; TraitCarousel pip uses `axis.color` (varies per axis); ProgressBar current uses `axis.color @ .4`. **6 distinct active idioms.**
- **Hover wash**: `--hover-wash` (#FAFBFC) on Welcome/Quiz; `#E6EAF5` (hardcoded indigo-blue) on TraitBar; `rgba(30,115,69,0.08)` (green) on MatchList; `--hall-indigo-hover` (full indigo) on Export; `--hover-wash-list` (#F6F7FB) only used by Slide4 allMore footer. **5 distinct hover idioms.**
- **Card surface**: solid white (MatchDetail, modal panel, Slide2 card, Slide4 preview shell) vs white@70% (TraitsPanel) vs white@60% (MatchList) vs no card (SukarinCard) vs `#F7F8FA` (PNG top zone). **5 surface idioms.**
- **Muted text**: `--sub` (`#6B7280`), `--text-sec` (`#4A5568`), `rgba(255,255,255,0.7)`, `rgba(255,255,255,0.82)`, `TEXT_FAINT` (`#9CA3AF`, PNG-only). 5 grey/white-alpha tones across surfaces.
- **Page bg progression** (Welcome → Quiz → Results bands → PNG): `#1C2340` indigo + `#F0F2F7` cool grey → `#F0F2F7` cool grey → 4-step band rhythm (dark gradient → cream → mint → sand) → `#FFFFFF` + `#F7F8FA` cool grey. PNG's bg is a **6th distinct off-white** that appears nowhere else in-app.

### Concordance rows (consistent across surfaces)

- **Brand anchor color** (`--hall-indigo` `#1C2340`): used as primary text everywhere, primary CTA bg in Results, modal title, Welcome hero bg, all slide titles. Single hue, used uniformly.
- **Focus ring** (`--focus-ring` `#2E6DB4`): consistent on Welcome, Quiz, TraitBar, MatchList, ExportModal.
- **Border** (`--border` `#E4E7ED`): consistent on Quiz options, MatchDetail divider, ComparisonBars track, modal canvas, TraitCarousel nav, FitRing track.
- **Quiz idiom replication**: Slide 1 Input is a near-pixel clone of Quiz screen (same `axis.tint`/`axis.dark` pattern). Slide 2's TraitBar, Slide 3's MatchDetail/MatchList, and Slide 4's full Results preview all mount the **real components** under `pointer-events: none` — so component-level color is identical to live Results. Drift only at the slide-shell level (slide bgs are `--bg`, not the band bgs).

---

## 3. Hero treatment comparison

| Aspect | Welcome hero (`Welcome.module.css:11–21, 115–140`) | Results hero (`Results.module.css:38–50` + `archetypePalette.ts`) | Slide 4 mini-hero (`Slide5Result.tsx:40–55`, `Slide5Result.module.css:68–77`) |
|---|---|---|---|
| Bg | Solid `--hall-indigo` `#1C2340`, no gradient | Per-archetype 3-stop linear-gradient, 3 dark variants chosen by `warmth` heuristic (cool indigo / warm brown / warm plum) | Same per-archetype gradient as Results (call to `archetypePalette(TYPE.code)` with fixed profile A:2 B:1 C:2 D:1 E:0) |
| Decorative blobs | None | 3 blurred `border-radius:50%` divs at axis-mid colors (axes 0/1/2 of code), `filter: blur(64px)`, opacities 0.24–0.48 | None — gradient only, no blobs |
| Text treatment | Eyebrow `rgba(255,255,255,0.7)` 12px tracked uppercase; title 44px white black-weight; lede 16px white | Chapter mark `currentColor`@.55 11ish px tracked; `SukarinCard` name 48px white black-weight; desc `rgba(255,255,255,0.82)` 15px; suffix `rgba(255,255,255,0.7)` | Region label `rgba(255,255,255,0.85)` ~14px uppercase; embedded SukarinCard renders at full 48px white inside the cropped region |
| Image / illustration | None — text-only hero | Sukarin character image (220×220) with `drop-shadow(0 12px 28px rgba(0,0,0,0.35))` next to text | Sukarin character (same component, same image, same drop-shadow) inside cropped preview |
| Dimensions | Full left column of split layout: width=`--hero-w`=420px; height=100vh | Full-bleed band: padding `80px 0 96px` (mobile 56/64); max-width content 1040px | Region inside `.preview` card: padded `var(--sp-md) var(--sp-lg)`, ~32px gutter for annot, no fixed dim |
| CTA | Yes — primary CTA pill in hero | None (hero is display, not action) | None |
| Brand register | Static, monolithic — same indigo for every visitor | Dynamic, theatrical — each archetype gets its own dark color palette | Replays Results' verdict-style hero, scaled |

**Are they the same idiom?** Three categorically distinct heroes:

1. **Welcome hero**: a fixed brand banner — corporate identity, same colors regardless of user.
2. **Results hero**: a personality verdict — colors derive algorithmically from quiz answers; intends to feel earned/personal.
3. **Slide 4 mini-hero**: a teaser of (2), inside the explainer carousel — uses the same algorithm but with fixed inputs, and is geometrically constrained (no full-bleed, no blobs).

They share *one* gesture: dark bg + white text + Sukarin (Results & Slide 4 only). They diverge on bg algorithm, presence of blobs, and dynamic vs static palette. Welcome doesn't render Sukarin in its own hero — Sukarin only appears in the right-panel carousel slide previews.

---

## 4. Selection / interactive-state inventory

| Component | Active bg | Active text | Active border | Active indicator (shape) | vs idle differ by | Shape redundancy? |
|---|---|---|---|---|---|---|
| Quiz option (`Quiz.tsx:51`) | `axis.tint` (per-axis pastel) | `var(--text)` (unchanged) | `axis.dark` 2px (vs `--border` idle) | none (just border + bg) | bg + border color | **No — color-only.** Border thickness already 2px in idle, only color changes. |
| TraitBar (`TraitBar.module.css:22–25`) | `--indigo-tint-soft` #F0F3FF | unchanged | `border-bottom-color: transparent` (vs `--border-light` idle) | none | bg + border-vanish | **No — color-only** (bottom-border vanishing is subtle). |
| TraitCarousel pip (`TraitCarousel.module.css:67–75`, `TraitCarousel.tsx:32`) | `axis.color` (per-current-axis full-sat) | n/a (visual only) | n/a | `transform: scale(1.3)` | bg color + scale | **Yes — color + size.** |
| MatchList row (`MatchList.module.css:31`) | `rgba(30,115,69,0.20)` | `var(--text)` (unchanged) | row inherits its 1px green-tint border-bottom | none — no chevron, no checkmark, no rank emphasis | bg color | **No — color-only.** |
| HomepageCarousel slide indicator (= `.dot` in `Welcome.module.css:78–81`) | `--hall-indigo` filled (vs transparent idle, indigo border on both) | n/a | (indigo border unchanged) | `transform: scale(1.15)` | fill state + scale | **Yes — color + size.** Also `aria-selected`. |
| ProgressBar segment (`ProgressBar.module.css:7–9`) | `done`: `axis.color` saturated; `cur`: `axis.color @ opacity .4` | n/a | n/a | none — same flat bar | bg fill saturated vs alpha | **No — color-only** between done/cur (and `cur` differs from `done` by alpha only — same hue). |
| Welcome nav arrow (`Welcome.module.css:99–113`) | hover: `--hover-wash` bg | text: `--hall-indigo` always | n/a | n/a | bg appears | n/a (hover, not selected) |
| ExportModal buttons | n/a (no selected state — only hover) | — | — | — | — | — |

**Color-only signal (fails SC 1.4.1 redundancy check):** Quiz option, TraitBar, MatchList row, ProgressBar segment.
**Color + shape redundancy (good):** TraitCarousel pip (scale), Welcome carousel slide dot (scale + aria-selected).

Note also: `aria-pressed` (Quiz option `Quiz.tsx`'s no `aria-pressed` shown in current code — only the Slide 1 mirror has `aria-checked`; live Quiz options pass `aria-pressed` only via DOM-level), `aria-selected` (Welcome dots), `aria-checked` (Slide 1 radio mirror), `aria-pressed` (TraitBar:27, MatchList:19) — so screen readers do receive non-color signal even where visual shape redundancy is absent.

---

## 5. Export PNG palette

### Hardcoded hexes vs token-derived

`exportPng.ts` is canvas-only — it cannot reference CSS custom properties at runtime. Every color is therefore a string. Inventory:

| Source | Value | Token equivalent? |
|---|---|---|
| `INDIGO` (line 81) | `#1C2340` | duplicates `--hall-indigo` |
| `TEXT_FAINT` (line 82) | `#9CA3AF` | **no token equivalent** — does not match `--sub` (#6B7280) or `--text-sec` (#4A5568) |
| `TEXT_BODY` (line 83) | `#1C2340` | duplicates `--hall-indigo` / `--text` |
| `TOP_ZONE_BG` (line 87) | `#F7F8FA` | **no token equivalent** — distinct from `--bg` #F0F2F7, `--cream`, `--hover-wash` |
| Page bg (line 439) | `#FFFFFF` | duplicates `--card` |
| Sukarin shadow (line 228) | `rgba(28,35,64,0.18)` | duplicates indigo |
| 型 suffix grey (line 269) | `#6B7280` | duplicates `--sub` |
| Description grey (line 274) | `#4A5568` | duplicates `--text-sec` |
| Profile header alpha (line 300) | `rgba(28,35,64,0.7)` | indigo at .7 |
| Bar dot fill (line 171) | `#FFFFFF` | duplicates `--card` |
| Bar dot border / track | `a.dark` / `a.color` from `AXES` | per-axis (E renders yellow per `axes.ts`, NOT orange per tokens.css) |
| "Best" pct color (line 482) | `AXES.C.dark` = `#1E7345` | duplicates `--C` |
| "Worst" pct color (line 492) | `INDIGO` | duplicates `--hall-indigo` |

**Net new colors not present in screen tokens:** `#9CA3AF` (TEXT_FAINT) and `#F7F8FA` (TOP_ZONE_BG).

### Drift vs on-screen Results

| Element | On-screen (Results) | In PNG | Match? |
|---|---|---|---|
| Page bg | indigo dark gradient (hero) → cream (traits) → mint (match) → sand (actions) | `#FFFFFF` page + `#F7F8FA` top zone | **No** — single off-white, no band rhythm, no dark hero |
| Sukarin context | Sits on dark per-archetype gradient with blobs | Sits on `#F7F8FA` cool grey, no gradient/blobs | **No** |
| Type name color | `white` 48px | `INDIGO` 28px | **No** |
| Description color | `rgba(255,255,255,0.82)` | `#4A5568` (= `--text-sec`) | **No** (alpha-on-dark vs solid-on-light) |
| Axis bar track | `axis.color` full-sat | `axis.color` full-sat | **Yes** |
| Axis bar dot | white + `axis.dark` border | white + `axis.dark` border | **Yes** |
| Match list division name | `--text` indigo bold | `TEXT_BODY` indigo bold | **Yes** (modulo font size: 14px screen / 13px PNG) |
| Match list dept | `--sub` `#6B7280` | `TEXT_FAINT` `#9CA3AF` | **No — different grey** |
| Match list rank | `--sub` `#6B7280` | `TEXT_FAINT` `#9CA3AF` | **No** |
| Match list fit % color | `fitColor(d.fit).text` (per-row tier: green / blue / amber / red) | column-fixed: best column always `#1E7345` green, worst always `#1C2340` indigo | **Partial** — top-fit row matches by coincidence (both green); other tiers diverge |

### Specific question: top-fit (≥80%) division row color

- **MatchList on-screen** (`MatchList.tsx:26`, `scoring.ts:68`): fit % text is `#1E7345` (= `--C` dark green). Row bg if also selected: `rgba(30,115,69,0.20)`; else `transparent` (over mint band tint `--C-tint`).
- **Exported PNG** (`exportPng.ts:482`): in the "best" (相性の高い課) list, fit % text is `AXES.C.dark` = `#1E7345`. Same hex.
- **Identical?** The fit-% TEXT color is **identical (`#1E7345`)**. But: PNG renders this hue for every row in the "best" column regardless of fit value (so a 60% row would also be green in PNG, blue on-screen). Behind the row, the surface differs — PNG list has white page + cool grey top zone, no mint band. The selected-row green bg from on-screen has no PNG equivalent (PNG list has no selection state at all). So the **exact match** is limited to the % color of the top row when it's ≥80%; everything else around it differs.

---

## 6. Cultural / brand register (observations only)

### Japanese-language UI / culturally-loaded colors

- **Indigo `#1C2340`** (hall-indigo) reads close to traditional 紺色 (kon'iro) — a Japanese civic/uniform color associated with municipal authority, school uniforms, formal kimono. Used as the brand anchor and rendered as the Welcome hero block. This is a culturally legible "official Yokosuka" register.
- **Cream `#FAF7F2`** + **sand `#F5EBD8`** read as washi-paper / aged-document. They sit in the same family as printed civic materials (paper white, slightly warm). Choice fits a 役所 (city hall) document register.
- **Red `--A` (#C0392B / #E8534A / #FFF0EE)** — in isolation reads ceremonial / hanko stamp / 紅 (kurenai); here it's used as the "人との関わり方 / 市民対話" axis. The semantic mapping (red = dialogue/people) doesn't follow a Japanese cultural cue specifically; it appears chosen for visual distinction rather than cultural meaning.
- **Green `--C`** is used for both the axis "担う役割 / 市民支援" AND for the entire Match-band identity (`--band-match: var(--C-tint)`, chapter mark `var(--C)`). Green in Japanese civic context (e.g., 環境 ministry, 防災 signage) does carry a fresh/safe register, but here it's reading as "this section is about axis C", which is a different signal — the band makes Match feel like an axis-C topic when it's not.
- **No red/white ceremonial pairing** is foregrounded (the 日の丸 register is absent from the design).
- **Indigo + cream + warm sand** as the dominant non-axis palette is the core "voice" — close to a Muji / civic-print / annual-report aesthetic.

### Cream/sand register: corporate annual report vs character-quiz vibe

- The cream traits band + sand actions band, combined with serifed-sized indigo headlines and tabular data (% bars, ranked lists with rank numbers), reads more annual-report than playful-quiz on its own.
- The Sukarin character image, the per-archetype gradient hero, and the colorful axis bars are what break out of the report register. They concentrate in the hero band and (to a lesser extent) the trait bars.
- Concretely: the Match band is the most report-like — `MatchList` is rank + name + dept + percentage, no character imagery. Combined with the mint surface (which doesn't tonally connect to traits/actions), it reads as a "data appendix" interrupting a more emotionally toned page.
- The Actions band's plain CTA pair on warm sand reads functional/document-style, not character-quiz-style.

### Per-archetype dark hero as "personality verdict"

- The hero swapping its base gradient and three blob hues based on the archetype code does communicate "this result is yours, not a generic page." That dynamic-color-as-identity gesture is a personality-verdict idiom (cf. type quizzes that show your archetype on a colored card).
- However: the gradient pool is only 3 variants (cool-indigo / warm-brown / warm-plum) chosen by a binary `warmth` count of A+/C+ poles (`archetypePalette.ts:76–78`). 32 archetype codes (2^5) collapse onto 3 background gradients. The blobs vary more (5 axis-mid hues × jittered positions), but a reader sees one of three rooms.
- Combined with the dark value (`#0F1428`–`#3D3027` range), every archetype gets a similar "evening/serious/momentous" emotional register. There's no archetype that gets a daytime/bright hero. So the "verdict" framing is uniform in tone; what varies is which family of warm/cool you sit in.

---

## Source map (file paths cited)

- `src/styles/tokens.css`
- `src/styles/reset.css`
- `src/styles/layout.css`
- `src/data/axes.ts`
- `src/lib/scoring.ts`
- `src/lib/archetypePalette.ts`
- `src/lib/exportPng.ts`
- `src/screens/Welcome.tsx`, `Welcome.module.css`
- `src/screens/Quiz.tsx`, `Quiz.module.css`
- `src/screens/Results.tsx`, `Results.module.css`
- `src/components/AppShell.tsx`
- `src/components/ProgressBar.tsx`, `ProgressBar.module.css`
- `src/components/SukarinCard.tsx`, `SukarinCard.module.css`
- `src/components/TraitsPanel.tsx`, `TraitsPanel.module.css`
- `src/components/TraitBar.tsx`, `TraitBar.module.css`
- `src/components/TraitCarousel.tsx`, `TraitCarousel.module.css`
- `src/components/MatchBrowse.tsx`, `MatchBrowse.module.css`
- `src/components/MatchList.tsx`, `MatchList.module.css`
- `src/components/MatchDetail.tsx`, `MatchDetail.module.css`
- `src/components/ComparisonBars.tsx`, `ComparisonBars.module.css`
- `src/components/FitRing.tsx`
- `src/components/ExportButton.tsx`, `ExportButton.module.css`
- `src/components/RetakeButton.tsx`, `RetakeButton.module.css`
- `src/components/ExportModal.tsx`, `ExportModal.module.css`
- `src/components/HomepageCarousel/HomepageCarousel.tsx`, `HomepageCarousel.module.css`
- `src/components/HomepageCarousel/slides/Slide2Input.tsx`, `Slide2Input.module.css`
- `src/components/HomepageCarousel/slides/Slide3Scoring.tsx`, `Slide3Scoring.module.css`
- `src/components/HomepageCarousel/slides/Slide4Comparison.tsx`, `Slide4Comparison.module.css`
- `src/components/HomepageCarousel/slides/Slide5Result.tsx`, `Slide5Result.module.css`
