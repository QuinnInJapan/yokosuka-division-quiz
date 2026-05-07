# Results Page — Color Audit Reframe (User Tasks)

**Date:** 2026-05-07
**Replaces framing of:** `2026-05-07-results-color-review.md`
**Author:** Color/UI re-review pass

Earlier audit was rejected for being aesthetics-only. This doc reframes findings around what users actually do on Results, names a failure mode per task, then re-ranks. No measurements, no fix proposals — scope/priority only.

## User tasks on Results

In rough scroll order. Durations are dwell estimates, not stopwatch.

1. **See which type they got** (~3–8s). Land on hero, read the kanji name + 型 suffix, register the Sukarin character, get gist of the 1-line desc.
2. **Decide if the type "feels right"** (~5–15s). Skim trait carousel hero word + desc; gut-check against self-image. This is the share/screenshot moment.
3. **Skim the 5-axis trait profile** (~10–30s). Click through trait bars or carousel dots; see which pole won on each axis and by how much.
4. **Scan the ranked division list and orient on top match** (~5–10s). Look at row 1, read the fit %, register dept + name.
5. **Browse the list and pick a division to inspect** (~20–60s, repeated). Move down rows, click one, read detail panel, return to list, click another. This is the longest-dwell task.
6. **Read the fit % at a glance for the selected division** (~2s, every selection). Eye lands on FitRing, decodes "is this a high or low match."
7. **Read the per-axis comparison narrative** (~10–20s). Parse "ほぼ一致 / 近い / やや違い / 大きな違い" badges, segment bars, and the prose tier label.
8. **Export the result as PNG to share / save** (~3s click, then off-app review on phone roll, in chat, possibly printed). Whatever was on-screen has to survive a screenshot context.
9. **Decide whether to retake** (~2s). Eye finds the secondary CTA without confusing it for export.

## Failure modes per task

1. **See type** — 型 suffix on dark hero gradient hits the lightest gradient stop with low-alpha white; user momentarily reads name without the type-suffix grammar, or it disappears in screenshots compressed for chat. Hero blob can also overlap text on narrow viewports if blob hue is similar-luminance to gradient (no dark/light separation).
2. **Decide if type feels right** — no color failure mode; this is copy-driven. (Drop from color scope.)
3. **Skim 5-axis trait profile** — user can't tell which axis is currently expanded in the carousel because TraitBar active-state contrast (faint blue tint over cream) is too low against the inactive-row background; user keeps clicking the same axis or loses place. Also: focus ring on the active TraitBar can be invisible if it inherits an indigo ring color that competes with the indigo active tint.
4. **Scan list + orient on top match** — fit % color in row 1 (bright green) reads as "decoration" rather than "tier signal" because the same green appears in chapter mark, in band background, and in axis-C bars elsewhere; user doesn't register the % as a ranked datum. Also: list bg sits washed over mint, so row 1 doesn't visually pop.
5. **Browse list + pick** — user can't see which row is currently selected (this is the original user complaint that drove the audit). Active-row tint is in a different hue family from the trait-carousel active-row, so the user can't transfer the affordance from section 2 to section 3.
6. **Read fit % at glance** — fit ring uses pure-color encoding (green = top, blue = high, orange = mid, red = low). Fails for: red/green colorblind users, grayscale PNG print, low-brightness phones in sun. Numeric % is present but small; ring carries the "tier" signal alone.
7. **Read comparison narrative** — tier label color (`tierEmph`) inherits from `fitColor`, which means the same green that just labeled the top-list row now labels the prose; reader may double-count or, conversely, the prose green blurs into the mint band background. Per-axis bucket badges (`match/close/some/wide`) need to be distinguishable at a glance; if they share hue family with axis colors they get lost.
8. **Export PNG to share** — exported screenshot may be: viewed in dark-mode chat (alpha-on-dark suffix breaks), printed B&W (fit ring loses tier meaning, axis bars become indistinguishable), forwarded to colorblind friend. Forced-colors / high-contrast OS mode silently strips backgrounds; if the page leans on band bg color to separate sections, the export rendered in that mode flattens.
9. **Decide retake** — Actions band cream and Traits band cream are near-identical, so the Actions section doesn't read as a distinct "you're done, here are exits" zone. User may scroll past expecting more content. (Mild — a real-but-small task failure.)

## Findings worth keeping vs dropping

Each maps to (or is dropped from) the task list above.

- **F1 — section temperature bounces.** **DROP.** No user task is "perceive the page's temperature progression." Mint→cream isn't pleasant but doesn't break a task. Reviewer language: aesthetics-only.
- **F2 — mint band hardcodes axis-C.** **KEEP, weak.** Maps to task 4 ("scan list, orient on top"): axis-C green echoing in band bg + chapter mark + fit-ring-top-tier means the % loses its "ranked datum" weight. Real but indirect.
- **F3 — active-state language inconsistent (TraitBar vs MatchList).** **KEEP, strong.** Maps to task 5 (the original complaint) and task 3. Two selection patterns in two hue families = user re-learns "which row is selected" between sections.
- **F4 — `fitColor` reuses axis tokens.** **KEEP, strong.** Maps to task 6. Cross-channel ambiguity: a 60% blue ring is the same blue as B-axis bars; user can't tell what the color "means."
- **F5 — hero blob hue ≠ gradient temperature.** **DROP.** No user task fails. Closest candidate is task 1 (blob/text overlap on narrow screens) — that's a layout/contrast issue captured under new findings, not the temperature heuristic itself. The "warm gradient with cool blob" dissonance is aesthetic.
- **F6 — cream vs hero-accent collision (~5 ΔE).** **DROP.** Maps weakly to task 9 but the failure is "user might not notice section change" — reviewer would call this cosmetic, not blocking. Nine-task list survives without this.
- **F7 — list bg paler than detail card.** **KEEP, medium.** Maps to task 4 + task 5. List is where users actually choose; surface hierarchy implying it's secondary measurably hurts the scan.
- **F8 — 型 suffix contrast borderline.** **KEEP, medium.** Maps to task 1 + task 8. Borderline-AA on hero gradient breaks for some users immediately and for export-to-print universally.
- **F9 — match chapter mark green is one-off.** **DROP as standalone.** Already absorbed into F2's user-impact framing. Standalone "this green is unique on the page" is aesthetics.
- **F10 — no band seams.** **DROP.** No user task is "perceive band boundaries." This is page-rhythm aesthetics. If sections aren't distinguishable, that's a separate hierarchy bug; bare seams aren't the cure or the cause.

## New findings the old doc missed

Tied to user tasks; flagged by reviewer as gaps.

- **N1 — Focus ring may be invisible on dark hero.** Task 1 + keyboard nav. If focus ring color is the brand indigo or indigo-tint, it disappears on the indigo-family hero gradient. Keyboard users tabbing to Sukarin card or hero CTAs lose track of focus.
- **N2 — Fit ring is color-only encoding.** Task 6, task 8. Tier (top/high/mid/low) carried entirely by hue. No shape, no icon, no fill-pattern, no label change. Fails colorblind, grayscale print, sunlight.
- **N3 — Forced-colors / high-contrast OS mode silence.** Task 8 export, plus Windows high-contrast users on the live page. Page never declares forced-colors handling; band backgrounds, fit ring, comparison-bar segments all collapse to system defaults silently. Selected-row indicator can vanish.
- **N4 — Hero blob/text overlap risk.** Task 1. Blobs are positioned by absolute %s with no awareness of the SukarinCard text bounds; on narrow viewports a blob can sit under the type name. If blob hue is mid-luminance against the gradient, the kanji edge gets eaten. Captures the "real" user-impact slice of old F5.
- **N5 — Export PNG grayscale-print legibility.** Task 8. ComparisonBars rely on per-axis hue to tell the 5 axes apart in the segment colors and dark markers; in grayscale, all 5 axes collapse to similar mid-grays. FitRing tier hue collapses to one of two grays. The PNG-export feature is explicitly built into the page, so this is a first-class task.

## Hypothesis ranking

Sorted by severity × frequency. Severity: blocking / degrading / cosmetic. Frequency: every-session / occasional / edge-case. Confidence: high / medium / low that the failure mode is real for users.

| ID | User task | Severity | Frequency | Confidence |
|----|-----------|----------|-----------|------------|
| F3 | 5 (browse + pick), 3 (skim traits) | blocking | every-session | high — original user complaint |
| F4 | 6 (read fit at glance) | degrading | every-session | high — cross-channel hue collision is structural |
| N2 | 6 (fit at glance), 8 (export) | degrading | every-session for ~8% pop. (CVD), every-session for grayscale exports | high |
| F7 | 4 (orient top match), 5 (browse + pick) | degrading | every-session | medium — surface hierarchy is real but users adapt |
| F2 | 4 (orient top match) | degrading | every-session | medium — semantic conflation is plausible but indirect |
| F8 | 1 (see type), 8 (export) | degrading | every-session for export users; occasional on-screen | medium |
| N1 | 1 (see type), keyboard nav | degrading | every-session for keyboard users (edge-case-of-population) | medium |
| N4 | 1 (see type) | degrading | occasional (narrow viewports + specific archetype/blob combos) | medium |
| N5 | 8 (export, grayscale-printed) | degrading | occasional (subset of export users) | medium |
| N3 | 8 (export), forced-colors OS users | degrading | edge-case (forced-colors users) | low — real concern, but small population |
| F1 | — | cosmetic | n/a | drop |
| F5 | — | cosmetic (real piece extracted as N4) | n/a | drop |
| F6 | 9 weakly | cosmetic | n/a | drop |
| F9 | absorbed into F2 | cosmetic | n/a | drop |
| F10 | — | cosmetic | n/a | drop |

**Top tier (blocking + every-session):** F3.
**Second tier (degrading + every-session):** F4, N2, F7, F2, F8.
**Third tier (degrading + occasional / edge-case):** N1, N4, N5, N3.
**Drops:** F1, F5, F6, F9, F10.
