# 2026-05-07 Color measurements - Results page

**Working color spaces.** sRGB IEC 61966-2-1 (input). CIELab D65 (Lab/LCh, dE2000 via Sharma et al. 2005). OKLab/OKLCH (Ottosson 2020). Relative luminance / contrast: WCAG 2.2 SC 1.4.3 / SC 1.4.11. Colorblind sim: Vienot-Brettel-Mollon 1999 reduction (linear-sRGB matrices, Table 1 of *Digital video colourmaps for checking the legibility of displays by dichromats*).

**Method.** Hand-coded. sRGB->linear via IEC piecewise gamma 2.4; 3x3 to XYZ@D65 (Bradford-adapted sRGB primaries); Lab via f(t)=t^(1/3) cube-root branch above (6/29)^3; OKLab via Ottosson's M1/M2 cube-root pipeline. dE2000 implemented per Sharma 2005 with hue-discontinuity correction. Alpha-over compositing performed in linear sRGB then re-encoded.

**Source files.** `src/styles/tokens.css`, `src/lib/scoring.ts:67-72` (`fitColor`), `src/lib/archetypePalette.ts:80-85` (gradients) and `:91-113` (blobs), `src/components/SukarinCard.module.css:29-63`, `src/components/MatchList.module.css:5-32`, `src/components/{Export,Retake}Button.module.css`, `src/screens/Results.module.css`.

---

## 1. Contrast ratios

### 1a. Hero - white 1.0a `.name` (48px @ 800) vs every gradient stop

Required: 3:1 (SC 1.4.3 large text - 48px @ 800 is large by every WCAG rule).

| FG | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#FFFFFF` | `#0F1428` (cool (warmth 0) stop 0) | 18.24:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#1C2340` (cool (warmth 0) stop 1) | 15.40:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#2A2454` (cool (warmth 0) stop 2) | 14.20:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#1A1612` (mid  (warmth 1) stop 0) | 17.99:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#2D241E` (mid  (warmth 1) stop 1) | 15.19:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#3D3027` (mid  (warmth 1) stop 2) | 12.72:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#2C1F32` (warm (warmth 2) stop 0) | 15.57:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#4A2B3D` (warm (warmth 2) stop 1) | 12.32:1 | large (48px/800) | 1.4.3 | PASS |
| `#FFFFFF` | `#6E3F47` (warm (warmth 2) stop 2) | 8.52:1 | large (48px/800) | 1.4.3 | PASS |

### 1b. Hero - white-alpha `.suffix` vs darkest & lightest gradient stops

Code (`SukarinCard.module.css:46-53`): `.suffix { font-size: 0.5em; font-weight: var(--fw-bold); color: rgba(255,255,255,0.7); }`. Brief said 0.85; actual code is **0.7**. Both reported below.

Size: 0.5em of 48px = **24px** at weight 700. WCAG 1.4.3 large-text def: >=18pt (24px) regardless of weight OR >=14pt (18.66px) when bold (>=700). 24px @ 700 is large by both clauses -> 3:1 required.

| FG (white@a composited) | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#DADADB` (W@0.7) | `#0F1428` (darkest of all) | 13.06:1 | large (24px/700) | 1.4.3 | PASS |
| `#E0DCDC` (W@0.7) | `#6E3F47` (lightest of all) | 6.26:1 | large (24px/700) | 1.4.3 | PASS |
| `#EDEEEE` (W@0.85) | `#0F1428` (darkest of all) | 15.70:1 | large (24px/700) | 1.4.3 | PASS |
| `#F0EEEF` (W@0.85) | `#6E3F47` (lightest of all) | 7.38:1 | large (24px/700) | 1.4.3 | PASS |

### 1c. Hero - `.desc` white 0.82a (15px regular, normal text -> 4.5:1) vs every stop

| FG (W@0.82 composited) | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#EAEAEA` | `#0F1428` (cool (warmth 0) stop 0) | 15.17:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EAEAEB` | `#1C2340` (cool (warmth 0) stop 1) | 12.81:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EAEAEC` | `#2A2454` (cool (warmth 0) stop 2) | 11.82:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EAEAEA` | `#1A1612` (mid  (warmth 1) stop 0) | 14.95:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EAEAEA` | `#2D241E` (mid  (warmth 1) stop 1) | 12.62:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EBEAEA` | `#3D3027` (mid  (warmth 1) stop 2) | 10.60:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EAEAEA` | `#2C1F32` (warm (warmth 2) stop 0) | 12.94:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EBEAEB` | `#4A2B3D` (warm (warmth 2) stop 1) | 10.27:1 | normal (15px/400) | 1.4.3 | PASS |
| `#EDEBEB` | `#6E3F47` (warm (warmth 2) stop 2) | 7.17:1 | normal (15px/400) | 1.4.3 | PASS |

### 1d. Hero - blob (AXIS_MID @ 0.42a) over stop, then `.desc` (W@0.82) over composite

Tested every (gradient x stop x AXIS_MID) combo (3*3*5 = 45). Sorted lowest-first; 18 worst reported.

AXIS_MID set: A `#E8534A`, B `#4A90D9`, C `#4CAF7D`, D `#9B59B6`, E `#F5A623`. Blob 1 alpha range is `0.42 + jitter*0.06` -> 0.42-0.48. Used 0.42 floor.

| Gradient | Stop | Blob | Composite zone | W@0.82 over zone | Ratio | SC 1.4.3 (4.5:1) |
|---|---|---|---|---|---|---|
| warm (warmth 2) | 2 `#6E3F47` | E `#F5A623` | `#B7783B` | `#F4EEEB` | 3.17:1 | FAIL |
| warm (warmth 2) | 1 `#4A2B3D` | E `#F5A623` | `#AE7434` | `#F3EEEA` | 3.41:1 | FAIL |
| mid  (warmth 1) | 2 `#3D3027` | E `#F5A623` | `#AC7525` | `#F3EEEA` | 3.42:1 | FAIL |
| cool (warmth 0) | 2 `#2A2454` | E `#F5A623` | `#A97344` | `#F2EDEB` | 3.46:1 | FAIL |
| cool (warmth 0) | 1 `#1C2340` | E `#F5A623` | `#A87336` | `#F2EDEA` | 3.50:1 | FAIL |
| mid  (warmth 1) | 1 `#2D241E` | E `#F5A623` | `#A97320` | `#F2EDEA` | 3.50:1 | FAIL |
| warm (warmth 2) | 0 `#2C1F32` | E `#F5A623` | `#A9722C` | `#F2EDEA` | 3.52:1 | FAIL |
| mid  (warmth 1) | 0 `#1A1612` | E `#F5A623` | `#A8711A` | `#F2EDEA` | 3.59:1 | FAIL |
| cool (warmth 0) | 0 `#0F1428` | E `#F5A623` | `#A77126` | `#F2EDEA` | 3.59:1 | FAIL |
| warm (warmth 2) | 2 `#6E3F47` | C `#4CAF7D` | `#617E62` | `#ECEEEC` | 3.86:1 | FAIL |
| warm (warmth 2) | 1 `#4A2B3D` | C `#4CAF7D` | `#4B7A5F` | `#EBEEEC` | 4.23:1 | FAIL |
| mid  (warmth 1) | 2 `#3D3027` | C `#4CAF7D` | `#447B58` | `#EBEEEC` | 4.26:1 | FAIL |
| cool (warmth 0) | 2 `#2A2454` | C `#4CAF7D` | `#3B7968` | `#EBEEED` | 4.36:1 | FAIL |
| warm (warmth 2) | 2 `#6E3F47` | B `#4A90D9` | `#616B9B` | `#ECEDF1` | 4.39:1 | FAIL |
| cool (warmth 0) | 1 `#1C2340` | C `#4CAF7D` | `#367960` | `#EAEEEC` | 4.42:1 | FAIL |
| mid  (warmth 1) | 1 `#2D241E` | C `#4CAF7D` | `#3C7956` | `#EBEEEC` | 4.43:1 | FAIL |
| warm (warmth 2) | 0 `#2C1F32` | C `#4CAF7D` | `#3C785B` | `#EBEEEC` | 4.46:1 | FAIL |
| mid  (warmth 1) | 0 `#1A1612` | C `#4CAF7D` | `#367754` | `#EAEEEC` | 4.57:1 | PASS |

Lowest contrast across all 45 zone combos: **3.17:1** (zone `#B7783B`).  
Highest contrast across all 45 zone combos: **6.90:1** (zone `#693D7E`).

### 1e. Traits band - text colors on `--cream` (#FAF7F2)

| FG | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#1C2340` (--text) | `#FAF7F2` | 14.41:1 | normal | 1.4.3 | PASS |
| `#6B7280` (--sub) | `#FAF7F2` | 4.52:1 | normal | 1.4.3 | PASS |

### 1f. Match band - text colors on `--C-tint` (#ECF8F1)

| FG | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#1C2340` (--text) | `#ECF8F1` | 14.12:1 | normal | 1.4.3 | PASS |
| `#6B7280` (--sub) | `#ECF8F1` | 4.43:1 | normal | 1.4.3 | FAIL |

### 1g. MatchList - `--text` / `--sub` over container composite

Container is `rgba(255,255,255,0.6)` over `--C-tint`. Hover and active are `rgba(30,115,69,0.08|0.20)` over the container composite.

Composited bgs: idle=`#F8FCFA`, hover=`#EFF5F2`, active=`#E1E9E4`.

| FG | BG | Ratio | Size | SC | Result |
|---|---|---|---|---|---|
| `#1C2340` (--text) | `#F8FCFA` (idle) | 14.88:1 | normal | 1.4.3 | PASS |
| `#1C2340` (--text) | `#EFF5F2` (hover) | 13.94:1 | normal | 1.4.3 | PASS |
| `#1C2340` (--text) | `#E1E9E4` (active) | 12.45:1 | normal | 1.4.3 | PASS |
| `#6B7280` (--sub) | `#F8FCFA` (idle) | 4.67:1 | normal | 1.4.3 | PASS |
| `#6B7280` (--sub) | `#EFF5F2` (hover) | 4.38:1 | normal | 1.4.3 | FAIL |
| `#6B7280` (--sub) | `#E1E9E4` (active) | 3.91:1 | normal | 1.4.3 | FAIL |

### 1h. Actions band - buttons (Export = white-on-indigo, Retake = indigo-on-white)

Buttons sit on `--band-actions` = `--hero-accent` (#F5EBD8).  
Export: 14px @ 700 = bold; 14px is < 18.66px so *not* large by WCAG -> 4.5:1 required.  
Retake border 2px indigo on cream is non-text contrast -> 3:1 required.

| FG | BG | Context | Ratio | Size | SC | Result |
|---|---|---|---|---|---|---|
| `#FFFFFF` | `#1C2340` | export default | 15.40:1 | normal (14px/700) | 1.4.3 | PASS |
| `#FFFFFF` | `#2A3558` | export hover | 12.01:1 | normal | 1.4.3 | PASS |
| `#1C2340` | `#FFFFFF` | retake default | 15.40:1 | normal | 1.4.3 | PASS |
| `#FFFFFF` | `#1C2340` | retake hover | 15.40:1 | normal | 1.4.3 | PASS |
| `#1C2340` | `#F5EBD8` | retake border vs band | 13.02:1 | non-text | 1.4.11 | PASS |

### 1i. Focus ring `--focus-ring` (#2E6DB4) vs every band background (SC 1.4.11, 3:1)

| Ring | BG | Surface | Ratio | SC | Result |
|---|---|---|---|---|---|
| `#2E6DB4` | `#FFFFFF` | white card | 5.30:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#FAF7F2` | --cream | 4.96:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#ECF8F1` | --C-tint | 4.86:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#F5EBD8` | --hero-accent | 4.48:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#0F1428` | cool (warmth 0) stop 0 | 3.44:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#1C2340` | cool (warmth 0) stop 1 | 2.91:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#2A2454` | cool (warmth 0) stop 2 | 2.68:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#1A1612` | mid  (warmth 1) stop 0 | 3.39:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#2D241E` | mid  (warmth 1) stop 1 | 2.87:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#3D3027` | mid  (warmth 1) stop 2 | 2.40:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#2C1F32` | warm (warmth 2) stop 0 | 2.94:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#4A2B3D` | warm (warmth 2) stop 1 | 2.33:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#6E3F47` | warm (warmth 2) stop 2 | 1.61:1 | 1.4.11 | FAIL |
| `#2E6DB4` | `#F8FCFA` | MatchList idle composite | 5.12:1 | 1.4.11 | PASS |
| `#2E6DB4` | `#E1E9E4` | MatchList active composite | 4.28:1 | 1.4.11 | PASS |

### 1j. Fit pill text vs fit pill bg (`scoring.ts:67-72` `fitColor`)

| Tier | Text | BG | Ratio | SC | Result |
|---|---|---|---|---|---|
| top | `#1E7345` | `#ECF8F1` | 5.36:1 | 1.4.3 | PASS |
| high | `#2E6DB4` | `#EBF3FC` | 4.73:1 | 1.4.3 | PASS |
| mid | `#9C6310` | `#FFF6E6` | 4.65:1 | 1.4.3 | PASS |
| low | `#C0392B` | `#FFF0EE` | 4.91:1 | 1.4.3 | PASS |

---

## 2. Perceptual deltas - dE2000, CIELab, OKLCH

| Pair | dE2000 | dL* | da* | db* | OK dL | OK dC | OK dh deg |
|---|---|---|---|---|---|---|---|
| --cream vs --hero-accent (current adjacent in Traits->Actions) | 6.38 | -3.97 | 0.10 | 7.67 | -0.0342 | 0.0200 | 2.8 |
| --cream vs paper-warm (#F4EEE0) proposed in old doc | 4.32 | -3.12 | -0.48 | 4.74 | -0.0271 | 0.0123 | 6.8 |
| paper-warm vs --hero-accent (proposed sequence) | 2.31 | -0.85 | 0.59 | 2.94 | -0.0071 | 0.0077 | -4.0 |
| --C-tint vs --cream (current Match->Traits step) | 6.97 | 0.79 | 5.33 | 0.76 | 0.0088 | -0.0083 | -79.9 |
| --C-tint vs --hero-accent (Match->Actions step if Traits skipped) | 10.12 | -3.18 | 5.44 | 8.43 | -0.0254 | 0.0117 | -77.1 |

**Three-way compare** (`--cream` <-> `--C-tint` <-> `--hero-accent`):

| Pair | dE2000 |
|---|---|
| cream<->C-tint | 6.97 |
| cream<->hero-accent | 6.38 |
| C-tint<->hero-accent | 10.12 |

Threshold reference (Sharma 2003): dE 1.0 barely perceptible; 2.3 just-noticeable difference (JND); 5+ clearly different bands.

---

## 3. Fit-ramp discriminability

### 3a. Current `fitColor` tiers

| Tier | Text | Fill | BG | L*(text) | L*(fill) | L*(bg) |
|---|---|---|---|---|---|---|
| top | `#1E7345` | `#4CAF7D` | `#ECF8F1` | 42.7 | 64.7 | 96.5 |
| high | `#2E6DB4` | `#4A90D9` | `#EBF3FC` | 45.4 | 58.4 | 95.5 |
| mid | `#9C6310` | `#F5A623` | `#FFF6E6` | 47.0 | 74.1 | 97.2 |
| low | `#C0392B` | `#E8534A` | `#FFF0EE` | 44.7 | 55.9 | 95.9 |

Fill L* sequence (top->low): 64.7, 58.4, 74.1, 55.9.
Monotonic in lightness? **NO**.

**Pairwise dE2000 between adjacent fills:**

| Adjacent pair | dE2000 |
|---|---|
| top <-> high | 40.03 |
| high <-> mid | 52.47 |
| mid <-> low | 33.85 |

Worst-case adjacent gap: **mid <-> low** dE = 33.85.

**Deuteranopia (Vienot-Brettel-Mollon 1999) sim of fills:**

| Tier | Original | Sim | L*(sim) |
|---|---|---|---|
| top | `#4CAF7D` | `#9A9A7F` | 62.9 |
| high | `#4A90D9` | `#8080DA` | 57.2 |
| mid | `#F5A623` | `#C2C20F` | 76.1 |
| low | `#E8534A` | `#949441` | 59.8 |

Adjacent dE2000 in deuteranopia space:

| Pair | dE2000 |
|---|---|
| top <-> high | 41.24 |
| high <-> mid | 66.90 |
| mid <-> low | 15.69 |

Worst deuteranopia gap: **mid <-> low** dE = 15.69.

**Protanopia (VBM 1999) sim of fills:**

| Tier | Original | Sim | L*(sim) |
|---|---|---|---|
| top | `#4CAF7D` | `#A7A77D` | 67.5 |
| high | `#4A90D9` | `#8A8AD9` | 60.4 |
| mid | `#F5A623` | `#B1B125` | 70.1 |
| low | `#E8534A` | `#72724C` | 47.1 |

Adjacent dE2000 in protanopia space:

| Pair | dE2000 |
|---|---|
| top <-> high | 44.81 |
| high <-> mid | 60.94 |
| mid <-> low | 25.52 |

Worst protanopia gap: **mid <-> low** dE = 25.52.

**Grayscale (WCAG relative luminance Y) of fills:**

| Tier | Y |
|---|---|
| top | 0.3368 |
| high | 0.2641 |
| mid | 0.4681 |
| low | 0.2384 |

| Pair | dY | luminance ratio |
|---|---|---|
| top <-> high | 0.0726 | 1.23:1 |
| high <-> mid | 0.2039 | 1.65:1 |
| mid <-> low | 0.2297 | 1.80:1 |

Worst grayscale ratio gap: **top <-> high** = 1.23:1.

### 3b. Old-doc proposed tiers

| Tier | Text | Fill | BG | L*(text) | L*(fill) | L*(bg) |
|---|---|---|---|---|---|---|
| top | `#1E7345` | `#4CAF7D` | `#ECF8F1` | 42.7 | 64.7 | 96.5 |
| high | `#0F766E` | `#14B8A6` | `#ECFDF5` | 44.5 | 67.4 | 97.9 |
| mid | `#B45309` | `#F59E0B` | `#FFFBEB` | 46.9 | 72.2 | 98.5 |
| low | `#B91C1C` | `#EF4444` | `#FEF2F2` | 40.0 | 55.0 | 96.4 |

Fill L* sequence (top->low): 64.7, 67.4, 72.2, 55.0.
Monotonic in lightness? **NO**.

**Pairwise dE2000 between adjacent fills:**

| Adjacent pair | dE2000 |
|---|---|
| top <-> high | 11.13 |
| high <-> mid | 45.77 |
| mid <-> low | 34.48 |

Worst-case adjacent gap: **top <-> high** dE = 11.13.

**Deuteranopia (Vienot-Brettel-Mollon 1999) sim of fills:**

| Tier | Original | Sim | L*(sim) |
|---|---|---|---|
| top | `#4CAF7D` | `#9A9A7F` | 62.9 |
| high | `#14B8A6` | `#9E9EA8` | 65.4 |
| mid | `#F59E0B` | `#BDBD00` | 74.3 |
| low | `#EF4444` | `#939338` | 59.3 |

Adjacent dE2000 in deuteranopia space:

| Pair | dE2000 |
|---|---|
| top <-> high | 18.45 |
| high <-> mid | 36.35 |
| mid <-> low | 14.30 |

Worst deuteranopia gap: **mid <-> low** dE = 14.30.

**Protanopia (VBM 1999) sim of fills:**

| Tier | Original | Sim | L*(sim) |
|---|---|---|---|
| top | `#4CAF7D` | `#A7A77D` | 67.5 |
| high | `#14B8A6` | `#AFAFA6` | 71.2 |
| mid | `#F59E0B` | `#ABAB11` | 67.9 |
| low | `#EF4444` | `#6B6B46` | 44.4 |

Adjacent dE2000 in protanopia space:

| Pair | dE2000 |
|---|---|
| top <-> high | 11.73 |
| high <-> mid | 24.37 |
| mid <-> low | 26.99 |

Worst protanopia gap: **top <-> high** dE = 11.73.

**Grayscale (WCAG relative luminance Y) of fills:**

| Tier | Y |
|---|---|
| top | 0.3368 |
| high | 0.3718 |
| mid | 0.4389 |
| low | 0.2290 |

| Pair | dY | luminance ratio |
|---|---|---|
| top <-> high | 0.0351 | 1.09:1 |
| high <-> mid | 0.0671 | 1.16:1 |
| mid <-> low | 0.2099 | 1.75:1 |

Worst grayscale ratio gap: **top <-> high** = 1.09:1.

---

## 4. Blob over gradient compositing - chroma loss

AXIS_MID composited at 0.42a over each gradient stop (sRGB linear alpha-over).  Source mid C* compared to composite C*.

| Gradient | Stop | Mid | Composite | L*(comp) | C*ab(comp) | C*ab(mid) | dC* | %loss |
|---|---|---|---|---|---|---|---|---|
| cool (warmth 0) | 0 `#0F1428` | A `#E8534A` | `#9E3939` | 38.7 | 47.6 | 67.8 | 20.1 | 29.7% |
| cool (warmth 0) | 0 `#0F1428` | B `#4A90D9` | `#326296` | 40.6 | 33.3 | 43.8 | 10.5 | 24.0% |
| cool (warmth 0) | 0 `#0F1428` | C `#4CAF7D` | `#337758` | 45.1 | 31.3 | 44.3 | 12.9 | 29.2% |
| cool (warmth 0) | 0 `#0F1428` | D `#9B59B6` | `#693D7E` | 33.7 | 43.0 | 57.7 | 14.7 | 25.5% |
| cool (warmth 0) | 0 `#0F1428` | E `#F5A623` | `#A77126` | 52.0 | 50.0 | 74.5 | 24.4 | 32.8% |
| cool (warmth 0) | 1 `#1C2340` | A `#E8534A` | `#9F3D44` | 39.8 | 44.7 | 67.8 | 23.1 | 34.0% |
| cool (warmth 0) | 1 `#1C2340` | B `#4A90D9` | `#35649A` | 41.5 | 34.2 | 43.8 | 9.6 | 21.9% |
| cool (warmth 0) | 1 `#1C2340` | C `#4CAF7D` | `#367960` | 46.0 | 28.7 | 44.3 | 15.5 | 35.1% |
| cool (warmth 0) | 1 `#1C2340` | D `#9B59B6` | `#6A4083` | 34.7 | 43.8 | 57.7 | 13.9 | 24.2% |
| cool (warmth 0) | 1 `#1C2340` | E `#F5A623` | `#A87336` | 52.8 | 43.8 | 74.5 | 30.7 | 41.2% |
| cool (warmth 0) | 2 `#2A2454` | A `#E8534A` | `#A03D50` | 40.2 | 43.9 | 67.8 | 23.9 | 35.2% |
| cool (warmth 0) | 2 `#2A2454` | B `#4A90D9` | `#3A649E` | 42.0 | 36.1 | 43.8 | 7.7 | 17.6% |
| cool (warmth 0) | 2 `#2A2454` | C `#4CAF7D` | `#3B7968` | 46.4 | 24.7 | 44.3 | 19.6 | 44.2% |
| cool (warmth 0) | 2 `#2A2454` | D `#9B59B6` | `#6C4188` | 35.5 | 46.0 | 57.7 | 11.8 | 20.4% |
| cool (warmth 0) | 2 `#2A2454` | E `#F5A623` | `#A97344` | 53.1 | 37.9 | 74.5 | 36.6 | 49.1% |
| mid  (warmth 1) | 0 `#1A1612` | A `#E8534A` | `#9F3932` | 38.8 | 49.8 | 67.8 | 18.0 | 26.5% |
| mid  (warmth 1) | 0 `#1A1612` | B `#4A90D9` | `#346294` | 40.6 | 32.1 | 43.8 | 11.7 | 26.7% |
| mid  (warmth 1) | 0 `#1A1612` | C `#4CAF7D` | `#367754` | 45.1 | 32.3 | 44.3 | 11.9 | 26.9% |
| mid  (warmth 1) | 0 `#1A1612` | D `#9B59B6` | `#6A3D7C` | 33.7 | 42.0 | 57.7 | 15.7 | 27.2% |
| mid  (warmth 1) | 0 `#1A1612` | E `#F5A623` | `#A8711A` | 52.1 | 54.6 | 74.5 | 19.9 | 26.7% |
| mid  (warmth 1) | 1 `#2D241E` | A `#E8534A` | `#A13D36` | 39.9 | 48.5 | 67.8 | 19.2 | 28.4% |
| mid  (warmth 1) | 1 `#2D241E` | B `#4A90D9` | `#3B6495` | 41.6 | 31.2 | 43.8 | 12.6 | 28.8% |
| mid  (warmth 1) | 1 `#2D241E` | C `#4CAF7D` | `#3C7956` | 46.1 | 31.4 | 44.3 | 12.9 | 29.1% |
| mid  (warmth 1) | 1 `#2D241E` | D `#9B59B6` | `#6D417D` | 35.0 | 40.1 | 57.7 | 17.6 | 30.4% |
| mid  (warmth 1) | 1 `#2D241E` | E `#F5A623` | `#A97320` | 52.7 | 53.0 | 74.5 | 21.5 | 28.9% |
| mid  (warmth 1) | 2 `#3D3027` | A `#E8534A` | `#A34139` | 41.0 | 47.5 | 67.8 | 20.3 | 29.9% |
| mid  (warmth 1) | 2 `#3D3027` | B `#4A90D9` | `#436796` | 42.9 | 29.6 | 43.8 | 14.2 | 32.4% |
| mid  (warmth 1) | 2 `#3D3027` | C `#4CAF7D` | `#447B58` | 47.1 | 29.9 | 44.3 | 14.3 | 32.4% |
| mid  (warmth 1) | 2 `#3D3027` | D `#9B59B6` | `#71457E` | 36.5 | 38.4 | 57.7 | 19.3 | 33.5% |
| mid  (warmth 1) | 2 `#3D3027` | E `#F5A623` | `#AC7525` | 53.6 | 52.1 | 74.5 | 22.4 | 30.0% |
| warm (warmth 2) | 0 `#2C1F32` | A `#E8534A` | `#A03B3D` | 39.5 | 47.1 | 67.8 | 20.7 | 30.6% |
| warm (warmth 2) | 0 `#2C1F32` | B `#4A90D9` | `#3B6397` | 41.4 | 32.8 | 43.8 | 11.0 | 25.2% |
| warm (warmth 2) | 0 `#2C1F32` | C `#4CAF7D` | `#3C785B` | 45.8 | 28.7 | 44.3 | 15.6 | 35.2% |
| warm (warmth 2) | 0 `#2C1F32` | D `#9B59B6` | `#6D3F80` | 34.7 | 43.1 | 57.7 | 14.6 | 25.4% |
| warm (warmth 2) | 0 `#2C1F32` | E `#F5A623` | `#A9722C` | 52.6 | 48.3 | 74.5 | 26.2 | 35.2% |
| warm (warmth 2) | 1 `#4A2B3D` | A `#E8534A` | `#A53F43` | 41.2 | 46.8 | 67.8 | 21.0 | 31.0% |
| warm (warmth 2) | 1 `#4A2B3D` | B `#4A90D9` | `#4A6599` | 42.9 | 31.9 | 43.8 | 11.9 | 27.2% |
| warm (warmth 2) | 1 `#4A2B3D` | C `#4CAF7D` | `#4B7A5F` | 47.3 | 24.5 | 44.3 | 19.7 | 44.6% |
| warm (warmth 2) | 1 `#4A2B3D` | D `#9B59B6` | `#754382` | 36.8 | 42.2 | 57.7 | 15.5 | 26.8% |
| warm (warmth 2) | 1 `#4A2B3D` | E `#F5A623` | `#AE7434` | 53.7 | 46.6 | 74.5 | 27.9 | 37.4% |
| warm (warmth 2) | 2 `#6E3F47` | A `#E8534A` | `#AF4848` | 44.5 | 47.3 | 67.8 | 20.5 | 30.3% |
| warm (warmth 2) | 2 `#6E3F47` | B `#4A90D9` | `#616B9B` | 46.2 | 28.6 | 43.8 | 15.2 | 34.8% |
| warm (warmth 2) | 2 `#6E3F47` | C `#4CAF7D` | `#617E62` | 49.9 | 20.2 | 44.3 | 24.0 | 54.3% |
| warm (warmth 2) | 2 `#6E3F47` | D `#9B59B6` | `#834B85` | 40.5 | 40.2 | 57.7 | 17.5 | 30.4% |
| warm (warmth 2) | 2 `#6E3F47` | E `#F5A623` | `#B7783B` | 55.9 | 46.7 | 74.5 | 27.8 | 37.3% |

Largest chroma loss: **54.3%** (axis C `#4CAF7D` over warm (warmth 2) stop 2 `#6E3F47` -> `#617E62`).  
Smallest chroma loss: **17.6%** (axis B `#4A90D9` over cool (warmth 0) stop 2).  
Mean chroma loss across all 45 combos: **31.3%**.

---

## 5. Suffix size classification (WCAG large text)

`SukarinCard.module.css:46-53`:

```
.suffix {
  font-size: 0.5em;          /* of .name 48px = 24px */
  font-weight: var(--fw-bold);  /* 700 */
  color: rgba(255, 255, 255, 0.7);  /* brief said 0.85; code is 0.7 */
}
```

WCAG 2.2 SC 1.4.3 large-text: >=18pt (24px) at any weight, OR >=14pt (18.66px) when bold (>=700). 24px @ 700 satisfies **both** rules -> **3:1** required, not 4.5:1. Confirmed.

White@0.7 over darkest hero stop `#0F1428` -> composite `#DADADB`. Contrast = **13.06:1** vs 3:1 -> **PASS**.

White@0.7 over warm-gradient lightest stop `#6E3F47` -> composite `#E0DCDC`. Contrast = **6.26:1** -> **PASS**.

Worst-case zone (highest-luminance blob composite): warm `#6E3F47` + axis-E `#F5A623` @ 0.48a -> zone `#BF7E39`. White@0.7 over it = `#EEE2DC`. Contrast = **2.64:1** vs 3:1 -> **FAIL**.

---

## Notes / caveats

- Brettel-Vienot-Mollon (1997) full long-form simulation uses two half-planes anchored at 475nm/575nm; the 1999 Vienot reduction (used here) is the standard short-form widely deployed in browsers and design tools (Chrome DevTools, Stark). Both give qualitatively equivalent results for sRGB display imagery.

- All compositing was performed in linear-light sRGB before re-encoding (gamma-correct). This matches modern CSS compositing in `color-mix`/`color()` contexts but **not** legacy `rgba()` compositing in some browsers, which composites in gamma sRGB and yields slightly darker blobs (~1-3 dE difference in mid-greys).

- WCAG 2.2 contrast formula uses sRGB IEC 61966-2-1 luminance weights (0.2126/0.7152/0.0722). APCA contrast (drafted for WCAG 3) is not used here.

