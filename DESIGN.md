---
name: Yokosuka Division Quiz
description: An internal staff-room quiz mapping Yokosuka City Hall employees to their best-fit 課.
colors:
  hall-indigo: "#1C2340"
  cool-paper: "#F0F2F7"
  card-white: "#FFFFFF"
  frame-mist: "#E4E7ED"
  frame-mist-light: "#F0F2F7"
  quiet-slate: "#4A5568"
  hush-slate: "#6B7280"
  inquiry-crimson: "#C0392B"
  inquiry-crimson-mid: "#E8534A"
  inquiry-crimson-tint: "#FFF0EE"
  field-cobalt: "#2E6DB4"
  field-cobalt-mid: "#4A90D9"
  field-cobalt-tint: "#EBF3FC"
  care-forest: "#1E7345"
  care-forest-mid: "#4CAF7D"
  care-forest-tint: "#ECF8F1"
  steady-plum: "#7B3F9E"
  steady-plum-mid: "#9B59B6"
  steady-plum-tint: "#F5EDF8"
  generalist-bronze: "#9C6310"
  generalist-bronze-mid: "#F5A623"
  generalist-bronze-tint: "#FFF6E6"
typography:
  display:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  headline:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "normal"
  title:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.12em"
  numeral:
    fontFamily: "Hiragino Sans, Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  pill: "999px"
  sm: "6px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  card: "16px"
  banner: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  banner:
    backgroundColor: "{colors.hall-indigo}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.banner}"
    padding: "56px 32px 48px"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.hall-indigo}"
    rounded: "{rounded.card}"
    padding: "28px"
  button-primary:
    backgroundColor: "{colors.hall-indigo}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.xl}"
    padding: "18px 24px"
    typography: "{typography.body}"
  button-share:
    backgroundColor: "{colors.hall-indigo}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  button-retake:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.hall-indigo}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  button-back:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.hush-slate}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  option:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.hall-indigo}"
    rounded: "{rounded.md}"
    padding: "16px 20px"
    typography: "{typography.body}"
  option-hover:
    backgroundColor: "#FAFBFC"
    textColor: "{colors.hall-indigo}"
  axis-pill:
    rounded: "{rounded.pill}"
    padding: "6px 14px"
    typography: "{typography.label}"
  list-item:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.hall-indigo}"
    padding: "12px 16px"
  list-item-active:
    backgroundColor: "#DCE4F8"
    textColor: "{colors.hall-indigo}"
---

# Design System: Yokosuka Division Quiz

## 1. Overview

**Creative North Star: "The Staff Room Bulletin"**

This is a quiz the staff room made for itself, not a thing City Hall published outward. Imagine a friendly note pinned to the bulletin board between the coffee machine and the leave-request form: clear typography, a single confident anchor color, a small allowance for play. The quiz takes its content seriously — 32 archetypes and 102 課 are real, researched, useful — but the wrapper around that content is light, internal, slightly handmade. It should feel like a colleague made it for colleagues.

The system commits to one dominant identity color (Hall Indigo, deep enough to read as ink rather than corporate navy) and uses the five axis colors as a strict functional encoding for the work-style axes (人/現場/支援/安定/専門) — never as decoration. Surfaces are predominantly Cool Paper (a tinted near-white) with full white cards riding above. There are no gradients, no glass, no faceted panels, and there is no second accent: confidence comes from typographic hierarchy and the indigo.

The system explicitly rejects the safe defaults that the category invites. **Not** the standard 役所 PDF (navy + serif headers + bordered tables + cherry blossoms): we don't dress like the org that made us. **Not** the SaaS landing template (gradient hero, three feature cards, stock illustration): nothing here is selling. **Not** Buzzfeed-quiz chaos (loud color, all-caps clickbait, confetti): playful does not mean carnival. **Not** the enterprise dashboard (KPI tiles, dense charts, cold gray): this is not a performance review.

**Key Characteristics:**
- One committed accent (Hall Indigo) carries banners, primary buttons, and the dark surface that frames hero moments.
- Five axis colors as **functional encoding only** — each owns its axis everywhere it appears (pill, marker, bar dot) and never wanders.
- Generous Japanese line-height (1.75 body) with a tight 1.3 reserved for big headlines.
- Cards float on Cool Paper with one ambient shadow — flat by default, no nested cards.
- Banners use a 0/0/28/28 radius (only the bottom corners are round) — a Staff Room Bulletin signature.
- Calm interaction motion: 120–250ms color/border transitions, no choreography.

## 2. Colors: The Staff Room Palette

Indigo as anchor, paper as ground, five axis colors held to their job. The system reads as one quiet color (Hall Indigo on Cool Paper) decorated by five disciplined functional accents.

### Primary
- **Hall Indigo** (`#1C2340`): The system's voice. Carries the welcome banner, the type-reveal banner, the primary `診断をはじめる` CTA, the share button, the step numerals on the welcome card. Deep enough to read as confident ink, not a stock corporate blue. If a single element on a screen needs to feel anchored, it gets Hall Indigo.

### Neutral
- **Cool Paper** (`#F0F2F7`): The page surface. Also doubles as the subtle inset background under the "How it works" steps card. This is the room's wall color.
- **Card White** (`#FFFFFF`): All elevated surfaces — cards, options, the back button, the all-課 list, retake button.
- **Frame Mist** (`#E4E7ED`): Hairline borders on options, list rows, dividers, progress segments at rest.
- **Frame Mist Light** (`#F0F2F7`): Identical to Cool Paper, used as the subtler border tier.
- **Quiet Slate** (`#4A5568`): Body text on the welcome step descriptions and on result-card prose. The next step down from Hall Indigo.
- **Hush Slate** (`#6B7280`): Captions, axis labels, stat labels, "Q1/20" counters. The faintest readable text in the system.

### Tertiary — The Axis Encoding
Five axes, five colors, three tones each (`-dark` for text and markers, `-mid` for bar fills and active surfaces, `-tint` for backgrounds and pills). Tones share hue and chroma; only lightness moves. **Each color belongs to exactly one axis and may not be used decoratively.**

- **Inquiry Crimson** (`#C0392B` / `#E8534A` / `#FFF0EE`) — Axis A: 人と接する仕事 ↔ 仕組みで解く仕事.
- **Field Cobalt** (`#2E6DB4` / `#4A90D9` / `#EBF3FC`) — Axis B: 現場で動く ↔ 計画でまとめる.
- **Care Forest** (`#1E7345` / `#4CAF7D` / `#ECF8F1`) — Axis C: 支援する ↔ 基準で守らせる.
- **Steady Plum** (`#7B3F9E` / `#9B59B6` / `#F5EDF8`) — Axis D: 安定運営 ↔ 革新.
- **Generalist Bronze** (`#9C6310` / `#F5A623` / `#FFF6E6`) — Axis E: ゼネラリスト ↔ スペシャリスト.

### Named Rules

**The One Indigo Rule.** Hall Indigo is the only non-axis color allowed to carry meaningful surface. If a CTA, banner, or anchor element needs identity weight, it gets indigo. Do not introduce a second non-axis brand color. Do not tint the indigo blue, black, or purple.

**The Axis Lockup Rule.** A color belongs to its axis. Crimson is Axis A everywhere — pill, bar, marker, kanji chip, active row tint. Never use Care Forest because "green felt right here." If a screen has no axis context, it has no axis color.

**The No Pure Black, No Pure White Rule.** `#000` is forbidden — body indigo (`#1C2340`) is the floor. Pure `#FFFFFF` is the only white in the system and is reserved for elevated surfaces; backgrounds use Cool Paper (`#F0F2F7`).

## 3. Typography

**Display Font:** Hiragino Sans (with Hiragino Kaku Gothic ProN, BIZ UDPGothic, Meiryo, -apple-system fallback)
**Body Font:** Hiragino Sans (same stack — single-family system)
**Label/Numeral Font:** Hiragino Sans

**Character:** A single Japanese-first humanist sans, calm and legible, with the brunt of the personality coming from weight contrast (400 / 500 / 700 / 800) rather than family mixing. Weight 800 is reserved for short numerals and codes only — never running text, never headlines.

### Hierarchy

- **Display** (700, 30px, line-height 1.3): Welcome title (`横須賀市役所 部署タイプ診断`) and result type name. The biggest moments in the system. Two-line wrap is normal because of Japanese phrasing — let it.
- **Headline** (700, 24px, line-height 1.7): Scenario question on the quiz screen and the matched-課 name on results. Generous line-height because Japanese paragraph rhythm needs air.
- **Title** (700, 20px, line-height 1.3): Section titles ("おすすめの部署", "ぴったりの相性"), trait carousel winning-trait labels.
- **Body** (500, 16px, line-height 1.75): Primary running copy, option text, descriptions. Body weight is **medium (500)** for option buttons; **normal (400)** for paragraph descriptions. Cap line length at ~38–42 zenkaku characters (≈ 65–75 ch latin equivalent) for descriptions.
- **Label** (700, 12px, letter-spacing 0.12em, uppercase for Latin only): Pre-headers (`YOKOSUKA CITY HALL`), axis tags, axis labels, stat labels, fit labels. Always paired with Hush Slate or with axis-dark on axis-tint.
- **Numeral** (800, 30px, line-height 1): Stat numbers on the welcome card (`20` / `5` / `102`), result-screen percentages. The only place weight 800 is allowed.

### Named Rules

**The Weight-Not-Family Rule.** All hierarchy comes from Hiragino Sans at 400 / 500 / 700 / 800. Do not introduce a serif, a display face, or a second sans (Inter, Noto, etc.) for variety. The system's voice is one face spoken at five volumes.

**The 800-For-Numerals Rule.** Weight 800 is reserved for short, glanceable values: stat numerals, percentages, type-code letters, step numbers. Never set running Japanese text in 800 — it reads as shouting and breaks the staff-room tone.

**The Air-For-Japanese Rule.** Body line-height is 1.75. Headlines that wrap (24px scenario, 30px display) get 1.3–1.7. Never compress below 1.3 — Japanese without breathing room reads as a contract, not a quiz.

## 4. Elevation

The system is **mostly flat with one ambient card shadow**. Surfaces are layered tonally — Cool Paper page, white cards above it, Hall Indigo banner as the deepest dark surface — and a single soft shadow lifts cards just enough to read as objects, not panels. There are no hover-elevation transitions on cards, no pressed states with deeper shadows, no second elevation tier. Banners carry no shadow at all; their depth comes from tone.

### Shadow Vocabulary

- **Card Lift** (`box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08)`): The single allowed shadow. Applies to `.card`, the all-課 scrolling list, and the side-panel list on the match screen. Soft, ambient, low-contrast.
- **Marker Punch** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15)`): A tighter, harder shadow used **only** on the small white axis-bar markers (the 14–16px circles riding the trait bars). It exists to lift the marker off the colored track, not to convey hierarchy.

### Named Rules

**The Flat-By-Default Rule.** Surfaces do not gain shadow on hover. Hover changes color and border, never elevation. If you reach for a deeper shadow to signal interactivity, you've picked the wrong language — change the border to `#b0b4be` or shift the background to `#fafbfc` instead.

**The No Glass Rule.** No `backdrop-filter`, no semi-transparent panels, no frosted overlays. Cards are opaque white on Cool Paper. Banners are opaque indigo. Translucency is not in this system's vocabulary.

## 5. Components

### Buttons

- **Shape:** Generously rounded but not pill-shaped. Primary CTA uses 14px radius; share/retake/option buttons use 12px or 10px. The back button uses 10px.
- **Primary** (`btn-start`): Hall Indigo background, white text, 18px vertical padding, full block width, weight 700, letter-spacing 0.02em. Hover: opacity 0.88 plus `transform: translateY(-1px)`. The only button in the system with a lift transform.
- **Share** (`btn-share`): Hall Indigo background, white text, 14px padding, paired with Retake at equal width. Hover deepens to `#2a3558`.
- **Retake** (`btn-retake`): White background, Hall Indigo text, **2px Hall Indigo border**. Hover inverts to filled indigo. The pair (Share / Retake) is the system's signature ending: an indigo block beside its outline echo.
- **Back** (`btn-back`): White background, Hush Slate text, 2px Frame Mist border, 10px radius. The only button that intentionally recedes. Hover: border darkens to `#aaa`, text darkens to Hall Indigo.

### Options (the quiz answer rows)

- **Shape:** 10px radius rectangles, 16px / 20px padding, full block width.
- **Style:** Card White background with a **2px Frame Mist border**. Body text in Hall Indigo at weight 500.
- **Hover:** Border shifts to `#b0b4be`, background to `#FAFBFC`. No fill, no shadow.
- **Number prefix** (`opt-num`): Set at weight 700, 10px right margin, same color as text. A small typographic anchor, not a separate badge.

### Cards / Containers

- **Corner Style:** 16px (`--card-r`) — gently curved, deliberately not pill or sharp.
- **Background:** Card White only.
- **Shadow Strategy:** Card Lift only (see Elevation).
- **Border:** None on cards; hairline `#E4E7ED` is for in-card divisions (option borders, list-row dividers).
- **Internal Padding:** 28px (`--card-pad`) on standard cards. Section containers may use 16px–24px.
- **Nesting:** Forbidden. The "How it works" steps panel inside the welcome card uses a Cool Paper fill (`var(--bg)`), not a second card — flat tonal recession instead of stacked elevation.

### Banners — The Bulletin Surface

The signature container. Two banners exist: the welcome banner (`w-header`) and the type-reveal banner on results (`type-banner`).

- **Background:** Hall Indigo, edge-to-edge.
- **Corner Style:** `border-radius: 0 0 28px 28px`. Top corners are square; bottom corners are 28px. This is the project's strongest visual signature — the bulletin pinned at the top of the page.
- **Padding:** 48–56px vertical, 32px horizontal.
- **Typography:** Display title in white, Label-style city tag (`YOKOSUKA CITY HALL`) at 60% opacity above it, optional subtext at 78% opacity below.
- **Decoration:** None. No mascot, no illustration, no gradient. The empty space carries the moment.

### Axis Pills

The functional axis encoding made small.

- **Shape:** Pill (999px radius), 6px / 14px padding.
- **Style:** Background = `axis-tint`, text = `axis-dark`. Set in Label typography (12px, weight 700).
- **Behavior:** Color is non-negotiable per axis. Five pills appear together on the welcome card as a preview of the dimensions the quiz measures, and individually on each quiz question (`axis-tag`) to indicate which axis the current scenario probes.

### Trait Bars (Signature Component)

The result-screen visualization. Each axis displays as a short horizontal track with a white circular marker positioned at the user's score.

- **Track:** Height 10–12px, pill-radius. Background is a subtle gradient or fill in `axis-tint`; this is the only place a tint surface is allowed to span more than 80px wide.
- **Marker:** 14–16px white circle with a 2.5px solid border in `axis-dark`. Carries Marker Punch shadow (`0 1px 3px rgba(0,0,0,0.15)`).
- **Interaction:** Markers slide on `transition: left 0.4s ease-out` — the only choreographed motion in the system.
- **Comparison rows** (`comp-track--div`): When showing a 課's profile alongside the user's, the 課's track renders at 0.45 opacity. Opacity, not a separate color.

### List Rows (the all-課 ranking)

- **Style:** White rows divided by `1px solid #E4E7ED`, 12px / 16px padding, 12px gap between rank / name / fit-percent.
- **Hover:** Background to `#f6f7fb`.
- **Active:** Background to `#dce4f8` (a custom indigo tint, not derived from the axis palette — it belongs to the list's "selected" state).
- **Focus visible:** 2px Field Cobalt outline at -2px offset. Cobalt is borrowed here because it is the most legible axis color on white.
- **Density:** Compact — 14px name, 12px department, 16px weight-800 percentage. The list is for browsing volume, not lingering.

## 6. Do's and Don'ts

### Do:
- **Do** anchor every screen with Hall Indigo (`#1C2340`) on a Cool Paper (`#F0F2F7`) page. One indigo, one ground.
- **Do** use the five axis colors as a strict functional encoding — A=Crimson, B=Cobalt, C=Forest, D=Plum, E=Bronze — and use all three tones (dark / mid / tint) for their assigned roles.
- **Do** keep banners with the `0 0 28px 28px` radius. The pinned-bulletin shape is the project's signature.
- **Do** set body Japanese at 16px / line-height 1.75 / weight 500 for interactive text and 400 for prose. Cap descriptions around 38–42 zenkaku characters per line.
- **Do** earn hierarchy through weight contrast (400 / 500 / 700 / 800), not through font swaps or color changes.
- **Do** use the Card Lift shadow once per surface and stop. Flat-by-default everywhere else.
- **Do** keep motion calm — 120–250ms color and border transitions. The trait-marker slide is the one allowed choreographed move.
- **Do** write copy like a colleague making something for the office: warm, knowing, slightly playful, never preachy.

### Don't:
- **Don't** import the 役所-PDF template — no navy headers with serif accents, no cherry-blossom banners, no bordered government tables, no committee mascots. The whole point is that this does NOT look like the org that made it.
- **Don't** dress this as a SaaS landing — no gradient heroes, no three-up feature cards, no "Get started for free", no stock illustrations of diverse teammates pointing at laptops.
- **Don't** lean into Buzzfeed-quiz chaos — no all-caps clickbait, no confetti, no rainbow gradients, no emoji-anchored CTAs. Playful is not carnival.
- **Don't** stage this like an enterprise dashboard — no KPI tiles, no metric grids, no chart-heavy result page that reads as a performance review.
- **Don't** introduce a sixth color, a second accent, or a "fun" decorative hue. The palette is closed.
- **Don't** use an axis color outside its axis. Crimson is never decorative; Forest is not "supportive green for friendly cards."
- **Don't** use pure `#000` or pure `#fff` for typography or page backgrounds. Body color is `#1C2340`; backgrounds are `#F0F2F7`. Pure white is for elevated surfaces only.
- **Don't** add `border-left` or `border-right` greater than 1px as a colored stripe on cards, alerts, or list items. Side-stripe accents are forbidden.
- **Don't** apply `background-clip: text` with a gradient. Gradient text is banned. Emphasis comes from weight or size.
- **Don't** use `backdrop-filter` or any glassmorphism. No frosted nav, no translucent panels.
- **Don't** nest cards. A panel inside a card uses a Cool Paper fill, not a second elevated white surface.
- **Don't** animate layout properties (width, height, margin, padding). Only opacity, transform, color, and the explicit `left` slide on trait markers.
- **Don't** introduce a second typeface. No Inter, no Noto, no serif display, no monospace for "code feel."
- **Don't** use weight 800 for running Japanese text. It is reserved for numerals and short codes.
- **Don't** add an em dash (`—`) or `--` to copy. Use commas, colons, semicolons, periods, or parentheses instead.
