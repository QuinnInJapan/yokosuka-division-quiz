# Agent Brief — Homepage Build (verbatim prompt)

This is the prompt to hand the implementation agent. It contains no reference to any existing page. The agent designs from goals and constraints only.

---

## Build a homepage for a Japanese government quiz app

### Product

A 3-minute personality quiz that matches Yokosuka City Hall employees (and curious visitors) to one of 102 city departments. Five trait axes × 20 questions. Output is a ranked list of best-fit departments. Audience: Japanese-speaking, primarily desktop. Tone: serious-municipal, not playful, but not stuffy either.

### Your Job

Build the homepage at `prototypes/homepage-v2/` as an isolated Vite app. Two pieces:

1. **`Welcome.tsx`** — the landing surface: brand introduction, one CTA to start the quiz, and a section that previews how the quiz works.
2. **`Stepper.tsx`** — a navigation control for a 5-step preview carousel that lives inside the "how it works" section.

A `HomepageCarousel` component already exists and you import it as-is. You do not modify it. The carousel renders 5 slides showing the quiz flow (input → scoring → comparison → result → example). Your `Stepper` controls navigation between those slides. The carousel itself currently embeds a stepper internally; you may need a small refactor to externalize it. Document the choice.

### Layout

Two-column split, fixed:

- **Left:** 420px wide. Brand introduction, stats, CTA. Dark indigo background (`var(--hall-indigo)`), white ink.
- **Right:** fluid. Holds the carousel + your stepper. Inherits `var(--bg)`. No panel background, no border.

Both columns: `padding-inline: var(--sp-2xl)`. Single-screen on desktop ≥1280px (no scroll). Mobile <900px: stacked, no min-height enforcement (untuned is acceptable).

### Left Column — Hero

Content order, top to bottom:

1. Eyebrow ("YOKOSUKA CITY HALL" or equivalent)
2. Title (Japanese, two lines: "横須賀市役所 / 部署タイプ診断")
3. Lede (one sentence describing what the quiz does, in Japanese)
4. **Stats trio** — three large numbers with labels: 20 (問), 5 (軸), 102 (課). Stats anchor the column visually.
5. CTA — "診断をはじめる" pill button, white background, indigo text
6. **Five thin vertical color stripes** at the bottom-left edge, 4px wide × 60px tall, one per axis color (`--A` red, `--B` blue, `--C` green, `--D` purple, `--E` amber). Subtle hint that color carries meaning.

**Color budget:** indigo + white + ONE accent color, used only for the stat numerals. Pick warm cream `#F5EBD8` or one axis hue. Document the choice.

**Type hierarchy must come from size and weight, NOT opacity tiers:**

| Element        | Size      | Weight | Color            |
|----------------|-----------|--------|------------------|
| Eyebrow        | 12px caps | 700    | white@70% (used once only) |
| Title          | 56px      | 800    | white            |
| Lede           | 16px      | 400    | white            |
| Stat numerals  | 56px      | 800    | accent           |
| Stat labels    | 11px caps | 700    | white            |

### Right Column — Content

No header text. No "How it works" eyebrow, no "仕組みを見る" title. The carousel slide content speaks for itself — adding a section title would compete with it.

Stack inside the right column:
1. `<HomepageCarousel />` (imported, verbatim)
2. `<Stepper />` at the bottom

### Stepper

Five steps. Lives at the **bottom** of the carousel viewport (functions like a pagination footer). Total height ~36px.

**Numerals row:** `01 · 02 · 03 · 04 · 05`. Hairline separators between numerals (1px, `var(--border)`).

State styling:
- **Active:** bold, indigo, 2px indigo underline
- **Done:** indigo, no underline
- **Upcoming:** `var(--sub)` gray, no underline

No badges. No circles. No connectors. No English sub-labels in the strip itself.

**Single contextual label below the strip.** One line, small gray text, shows ONLY the current step's Japanese label (one of: 入力 / 採点 / 比較 / 結果 / 例). Updates as the user navigates. Layout never shifts width.

Steps are clickable buttons that jump the carousel to that slide. Keyboard: existing carousel keyboard nav (ArrowLeft/Right) continues to work — your stepper just reflects state.

### Tokens

Use existing tokens in `src/styles/tokens.css` (relative-import from prototype). Indigo, axis colors, spacing scale, fonts, typography weights are all defined. **Do not invent new tokens** unless an existing one cannot express the value. If you must add a token, document the addition and the reason.

### Copy

- Japanese title, stat numbers, and CTA text are **verbatim** (do not translate or rephrase): "横須賀市役所", "部署タイプ診断", "20", "5", "102", "問", "軸", "課", "診断をはじめる".
- Lede sentence: write fresh in Japanese. Keep under 30 characters. Should describe what the quiz does and how long it takes.
- Eyebrow text (English caps): write fresh. Should anchor brand without screaming.
- Step labels in stepper contextual line: 入力 / 採点 / 比較 / 結果 / 例 (these match the carousel's existing 5 slides).

### Anti-Patterns (forbidden)

These are the failure modes you must actively avoid. They will look like reasonable choices in the moment. They are not.

1. **Opacity-only hierarchy.** Do not differentiate three text levels by opacity alone (`opacity: 0.55 / 0.6 / 0.82`). Use size and weight. Opacity may be used once at one tier, not three times at three tiers.

2. **Border-radius + inset-stripe collision.** Do not give a button both `border-radius` and a square inset shadow stripe (e.g. `box-shadow: inset 4px 0 0 indigo`). The square stripe will visually clip against the rounded corner and read as broken.

3. **Bilingual stacked labels.** Do not pair an English eyebrow with a Japanese title in every section. Your stepper does not get English sub-labels. Pick one language per element. The hero column's single eyebrow is the page's only English eyebrow.

4. **Box jungle.** Do not give every primitive a card. The whole page should have ≤ 6 visible boxes total. Cards exist only where affordance requires shape. Whitespace and type hierarchy do most of the work.

5. **Stat numbers as decoration.** The 20 / 5 / 102 trio is the most impressive content on the page. Do not render them as a small eyebrow-weight strip. They are the visual anchor of the hero column.

6. **Floating sub-columns with no anchor.** Do not let secondary content (lists, examples, callouts) hang off in their own column with no relationship to the main flow.

7. **Inconsistent column padding.** Both columns use the same horizontal padding token. Do not use different `clamp()` values per side.

8. **Heavy stepper chrome.** Do not build a vertical rail of badges, circles, double-language labels, or dotted connectors. The five steps fit in <40px of vertical space.

9. **Wasted axis colors.** Five axis colors exist (A/B/C/D/E). They are tokens for *meaning*. Use them as accents in the hero column. Do not reduce them to 26px letter circles only.

10. **Section titles competing with content.** Do not add a section header above the carousel. The carousel's own slide titles carry the framing.

### Files & Scaffold

```
prototypes/homepage-v2/
├── index.html              # Vite entry
├── vite.config.ts          # isolated dev server, port 5174
├── package.json            # extends root
├── src/
│   ├── main.tsx
│   ├── App.tsx             # renders <Welcome />
│   ├── Welcome.tsx
│   ├── Welcome.module.css
│   ├── Stepper.tsx
│   ├── Stepper.module.css
│   └── HomepageCarousel/   # COPIED VERBATIM from existing source
│       ├── HomepageCarousel.tsx
│       ├── HomepageCarousel.module.css
│       ├── index.ts
│       └── slides/...
```

### Files You May Read

- `src/styles/tokens.css` (design tokens)
- `src/data/axes.ts` (axis colors and labels)
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/**` (the carousel source you are porting verbatim)

### Files You Must NOT Read

- `src/screens/Welcome.tsx`
- `src/screens/Welcome.module.css`
- `.worktrees/feat-homepage-carousel/src/screens/Welcome.tsx`
- `.worktrees/feat-homepage-carousel/src/screens/Welcome.module.css`
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/Stepper.tsx`
- `.worktrees/feat-homepage-carousel/src/components/HomepageCarousel/Stepper.module.css`

You are designing from goals, not from precedent. Do not seek out reference patterns to imitate.

### Acceptance Criteria

- New homepage renders at `prototypes/homepage-v2/` via isolated Vite dev server.
- Carousel functions identically (5 slides, keyboard nav, swipe).
- Stepper sits at the bottom of the carousel viewport, numerals only with single contextual label.
- Net visible box count ≤ 6.
- Hero column uses size+weight hierarchy, not opacity tiers.
- Axis colors visible as accent in hero column.
- No bilingual label stacking anywhere.
- No border-radius + inset-stripe collisions.
- Both columns share horizontal padding token.
