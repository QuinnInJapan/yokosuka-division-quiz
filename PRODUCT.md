# Product

## Register

brand

## Users

Yokosuka City Hall employees exploring internal transfers. Japanese-speaking, mixed ages and tech comfort, taking the quiz from a desk during a break or between tasks. They already work for the city — they want a low-stakes, slightly fun lens on which of the 102 課 might suit them next. Not job-seekers, not the general public, not a recruiting tool.

## Product Purpose

A 20-question, 5-axis personality quiz that maps a staff member to one of 32 archetype types and ranks all 102 city departments by fit. Internal-only, made for fun by colleagues for colleagues. Success = staff actually finish it, share results with coworkers, and learn something non-obvious about a department they hadn't considered. The result must feel like it was made by humans inside the building, not by a vendor.

## Brand Personality

Three words: **playful, knowing, warm**.

Voice is a smart colleague making a quiz for the office — informed about the work, willing to be a little cheeky about bureaucratic quirks, but never dismissive of the job itself. The information underneath is real and useful; the wrapper is light. Encouraging on results, never preachy, never corporate-HR.

## Anti-references

- **Japanese-government-default aesthetics.** No 役所 PDF energy. No navy + white + serif headers + dense bordered tables. No 横長 banners with cherry blossoms. No mascots-by-committee. The whole point is that this does NOT look like the org that made it.
- **Generic SaaS landing.** Tinted gradient hero, three feature cards, "Get started for free." Has nothing to do with this surface.
- **Buzzfeed quiz chaos.** Loud reds, confetti, all-caps clickbait. Playful does not mean carnival.
- **Stiff enterprise dashboard.** This is not a tool. No KPI tiles, no chart-heavy result page that feels like a performance review.

## Design Principles

1. **Internal warmth, not external polish.** This is a hallway joke that turned into a quiz, not a product launch. Choices should feel personal and slightly handmade — typography that has a voice, color that commits, copy with a colleague's tone. Avoid the smooth, anonymous finish of agency work.
2. **The quiz is the hero, results are the reward.** Welcome and questions should feel light and fast. The result screen is where craft pays off — the type name, archetype description, axis readout, and department ranking are the artifact people screenshot and send to a coworker.
3. **Take the content seriously, take the format playfully.** The 32 archetypes and 102 departments are real, researched, useful. The frame around them — labels, microcopy, transitions, visual jokes — can have personality. Substance stays accurate; tone stays light.
4. **Engage on results, don't lecture.** Results screen rewards finishing: a name worth remembering, a description that flatters without flattening, a ranked list that invites curiosity about other departments. Encouraging, never coaching.
5. **Commit to a look.** Avoid the safe-default civic palette already in `src/styles/01-tokens.css` (multi-hue pills + neutral gray bg) — that's the training-data reflex for this category. Pick a single committed color strategy and a typographic voice that no one would mistake for a default template.

## Accessibility & Inclusion

- WCAG AA contrast on body text and interactive controls. Not a hard target beyond that.
- Older staff are in the audience but not the priority — don't optimize the entire design around them, but keep base body type ≥16px, tap targets ≥44px, and avoid gray-on-gray.
- Japanese-first. All copy, all typography decisions, all line-length judgments assume Japanese as the primary script. Latin/numerals are secondary.
- No reduced-motion-hostile choices: any animation must degrade to a static state under `prefers-reduced-motion`.
