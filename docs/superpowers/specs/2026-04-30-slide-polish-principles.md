# Slide Polish Principles

The five preview slides (Slide2Input → Slide6Example) inside `src/components/HomepageCarousel/slides/` were verbatim-ported from an earlier prototype. The outer chrome around them was rebuilt from scratch with restraint and clarity. The slides need the same treatment so they don't feel like they're from a different design system.

These ten principles guide that polish. They are not negotiable — if you can't satisfy a principle, document the trade-off.

---

## 1. One idea per slide

Each slide answers ONE question the user is forming as they read down the carousel:

| Slide | Question it answers |
|-------|----------------------|
| 1 (Input) | "What kind of questions am I going to answer?" |
| 2 (Scoring) | "How do my answers turn into a profile?" |
| 3 (Comparison) | "How does my profile get compared to 103 divisions?" |
| 4 (Result) | "What do I see at the end?" |
| 5 (Example) | "What does a real result look like?" |

If a slide tries to teach two things, split or simplify. **Test:** state the slide's purpose in 6 words or fewer.

## 2. Show, don't describe — use real data

Real division names from `divisions.json` (103 of them). Real axis labels from `src/data/axes.ts`. Real questions from `questions.json` (20). No placeholder strings. No "Department X". The user should believe they're looking at a snapshot of the real product, not a marketing illustration.

**Test:** every visible number, name, or sentence could be replaced with the actual quiz value with no design change required.

## 3. One focal point per slide

The largest element wins the eye; everything else supports. Currently slides have ~5 same-weight cards competing. Pick one focal element per slide:

- Slide 1: a vivid example question (the user pictures themselves answering it)
- Slide 2: the scoring transformation (input → axis score)
- Slide 3: the comparison bar / matching visual
- Slide 4: the three result components rendered cleanly
- Slide 5: the archetype + top-3 ranking

Demote everything else to supporting role (smaller, lower contrast, or removed).

## 4. Echo the outer chrome's restraint

The outer chrome (`Welcome.tsx` + `Stepper.tsx`) uses:
- Hairline borders (1px, `var(--border)`)
- No heavy shadows
- Indigo (`var(--hall-indigo)`) as anchor; axis colors as accents
- Whitespace doing real work (no filled-pixel density)
- ~3 visible boxes total

Slides currently use heavier shadows (`var(--card-shadow)`), 2px borders, and dense card grids. Match the outer chrome's register: 1px borders, no shadow, indigo focus, axis tint backgrounds only on axis-tagged content.

## 5. Demonstrate, then label

For interactive demos (click axis A → see example question for A), the *interaction* teaches. Labels should describe what just happened, not pre-explain.

- Don't write "Click an axis to see an example."
- Do style the rows as obvious buttons (cursor: pointer + hover state) — the affordance carries the message.

If you can remove a label by improving an affordance, do.

## 6. Type discipline — same scale across all 5 slides

Pick exactly these and apply them everywhere:

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| Slide title | 32px | 800 (black) | h2 at top of each slide (already meta-format: STEP 0N · 入力) |
| Section label | 14px | 700 caps | "回答内容", "質問の例" sub-section labels |
| Body | 16px | 400 | sentences, descriptions, options |
| Data number | 40px | 800 tabular | scores, percentages, counts |
| Caption | 12px | 400 | "全20問・約3分", footnotes |

Each slide currently invents its own scale. Standardize.

## 7. Color carries meaning, never decoration

- Axis colors (`--A`, `--B`, `--C`, `--D`, `--E` and their `-tint` variants) appear ONLY when the content is about that axis. A row labeled "B" gets B's tint. A generic body element does not.
- Indigo (`--hall-indigo`) appears only on active/focus/CTA states.
- Everything else is grayscale (`--text`, `--text-sec`, `--sub`, `--border`).

Currently slides scatter axis colors as decorative accents on non-axis content. That kills the color-as-signal contract — a user can no longer trust that "red means axis A."

## 8. Animation as instruction, not flourish

Motion shows causation. Use it when something CHANGED:
- Answer changes → score bar slides
- Comparison runs → match percentage fills
- New slide enters → optional gentle slide-in (subtle)

Don't use motion for pure decoration. Always honor `prefers-reduced-motion: reduce` (slides should still teach the same lesson without animation).

## 9. Story arc must be explicit

Reading just the 5 slide titles + sub lines should tell the whole story:
- 入力 → 採点 → 比較 → 結果 → 例

If a slide title and sub don't advance the arc, rewrite them. The slide is not a digression.

## 10. Mobile collapse is a first-class layout

Design at 1280px AND at 600px from the start. The right column collapses to full-width on mobile. Each slide must:

- Stack vertically without overflow
- Have at most one column of content at <900px
- Keep all text legible (no shrinking below 14px body)
- Preserve the focal-point hierarchy from #3

The outer chrome already does this (Welcome.module.css media queries). Slides must match.

---

## Anti-patterns from the outer-chrome rebuild that also apply to slides

These were forbidden when rebuilding the chrome. They apply equally inside the slides:

1. Opacity-only hierarchy (use size + weight instead)
2. Border-radius + inset-stripe collision (no `box-shadow: inset Npx 0 0` on rounded buttons)
3. Bilingual stacked labels (one language per element, not pairs everywhere)
4. Box jungle (cards only where affordance demands; whitespace does the rest)
5. Decorative use of impressive numbers (numbers earn anchor weight)
6. Inconsistent column padding (use one padding token per side)
7. Heavy chrome on navigation/control elements
8. Wasted axis colors (5 colors reserved for 5 axes — use them for that purpose only)
9. Section titles competing with content (one h2 per slide)

---

## Tests to preserve

The following test IDs from `tests/e2e/homepage.spec.ts` MUST keep working after the polish pass:

- `axis-row-{A..E}` (Slide 1)
- `s2-example-q` (Slide 1)
- `s3-q-{0..3}`, `s3-right-q` (Slide 2)
- `s4-bar-{A..E}`, `s4-pct` (Slide 3 — note: this one is checked in the worktree's old e2e; the current root e2e doesn't reference these but the data-testid contract should be honored for future tests)
- The slide rendering data-testids `carousel-slide-{1..5}` are owned by HomepageCarousel.tsx and don't need to be added by slides

If you remove an interactive element that had a testid, remove it cleanly — don't keep an empty stub just to satisfy a test that no longer exists.
