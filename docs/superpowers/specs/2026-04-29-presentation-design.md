# 部署タイプ診断 — "How It Works" Presentation Design Spec

**Date:** 2026-04-29
**Author:** Quinn Ngo
**Status:** Approved (brainstorm complete, ready for implementation plan)

## Goal

Build a 5-minute Japanese-language slide deck explaining how the Yokosuka City Hall department-type quiz works, for presentation to the Personnel Division Section Chief (人事課長). The deck must:

1. Make the system clear in concept — not a black box. The audience should understand what the tool is for users, what information goes into it, and how that information is compared against department data to produce a result.
2. Use the project's `huashu-design` skill to produce a polished slide deck whose look, feel, and theme match the existing React app.

## Audience and framing

- **Audience:** 横須賀市役所 人事課長 (Personnel Division Section Chief).
- **Meeting outcome:** Educational / FYI. No decision is being asked of the audience.
- **Single takeaway** (what the audience should remember 24h later):
  > "This tool ranks all 103 divisions by fit using 5 axes from 20 questions — it's transparent, not magic."

## Constraints

| Decision | Value |
|---|---|
| Length | ~5 minutes |
| Slide count | 6 slides |
| Language | Japanese only |
| Live demo | Happens **after** the deck, as a separate activity. Not embedded in slides. |
| Screenshot use in deck | Mixed: real app screenshots where they help, simplified in-slide mocks where reduced visual distraction is preferable. |
| Theme | **Tight match** to the existing React app — same palette, type, and component vocabulary. |
| Kanji-glyph motif | **Not committed.** The app's axis kanji glyphs (人/機/動/策/援/律/守/革/幅/専) are not finalized, so the deck must not anchor visual identity on them. Axis-color stripes serve as the primary recognition device instead. |
| Information density | **High.** Japanese business-deck convention: each slide is read as a document, not viewed as a placard. Apple-style "one word + image per slide" is an explicit anti-pattern. Body text, tables, multi-element diagrams are encouraged where they serve the content. |
| Deck format | 16:9, 1920×1080 |
| Heritage / inspiration | **Acknowledge openly that the design is MBTI-inspired** (5 binary axes → 32 archetype codes mirrors MBTI's 4 binary axes → 16 types). The deck should not hide this lineage — surface it as a credit/footnote so the audience reads the methodology in a familiar frame. |

## Slide-by-slide content (the spine)

### Slide 1 — タイトル
- **Title:** 部署タイプ診断 — その仕組み
- **Subtitle:** 横須賀市役所 内部ツール / 約5分で説明
- **Hero treatment** mirroring the app Welcome screen (palette + type).
- Footer/credit line as appropriate.

### Slide 2 — 入力 (Input)
- **Header:** 入力 — 5つの軸 × 20の質問
- **5 axes** displayed in axis-color rows, each with label + plus/minus poles (drawn from `src/data/axes.ts`):
  - A 人との関わり方 — 制度・仕組み ⇄ 市民対話
  - B 仕事の進め方 — 政策立案 ⇄ 現場対応
  - C 担う役割 — ルール管理 ⇄ 市民支援
  - D 変化への姿勢 — 革新推進 ⇄ 安定運営
  - E 知識のスタイル — 専門追求 ⇄ 幅広対応
- **One example scenario card** taken verbatim from `src/data/questions.ts` (e.g., A1: 介護申請の窓口対応) with its 5-option Likert scale.
- **Footer:** 全20問・約3分

### Slide 3 — 採点 (Scoring)
- **Header:** 採点 — 回答が軸スコアに変わる
- **Body:** Diagram showing 1 question contributes to 1 axis. 5-point Likert scale maps to numeric values (-2, -1, 0, +1, +2). Reverse-keyed questions are flipped before aggregation.
- **Visual:** Axis-A bar showing the 4 questions on that axis combining into one final axis score.
- **Equation hint:** 軸スコア = 各軸の(反転補正済み回答値)の **平均** （= 約 −2〜+2 の範囲）

### Slide 4 — 比較 (Comparison)
- **Header:** 比較 — 5次元ベクトル vs 103部署
- **Body:**
  - Each respondent's result is a 5D vector: (A, B, C, D, E), each in roughly −2..+2.
  - Each of the 103 divisions has a pre-designed 5D ideal vector, hand-coded from job-content analysis (see `src/data/divisions.ts`).
  - **Distance** = ユークリッド距離 between the two vectors: `√Σ(uᵢ − dᵢ)²` across all 5 axes.
  - **適合度 (fit %)** = `(1 − 距離 / 最大距離) × 100`. 最大距離 = √80 ≈ 8.94 (the worst-case 5D distance when every axis differs by 4). Smaller distance ⇒ higher fit %.
- **Visual:** Side-by-side radar/bar chart — one user vector versus one division ideal vector — with the distance segment annotated.
- **Footer:** 部署ベクトルは職務内容に基づき事前設計

### Slide 5 — 結果 (Output)
- **Header:** 結果 — アーキタイプ + 部署ランキング
- **Body:** Real or simplified screenshot of the Results screen — TypeReveal hero (one of 32 archetypes) + top divisions list with fit %.
- **Caption:** 32アーキタイプから1つ（5軸の符号の組み合わせ：2⁵ = 32）+ 全103部署を適合度順にランク
- **Footnote (small):** ※ MBTI（4軸 → 16タイプ）の発想を参考に、5軸 → 32タイプへ拡張。職員の性格分類ではなく、業務適性の把握を目的とする。

### Slide 6 — まとめ・デモへ
- **3-line summary** in three axis-tinted cards:
  - 入力: 20問 → 5軸スコア
  - 比較: 5次元距離計算で全103部署をランク
  - 出力: アーキタイプ + 部署ランキング
- **Positioning safeguard (注記):** 配属判断ツールではなく、職員の自己理解の補助。
- **Closing CTA:** ▶ ライブデモへ (button in app primary style)

## Visual treatment

### Palette (direct app tokens)
- Background: `--bg #F0F2F7`
- Card / content surface: `#FFFFFF` with `--card-shadow`
- Body text: `--hall-indigo #1C2340`
- Axis accents: A 赤 / B 青 / C 緑 / D 紫 / E 橙 — use `--*-mid` for fills, `--*` for darker text, `--*-tint` for soft backgrounds.

### Type
- Family: app stack (`Hiragino Sans, BIZ UDPGothic, Meiryo, sans-serif`).
- Slide hierarchy: Title 64–80px / Section 36–44px / Body 22–28px / Caption 16–18px.
- Numerals and short labels: `--fw-black 800` (matches the app's TypeReveal hero treatment).
- Line height: `--lh-tight 1.3` for headers, `--lh-body 1.75` for paragraphs.

### Layout grid
- 96px outer margin, 12-column inner grid.
- Title slide: centered hero block, mirroring the Welcome screen composition.
- Content slides: left-aligned title row + content block below, biased toward higher information density (multi-region layouts, tables, multi-card grids are fine).
- Footer chrome: small page indicator (e.g., `n / 6`) and section label.

### Motifs and components
- **Primary recognition device:** an 8px axis-color stripe under section titles (replaces kanji-glyph dependency).
- Reused app components: rounded `--card-r 16px` cards with `--card-shadow`, app-style buttons, app-spec data viz (`--bar-h 12px`, `--mkr-size 16px`).
- Kanji used only as content (axis labels, scenario text), never as decorative motif.

### Per-slide visual cues
- **S1:** Hero composition, indigo on neutral bg, app-style title treatment.
- **S2:** Five axis-color rows + one real scenario card from the app.
- **S3:** Stacked-contribution bar diagram, with reverse-key marker shown.
- **S4:** Side-by-side radar/bar comparison (user vs one division), distance line.
- **S5:** Cropped/simplified Results screen mock (TypeReveal + top-N list).
- **S6:** Three axis-tinted summary cards + primary-style demo CTA.

## Production / delivery

### Build skill
- **`huashu-design`** skill (slide-deck Starter Components: 幻灯片外壳, Speaker Notes, Tweaks).
- React + Babel inside the deck HTML, per huashu-design defaults.

### Artifact
- **Single self-contained HTML file** (assets inlined or shipped relative).
- **Path:** `presentations/how-it-works/index.html` (built output).
- **Source:** `presentations/how-it-works/` (slide modules and supporting components).

### Inputs reused from the app (single-source-of-truth)
- `src/styles/tokens.css` — palette + type tokens copied or imported into deck CSS.
- Real screenshot captures of the Welcome / Quiz / Results screens for slides 2 + 5.
- Real question text from `src/data/questions.ts` (e.g., A1) for the slide-2 example.
- Axis labels from `src/data/axes.ts` for slide 2.

### Verification
- Run huashu-design's Playwright click-test on the built deck — advance through all 6 slides without errors.
- Manual review at projector aspect (16:9, 1920×1080) for type readability and grid alignment.

### Optional exports (do these only if requested)
- PDF via huashu-design's `export_deck_pdf.mjs` (handout backup).
- PPTX via `export_deck_pptx.mjs` (only if 人事課長 wants an editable copy).

### Out of scope (this iteration)
- Animations / transitions beyond simple fade.
- Audio, SFX, BGM.
- Video export (MP4/GIF).
- The live demo content itself — that is a separate, post-deck activity.

## Files this work creates / changes

| Path | Action | Purpose |
|---|---|---|
| `docs/superpowers/specs/2026-04-29-presentation-design.md` | new | This spec |
| `presentations/how-it-works/` | new dir | Deck source files |
| `presentations/how-it-works/index.html` | new | Built deck artifact |

The `src/` app code is not modified by this work.
