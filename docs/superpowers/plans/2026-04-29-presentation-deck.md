# How-It-Works Presentation Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 6-slide, 5-minute Japanese-only HTML deck explaining how the Yokosuka City Hall department-type quiz works, for presentation to 人事課長.

**Architecture:** Single self-contained HTML file at `presentations/how-it-works/index.html` using the `huashu-design` skill's slide-deck Starter Component (1920×1080 fixed stage, scale-to-fit, keyboard-driven nav). Tight visual match to the React app — palette, type, and component vocabulary copied from `src/styles/tokens.css`. Real app screenshots used for slides 2 + 5; everything else is mocked in-deck. MBTI lineage acknowledged on slide 5.

**Tech Stack:** HTML5, vanilla CSS (matching app tokens), inline JS for nav. Optional React+Babel via CDN if huashu-design pattern requires. Playwright for click-test verification. Source spec: `docs/superpowers/specs/2026-04-29-presentation-design.md`.

---

## Pre-flight

Before Task 1, the engineer must:
1. **Invoke the `huashu-design` skill.** It loads slide-deck Starter Components (幻灯片外壳), Speaker Notes pattern, Tweaks variant system, Playwright verification workflow, and anti-AI-slop checklist. The skill defines HOW to build the deck shell. This plan defines WHAT content goes in.
2. **Read the spec** at `docs/superpowers/specs/2026-04-29-presentation-design.md`. The slide content, palette, type scale, and visual decisions live there. This plan is the bite-sized execution path; the spec is the source of truth for design decisions.
3. **Note the live demo is OUT OF SCOPE.** Slide 6 ends with a "▶ ライブデモへ" CTA, but the demo itself is a separate post-deck activity — do not attempt to embed the live app into the deck.

---

## File Structure

| Path | Purpose |
|---|---|
| `presentations/how-it-works/index.html` | Single-file deck (source = artifact). Contains all slides, styles, nav. |
| `presentations/how-it-works/screenshots/welcome.png` | App Welcome screen capture (used on slide 1 background hint and/or slide 2/5 references) |
| `presentations/how-it-works/screenshots/quiz.png` | App Quiz screen capture (one question state, used on slide 2) |
| `presentations/how-it-works/screenshots/results.png` | App Results screen capture (used on slide 5) |
| `presentations/how-it-works/README.md` | One-paragraph readme: how to open, how to present, exit-presentation key |

The `src/` directory is not modified.

---

## Task 1: Initialize presentation directory

**Files:**
- Create: `presentations/how-it-works/`
- Create: `presentations/how-it-works/screenshots/` (empty for now)
- Create: `presentations/how-it-works/README.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p presentations/how-it-works/screenshots
```

- [ ] **Step 2: Write README**

Create `presentations/how-it-works/README.md` with this content:

```markdown
# How-It-Works Deck — 部署タイプ診断

5-minute Japanese deck explaining how the quiz works, for 人事課長.

## Open

Open `index.html` in any modern browser (Chrome/Safari/Firefox/Edge).

## Present

- **Right arrow / Space:** next slide
- **Left arrow:** previous slide
- **F11 (or browser fullscreen):** projector mode

## Source spec

`docs/superpowers/specs/2026-04-29-presentation-design.md`
```

- [ ] **Step 3: Commit**

```bash
git add presentations/how-it-works/README.md
git commit -m "chore(presentation): scaffold how-it-works deck directory"
```

---

## Task 2: Build deck shell with stage + navigation

**Files:**
- Create: `presentations/how-it-works/index.html`

**What this task produces:** A working but empty deck — 6 placeholder slides, keyboard navigation works, page indicator updates, fits projector at 1920×1080 with scale-to-fit for smaller screens.

- [ ] **Step 1: Write the deck shell HTML**

Create `presentations/how-it-works/index.html`. Use the huashu-design 1920×1080 stage convention:

```html
<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<title>部署タイプ診断 — その仕組み</title>
<style>
  :root {
    /* Palette — copied from src/styles/tokens.css */
    --A: #C0392B; --A-mid: #E8534A; --A-tint: #FFF0EE;
    --B: #2E6DB4; --B-mid: #4A90D9; --B-tint: #EBF3FC;
    --C: #1E7345; --C-mid: #4CAF7D; --C-tint: #ECF8F1;
    --D: #7B3F9E; --D-mid: #9B59B6; --D-tint: #F5EDF8;
    --E: #9C6310; --E-mid: #F5A623; --E-tint: #FFF6E6;
    --hall-indigo: #1C2340;
    --hall-indigo-hover: #2A3558;
    --bg: #F0F2F7;
    --card: #FFFFFF;
    --text: var(--hall-indigo);
    --text-sec: #4A5568;
    --sub: #6B7280;
    --border: #E4E7ED;
    --border-light: #F0F2F7;
    --card-shadow: 0 2px 20px rgba(0,0,0,0.08);
    --card-r: 16px;

    --font: 'Hiragino Sans','Hiragino Kaku Gothic ProN','BIZ UDPGothic',
            Meiryo,-apple-system,sans-serif;
  }
  html, body {
    margin: 0; padding: 0;
    background: #000;
    overflow: hidden;
    font-family: var(--font);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }
  * { box-sizing: border-box; }

  /* 1920x1080 stage, scale-to-fit */
  .stage {
    position: fixed;
    top: 50%; left: 50%;
    width: 1920px; height: 1080px;
    transform-origin: center center;
    background: var(--bg);
    overflow: hidden;
  }

  .slide {
    position: absolute; inset: 0;
    padding: 96px;
    display: none;
    flex-direction: column;
  }
  .slide.active { display: flex; }

  .footer {
    position: absolute;
    bottom: 32px; left: 96px; right: 96px;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    color: var(--sub);
  }
</style>
</head>
<body>
  <div class="stage" id="stage">
    <section class="slide active" data-slide="1"><h1>S1</h1></section>
    <section class="slide" data-slide="2"><h1>S2</h1></section>
    <section class="slide" data-slide="3"><h1>S3</h1></section>
    <section class="slide" data-slide="4"><h1>S4</h1></section>
    <section class="slide" data-slide="5"><h1>S5</h1></section>
    <section class="slide" data-slide="6"><h1>S6</h1></section>
    <div class="footer">
      <span id="footer-section">部署タイプ診断 — その仕組み</span>
      <span id="footer-page">1 / 6</span>
    </div>
  </div>
<script>
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  let idx = 0;
  const pageEl = document.getElementById('footer-page');

  function show(n) {
    idx = Math.max(0, Math.min(total - 1, n));
    slides.forEach((el, i) => el.classList.toggle('active', i === idx));
    pageEl.textContent = `${idx + 1} / ${total}`;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); show(idx + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
  });

  // Scale-to-fit
  const stage = document.getElementById('stage');
  function fit() {
    const sx = window.innerWidth / 1920;
    const sy = window.innerHeight / 1080;
    const s = Math.min(sx, sy);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  window.addEventListener('resize', fit);
  fit();
</script>
</body>
</html>
```

- [ ] **Step 2: Open in browser and verify navigation**

```bash
open presentations/how-it-works/index.html
```

Verify:
- 6 placeholder slides are present (S1–S6 visible by pressing arrows)
- Right arrow / Space advances; left arrow goes back
- Page indicator updates `1 / 6` → `2 / 6` etc.
- Stage scales to window — no scrollbars
- Background is `#F0F2F7` (light bluish-grey, app bg)

- [ ] **Step 3: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add deck shell with stage and keyboard nav"
```

---

## Task 3: Capture app screenshots

**Files:**
- Create: `presentations/how-it-works/screenshots/welcome.png`
- Create: `presentations/how-it-works/screenshots/quiz.png`
- Create: `presentations/how-it-works/screenshots/results.png`

**Approach:** Run the dev server, navigate manually through Welcome → first quiz question → fully-completed Results. Capture each screen at 1920px width via the screenshot skill or browser devtools.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Note the URL printed (typically `http://localhost:5173`). Leave running.

- [ ] **Step 2: Capture Welcome screen**

Open `http://localhost:5173` in a browser sized to 1920×1080. Use the `screenshot` skill or manual capture:

```bash
# If using the screenshot skill via Playwright
# (consult skill: screenshot)
```

Save to `presentations/how-it-works/screenshots/welcome.png`. Frame the capture to show the Welcome composition cleanly (no browser chrome).

- [ ] **Step 3: Capture Quiz screen (one question visible)**

Click 開始 to enter the quiz. Capture the first question card (A1 — the 介護申請の窓口対応 scenario).

Save to `presentations/how-it-works/screenshots/quiz.png`.

- [ ] **Step 4: Capture Results screen**

Complete the quiz with any answers (any combination is fine — content of the result doesn't matter for the deck, only the screen layout). Capture the full Results screen showing TypeReveal + match list.

Save to `presentations/how-it-works/screenshots/results.png`.

- [ ] **Step 5: Stop dev server and commit**

Stop the dev server (Ctrl+C in its terminal).

```bash
git add presentations/how-it-works/screenshots/*.png
git commit -m "feat(presentation): add app screenshot captures for deck"
```

---

## Task 4: Slide 1 — タイトル

**Files:**
- Modify: `presentations/how-it-works/index.html` (replace `<section class="slide active" data-slide="1">` block)

- [ ] **Step 1: Add Slide 1 styles**

Inside the existing `<style>` block in `index.html`, append:

```css
  /* ============ Slide 1: Title ============ */
  .s1 {
    align-items: flex-start;
    justify-content: center;
  }
  .s1-eyebrow {
    font-size: 24px;
    font-weight: 500;
    color: var(--text-sec);
    letter-spacing: 0.04em;
    margin-bottom: 24px;
  }
  .s1-title {
    font-size: 96px;
    font-weight: 800;
    line-height: 1.15;
    color: var(--hall-indigo);
    letter-spacing: -0.01em;
    margin: 0 0 32px;
  }
  .s1-subtitle {
    font-size: 28px;
    font-weight: 400;
    color: var(--text-sec);
    line-height: 1.5;
    max-width: 1100px;
  }
  .s1-axis-bar {
    margin-top: 64px;
    display: flex;
    gap: 0;
    height: 8px;
    width: 480px;
  }
  .s1-axis-bar > span { flex: 1; }
  .s1-axis-bar > span:nth-child(1) { background: var(--A-mid); }
  .s1-axis-bar > span:nth-child(2) { background: var(--B-mid); }
  .s1-axis-bar > span:nth-child(3) { background: var(--C-mid); }
  .s1-axis-bar > span:nth-child(4) { background: var(--D-mid); }
  .s1-axis-bar > span:nth-child(5) { background: var(--E-mid); }
```

- [ ] **Step 2: Replace Slide 1 markup**

Replace `<section class="slide active" data-slide="1"><h1>S1</h1></section>` with:

```html
<section class="slide s1 active" data-slide="1">
  <div class="s1-eyebrow">横須賀市役所 内部ツール</div>
  <h1 class="s1-title">部署タイプ診断<br/>— その仕組み</h1>
  <div class="s1-subtitle">5つの軸 × 20問で職員のタイプを判定し、<br/>全103部署を適合度順にランクします。</div>
  <div class="s1-axis-bar"><span></span><span></span><span></span><span></span><span></span></div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload `index.html`. Slide 1 should show:
- Indigo title (96px, bold) "部署タイプ診断 — その仕組み"
- Grey subtitle below it
- 5-color stripe (red/blue/green/purple/orange) below the subtitle, each axis color visible

Press right arrow — should advance to placeholder S2.

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 1 — title"
```

---

## Task 5: Slide 2 — 入力

**Files:**
- Modify: `presentations/how-it-works/index.html`

**Content rule:** Axis labels and the example scenario come verbatim from the app data (`src/data/axes.ts` and `src/data/questions.ts`). Do not paraphrase.

- [ ] **Step 1: Add Slide 2 styles**

Append to `<style>`:

```css
  /* ============ Shared: section header with axis stripe ============ */
  .sec-header {
    margin-bottom: 48px;
  }
  .sec-eyebrow {
    font-size: 18px;
    font-weight: 500;
    color: var(--sub);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .sec-title {
    font-size: 56px;
    font-weight: 700;
    line-height: 1.2;
    margin: 0 0 16px;
    color: var(--hall-indigo);
  }
  .sec-stripe {
    height: 8px;
    width: 96px;
    background: var(--hall-indigo);
  }

  /* ============ Slide 2: Input ============ */
  .s2-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    flex: 1;
  }
  .s2-axes { display: flex; flex-direction: column; gap: 16px; }
  .s2-axis-row {
    display: flex; align-items: center; gap: 20px;
    padding: 16px 20px;
    background: var(--card);
    border-radius: 12px;
    box-shadow: var(--card-shadow);
  }
  .s2-axis-key {
    width: 8px; height: 56px; border-radius: 4px;
  }
  .s2-axis-key.A { background: var(--A-mid); }
  .s2-axis-key.B { background: var(--B-mid); }
  .s2-axis-key.C { background: var(--C-mid); }
  .s2-axis-key.D { background: var(--D-mid); }
  .s2-axis-key.E { background: var(--E-mid); }
  .s2-axis-label { flex: 1; }
  .s2-axis-name { font-size: 22px; font-weight: 700; color: var(--hall-indigo); margin-bottom: 4px; }
  .s2-axis-poles { font-size: 16px; color: var(--text-sec); }

  .s2-example {
    background: var(--card);
    border-radius: var(--card-r);
    padding: 32px;
    box-shadow: var(--card-shadow);
    display: flex; flex-direction: column;
  }
  .s2-example-label {
    font-size: 14px; font-weight: 500; letter-spacing: 0.08em;
    color: var(--A); text-transform: uppercase; margin-bottom: 12px;
  }
  .s2-example-q {
    font-size: 22px; line-height: 1.6; color: var(--text);
    margin-bottom: 24px;
  }
  .s2-options {
    display: flex; flex-direction: column; gap: 8px;
  }
  .s2-option {
    padding: 12px 16px; border: 1px solid var(--border);
    border-radius: 8px; font-size: 16px; color: var(--text-sec);
  }
  .s2-foot {
    margin-top: 32px;
    font-size: 18px;
    color: var(--sub);
    text-align: center;
  }
```

- [ ] **Step 2: Replace Slide 2 markup**

Replace `<section class="slide" data-slide="2"><h1>S2</h1></section>` with:

```html
<section class="slide" data-slide="2">
  <header class="sec-header">
    <div class="sec-eyebrow">入力 / Input</div>
    <h2 class="sec-title">5つの軸 × 20の質問</h2>
    <div class="sec-stripe"></div>
  </header>
  <div class="s2-grid">
    <div class="s2-axes">
      <div class="s2-axis-row">
        <div class="s2-axis-key A"></div>
        <div class="s2-axis-label">
          <div class="s2-axis-name">人との関わり方</div>
          <div class="s2-axis-poles">制度・仕組み ⇄ 市民対話</div>
        </div>
      </div>
      <div class="s2-axis-row">
        <div class="s2-axis-key B"></div>
        <div class="s2-axis-label">
          <div class="s2-axis-name">仕事の進め方</div>
          <div class="s2-axis-poles">政策立案 ⇄ 現場対応</div>
        </div>
      </div>
      <div class="s2-axis-row">
        <div class="s2-axis-key C"></div>
        <div class="s2-axis-label">
          <div class="s2-axis-name">担う役割</div>
          <div class="s2-axis-poles">ルール管理 ⇄ 市民支援</div>
        </div>
      </div>
      <div class="s2-axis-row">
        <div class="s2-axis-key D"></div>
        <div class="s2-axis-label">
          <div class="s2-axis-name">変化への姿勢</div>
          <div class="s2-axis-poles">革新推進 ⇄ 安定運営</div>
        </div>
      </div>
      <div class="s2-axis-row">
        <div class="s2-axis-key E"></div>
        <div class="s2-axis-label">
          <div class="s2-axis-name">知識のスタイル</div>
          <div class="s2-axis-poles">専門追求 ⇄ 幅広対応</div>
        </div>
      </div>
    </div>
    <div class="s2-example">
      <div class="s2-example-label">質問の例 — A1</div>
      <p class="s2-example-q">高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。</p>
      <div class="s2-options">
        <div class="s2-option">自分には向いていないと思う</div>
        <div class="s2-option">あまり気が乗らないが、こなせる</div>
        <div class="s2-option">どちらとも言えない</div>
        <div class="s2-option">やりがいを感じながら取り組める</div>
        <div class="s2-option">まさに自分が輝ける場面</div>
      </div>
      <div class="s2-foot">全20問・約3分</div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload, advance to Slide 2. Verify:
- Header reads `入力 / Input — 5つの軸 × 20の質問`
- Left column: 5 axis rows, each with the correct axis-color stripe and label/poles
- Right column: scenario card with the A1 介護申請 question text and 5 options
- Footer notation `全20問・約3分` visible

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 2 — input (5 axes + example question)"
```

---

## Task 6: Slide 3 — 採点

**Files:**
- Modify: `presentations/how-it-works/index.html`

- [ ] **Step 1: Add Slide 3 styles**

Append to `<style>`:

```css
  /* ============ Slide 3: Scoring ============ */
  .s3-body { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; flex: 1; align-items: center; }
  .s3-diagram { display: flex; flex-direction: column; gap: 12px; }
  .s3-q {
    display: flex; align-items: center; gap: 16px;
    background: var(--A-tint); border-left: 4px solid var(--A-mid);
    padding: 12px 16px; border-radius: 8px;
    font-size: 18px; color: var(--text);
  }
  .s3-q .label { font-weight: 700; min-width: 48px; color: var(--A); }
  .s3-q .val { font-family: ui-monospace, monospace; font-weight: 700; min-width: 56px; text-align: right; }
  .s3-q.reversed { background: #fff; border-left-style: dashed; }
  .s3-q.reversed::after {
    content: '反転'; margin-left: auto;
    font-size: 12px; color: var(--A); padding: 2px 8px;
    border: 1px solid var(--A); border-radius: 4px;
  }
  .s3-arrow {
    text-align: center; font-size: 24px; color: var(--sub); margin: 8px 0;
  }
  .s3-result {
    background: var(--A); color: white;
    border-radius: 12px; padding: 16px 20px;
    font-size: 22px; font-weight: 700;
    display: flex; justify-content: space-between; align-items: center;
  }
  .s3-result .num { font-size: 36px; font-weight: 800; font-family: ui-monospace, monospace; }

  .s3-explain { font-size: 22px; line-height: 1.7; color: var(--text); }
  .s3-explain h3 { font-size: 28px; margin: 0 0 16px; color: var(--hall-indigo); }
  .s3-explain ul { margin: 0 0 24px; padding-left: 24px; }
  .s3-explain li { margin-bottom: 8px; }
  .s3-eq {
    margin-top: 24px;
    padding: 20px;
    background: var(--card);
    border-radius: 12px; box-shadow: var(--card-shadow);
    font-size: 20px; line-height: 1.6;
  }
  .s3-eq code { font-family: ui-monospace, monospace; font-weight: 700; color: var(--A); }
```

- [ ] **Step 2: Replace Slide 3 markup**

Replace placeholder S3 with:

```html
<section class="slide" data-slide="3">
  <header class="sec-header">
    <div class="sec-eyebrow">採点 / Scoring</div>
    <h2 class="sec-title">回答が軸スコアに変わる</h2>
    <div class="sec-stripe" style="background: var(--A);"></div>
  </header>
  <div class="s3-body">
    <div class="s3-diagram">
      <div class="s3-q"><span class="label">A1</span><span>窓口で介護申請を支援</span><span class="val">+2</span></div>
      <div class="s3-q"><span class="label">A2</span><span>地域サークルで対話</span><span class="val">+1</span></div>
      <div class="s3-q reversed"><span class="label">A3</span><span>業務フローを設計</span><span class="val">−1</span></div>
      <div class="s3-q reversed"><span class="label">A4</span><span>財政データを分析</span><span class="val">+0</span></div>
      <div class="s3-arrow">↓ 平均</div>
      <div class="s3-result"><span>A軸スコア</span><span class="num">+0.5</span></div>
    </div>
    <div class="s3-explain">
      <h3>仕組み</h3>
      <ul>
        <li>1つの質問は、1つの軸に寄与</li>
        <li>5段階の回答 → 数値 (−2, −1, 0, +1, +2)</li>
        <li>「反転質問」は符号を反転してから集計</li>
        <li>各軸ごとに、寄与する質問の <strong>平均</strong> を取る</li>
      </ul>
      <div class="s3-eq">
        <code>軸スコア = 各軸の(反転補正済み回答値) の 平均</code><br/>
        <span style="font-size:16px;color:var(--sub)">範囲：おおよそ −2 〜 +2</span>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload, advance to Slide 3. Verify:
- Header: `採点 / Scoring — 回答が軸スコアに変わる` with red stripe
- Left: 4 question rows on axis A, two flagged 反転, then ↓ 平均 → red result box `+0.5`
- Right: explanation list + equation card

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 3 — scoring (per-axis mean)"
```

---

## Task 7: Slide 4 — 比較

**Files:**
- Modify: `presentations/how-it-works/index.html`

- [ ] **Step 1: Add Slide 4 styles**

Append to `<style>`:

```css
  /* ============ Slide 4: Comparison ============ */
  .s4-body { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; flex: 1; align-items: center; }
  .s4-vec {
    background: var(--card); border-radius: var(--card-r);
    box-shadow: var(--card-shadow); padding: 32px;
  }
  .s4-vec h3 { margin: 0 0 20px; font-size: 24px; color: var(--hall-indigo); }
  .s4-bars { display: flex; flex-direction: column; gap: 14px; }
  .s4-bar { display: flex; align-items: center; gap: 12px; }
  .s4-bar .ax { width: 28px; font-weight: 700; font-family: ui-monospace, monospace; }
  .s4-bar .track {
    flex: 1; height: 12px; background: var(--border-light, #F0F2F7);
    position: relative; border-radius: 6px;
  }
  .s4-bar .track::before {
    content: ''; position: absolute; left: 50%; top: -3px; bottom: -3px;
    width: 1px; background: var(--sub);
  }
  .s4-bar .fill {
    position: absolute; top: 0; bottom: 0; border-radius: 6px;
  }
  .s4-bar .v { font-family: ui-monospace, monospace; font-weight: 700; min-width: 48px; text-align: right; }

  .s4-formula {
    margin-top: 32px; padding: 24px 32px;
    background: var(--hall-indigo); color: white;
    border-radius: 12px;
    font-size: 22px; line-height: 1.7;
    text-align: center;
  }
  .s4-formula code { font-family: ui-monospace, monospace; font-weight: 700; }
  .s4-formula .small { font-size: 16px; opacity: 0.75; }
  .s4-foot {
    position: absolute; bottom: 72px; left: 96px; right: 96px;
    font-size: 18px; color: var(--sub); text-align: center;
  }
```

- [ ] **Step 2: Replace Slide 4 markup**

Replace placeholder S4 with:

```html
<section class="slide" data-slide="4">
  <header class="sec-header">
    <div class="sec-eyebrow">比較 / Comparison</div>
    <h2 class="sec-title">5次元ベクトル vs 103部署</h2>
    <div class="sec-stripe" style="background: var(--B);"></div>
  </header>
  <div class="s4-body">
    <div class="s4-vec">
      <h3>受検者の結果（例）</h3>
      <div class="s4-bars">
        <div class="s4-bar"><span class="ax">A</span><span class="track"><span class="fill" style="left:50%;width:15%;background:var(--A-mid)"></span></span><span class="v">+0.6</span></div>
        <div class="s4-bar"><span class="ax">B</span><span class="track"><span class="fill" style="left:25%;width:25%;background:var(--B-mid)"></span></span><span class="v">−1.0</span></div>
        <div class="s4-bar"><span class="ax">C</span><span class="track"><span class="fill" style="left:50%;width:30%;background:var(--C-mid)"></span></span><span class="v">+1.2</span></div>
        <div class="s4-bar"><span class="ax">D</span><span class="track"><span class="fill" style="left:50%;width:5%;background:var(--D-mid)"></span></span><span class="v">+0.2</span></div>
        <div class="s4-bar"><span class="ax">E</span><span class="track"><span class="fill" style="left:50%;width:10%;background:var(--E-mid)"></span></span><span class="v">+0.4</span></div>
      </div>
    </div>
    <div class="s4-vec">
      <h3>部署の理想ベクトル（例：地域福祉課）</h3>
      <div class="s4-bars">
        <div class="s4-bar"><span class="ax">A</span><span class="track"><span class="fill" style="left:50%;width:50%;background:var(--A-mid);opacity:0.6"></span></span><span class="v">+2.0</span></div>
        <div class="s4-bar"><span class="ax">B</span><span class="track"><span class="fill" style="left:50%;width:13%;background:var(--B-mid);opacity:0.6"></span></span><span class="v">+0.5</span></div>
        <div class="s4-bar"><span class="ax">C</span><span class="track"><span class="fill" style="left:50%;width:50%;background:var(--C-mid);opacity:0.6"></span></span><span class="v">+2.0</span></div>
        <div class="s4-bar"><span class="ax">D</span><span class="track"><span class="fill" style="left:50%;width:13%;background:var(--D-mid);opacity:0.6"></span></span><span class="v">+0.5</span></div>
        <div class="s4-bar"><span class="ax">E</span><span class="track"><span class="fill" style="left:50%;width:13%;background:var(--E-mid);opacity:0.6"></span></span><span class="v">+0.5</span></div>
      </div>
    </div>
  </div>
  <div class="s4-formula">
    <code>距離 = √Σ (受検者ᵢ − 部署ᵢ)²</code> &nbsp;&nbsp; → &nbsp;&nbsp;
    <code>適合度% = (1 − 距離 / √80) × 100</code><br/>
    <span class="small">距離が小さいほど、適合度が高い。最大距離 = √80 ≈ 8.94</span>
  </div>
  <div class="s4-foot">部署ベクトルは103部署それぞれに事前設計（職務内容に基づく）</div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload, advance to Slide 4. Verify:
- Header: `比較 / Comparison — 5次元ベクトル vs 103部署` with blue stripe
- Two vector cards side-by-side: 受検者 (left) vs 地域福祉課 example (right), each with 5 axis bars
- Indigo formula band at bottom: distance + fit% formulas
- Footer: 部署ベクトルは103部署それぞれに事前設計

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 4 — comparison (Euclidean distance + fit %)"
```

---

## Task 8: Slide 5 — 結果

**Files:**
- Modify: `presentations/how-it-works/index.html`

- [ ] **Step 1: Add Slide 5 styles**

Append to `<style>`:

```css
  /* ============ Slide 5: Result ============ */
  .s5-body { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; flex: 1; align-items: center; }
  .s5-shot {
    background: var(--card); border-radius: var(--card-r);
    box-shadow: var(--card-shadow); padding: 16px;
    display: flex; align-items: center; justify-content: center;
  }
  .s5-shot img {
    max-width: 100%; max-height: 600px; border-radius: 8px;
    box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  }
  .s5-explain h3 { font-size: 28px; margin: 0 0 16px; color: var(--hall-indigo); }
  .s5-explain p { font-size: 22px; line-height: 1.7; color: var(--text); margin: 0 0 16px; }
  .s5-stat {
    display: flex; gap: 32px; margin: 32px 0;
  }
  .s5-stat .item {
    flex: 1; padding: 24px;
    background: var(--card); border-radius: 12px;
    box-shadow: var(--card-shadow); text-align: center;
  }
  .s5-stat .num {
    font-size: 56px; font-weight: 800; color: var(--hall-indigo);
    font-family: ui-monospace, monospace; line-height: 1;
  }
  .s5-stat .lbl { font-size: 16px; color: var(--sub); margin-top: 8px; }
  .s5-mbti {
    margin-top: 32px;
    padding: 16px 20px;
    border-left: 3px solid var(--D-mid);
    background: var(--D-tint);
    font-size: 16px; line-height: 1.7; color: var(--text-sec);
  }
```

- [ ] **Step 2: Replace Slide 5 markup**

Replace placeholder S5 with:

```html
<section class="slide" data-slide="5">
  <header class="sec-header">
    <div class="sec-eyebrow">結果 / Output</div>
    <h2 class="sec-title">アーキタイプ + 部署ランキング</h2>
    <div class="sec-stripe" style="background: var(--C);"></div>
  </header>
  <div class="s5-body">
    <div class="s5-shot">
      <img src="screenshots/results.png" alt="Results screen" />
    </div>
    <div class="s5-explain">
      <h3>受検者が見る結果</h3>
      <p>32アーキタイプから1つに分類され、全103部署が適合度順にランクされます。</p>
      <div class="s5-stat">
        <div class="item"><div class="num">32</div><div class="lbl">アーキタイプ<br/>(2⁵)</div></div>
        <div class="item"><div class="num">103</div><div class="lbl">部署を<br/>適合度順</div></div>
      </div>
      <div class="s5-mbti">
        ※ MBTI（4軸 → 16タイプ）の発想を参考に、5軸 → 32タイプへ拡張。
        職員の性格分類ではなく、<strong>業務適性の把握</strong>を目的とする。
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload, advance to Slide 5. Verify:
- Header: `結果 / Output — アーキタイプ + 部署ランキング` with green stripe
- Left: Results screenshot displayed in card
- Right: explanation, two stat cards (32 / 103), MBTI footnote in purple-tinted box
- If screenshot is missing or oversize, fix the image at `screenshots/results.png` before continuing

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 5 — output + MBTI lineage acknowledgement"
```

---

## Task 9: Slide 6 — まとめ・デモへ

**Files:**
- Modify: `presentations/how-it-works/index.html`

- [ ] **Step 1: Add Slide 6 styles**

Append to `<style>`:

```css
  /* ============ Slide 6: Summary + CTA ============ */
  .s6 { justify-content: center; }
  .s6-cards {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 32px; margin: 48px 0 56px;
  }
  .s6-card {
    border-radius: var(--card-r);
    padding: 32px;
    background: var(--card);
    box-shadow: var(--card-shadow);
    border-top: 6px solid var(--hall-indigo);
  }
  .s6-card.input { border-top-color: var(--A-mid); }
  .s6-card.compare { border-top-color: var(--B-mid); }
  .s6-card.output { border-top-color: var(--C-mid); }
  .s6-card .lbl {
    font-size: 14px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--sub); margin-bottom: 12px;
  }
  .s6-card .head {
    font-size: 28px; font-weight: 700; color: var(--hall-indigo);
    margin-bottom: 12px;
  }
  .s6-card .body {
    font-size: 18px; line-height: 1.6; color: var(--text-sec);
  }

  .s6-note {
    padding: 20px 28px;
    background: var(--card); border-left: 4px solid var(--hall-indigo);
    border-radius: 8px;
    font-size: 20px; line-height: 1.7; color: var(--text);
    max-width: 1100px;
  }
  .s6-cta {
    margin-top: 56px;
    text-align: center;
  }
  .s6-cta button {
    background: var(--hall-indigo); color: white;
    border: none; border-radius: 12px;
    padding: 20px 48px;
    font-size: 24px; font-weight: 700;
    font-family: var(--font);
    cursor: pointer;
    box-shadow: var(--card-shadow);
  }
  .s6-cta button:hover { background: var(--hall-indigo-hover, #2A3558); }
```

- [ ] **Step 2: Replace Slide 6 markup**

Replace placeholder S6 with:

```html
<section class="slide s6" data-slide="6">
  <header class="sec-header">
    <div class="sec-eyebrow">まとめ / Summary</div>
    <h2 class="sec-title">仕組みの全体像</h2>
    <div class="sec-stripe"></div>
  </header>
  <div class="s6-cards">
    <div class="s6-card input">
      <div class="lbl">Step 1 — 入力</div>
      <div class="head">20問 → 5軸スコア</div>
      <div class="body">5段階の回答を反転補正し、軸ごとに平均を取る</div>
    </div>
    <div class="s6-card compare">
      <div class="lbl">Step 2 — 比較</div>
      <div class="head">5次元距離計算</div>
      <div class="body">受検者ベクトルと103部署ベクトルのユークリッド距離 → 適合度%</div>
    </div>
    <div class="s6-card output">
      <div class="lbl">Step 3 — 出力</div>
      <div class="head">アーキタイプ + ランキング</div>
      <div class="body">32アーキタイプから1つ、103部署を適合度順に提示</div>
    </div>
  </div>
  <div class="s6-note">
    <strong>注記：</strong>本ツールは <strong>配属判断ツールではなく</strong>、職員自身が業務適性を考えるための <strong>自己理解の補助</strong> です。配属の最終判断は人事部門が担います。
  </div>
  <div class="s6-cta">
    <button type="button">▶ ライブデモへ</button>
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

Reload, advance to Slide 6. Verify:
- Header: `まとめ / Summary — 仕組みの全体像`
- Three cards: Step 1/2/3 with axis-color top borders
- 注記 box clearly states "配属判断ツールではなく ... 自己理解の補助"
- Indigo CTA button "▶ ライブデモへ" centered at bottom (button is decorative — does not need to do anything)

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): add slide 6 — summary cards + demo CTA"
```

---

## Task 10: Polish + section labels in footer

**Files:**
- Modify: `presentations/how-it-works/index.html`

**Why:** The footer currently shows the same section title on every slide. Update it to reflect the current slide's section, matching the `sec-eyebrow` text. This is a small detail but matters for a presentation that runs for 5 minutes.

- [ ] **Step 1: Add section labels to slide elements**

Add a `data-section` attribute to each slide opening tag (modify each `<section>`):

- Slide 1: `data-section="表紙"`
- Slide 2: `data-section="入力"`
- Slide 3: `data-section="採点"`
- Slide 4: `data-section="比較"`
- Slide 5: `data-section="結果"`
- Slide 6: `data-section="まとめ"`

- [ ] **Step 2: Update the `show()` function to update footer label**

In the `<script>` block, replace the existing `show()` function with:

```javascript
  function show(n) {
    idx = Math.max(0, Math.min(total - 1, n));
    slides.forEach((el, i) => el.classList.toggle('active', i === idx));
    pageEl.textContent = `${idx + 1} / ${total}`;
    const section = slides[idx].dataset.section || '';
    document.getElementById('footer-section').textContent =
      `部署タイプ診断 — その仕組み ・ ${section}`;
  }
  // Initialize footer text correctly on load
  show(0);
```

- [ ] **Step 3: Verify in browser**

Reload. Cycle through all 6 slides. Verify the footer left text updates: `... ・ 表紙` → `... ・ 入力` → ... → `... ・ まとめ`.

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/index.html
git commit -m "feat(presentation): show section name in footer per slide"
```

---

## Task 11: Playwright click-test verification

**Files:**
- Create: `presentations/how-it-works/verify.spec.js` (or use huashu-design's verification convention if it differs — defer to the skill's pattern)

**What this catches:** A console error or layout break introduced by any prior step that didn't get caught visually. Click through every slide once, assert no console errors, snapshot each slide.

- [ ] **Step 1: Write a Playwright verify spec**

Per huashu-design's verification pattern (consult the skill's `references/verification.md`), the simplest form is:

```javascript
// presentations/how-it-works/verify.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');

test('deck advances through all 6 slides without console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('file://' + path.resolve(__dirname, 'index.html'));

  for (let i = 1; i <= 6; i++) {
    await expect(page.locator(`.slide.active[data-slide="${i}"]`)).toBeVisible();
    await page.screenshot({ path: `presentations/how-it-works/screenshots/slide-${i}-rendered.png`, fullPage: false });
    if (i < 6) await page.keyboard.press('ArrowRight');
  }

  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run the test**

```bash
npx playwright test presentations/how-it-works/verify.spec.js
```

Expected: 1 passed. Screenshot files appear at `presentations/how-it-works/screenshots/slide-{1..6}-rendered.png`.

If Playwright isn't installed in this project, install it as a dev dependency first:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 3: Visually inspect each rendered screenshot**

```bash
open presentations/how-it-works/screenshots/slide-1-rendered.png
# ...repeat for slides 2-6
```

Confirm:
- No layout overflow (text not clipped, cards not bleeding off-stage)
- Axis colors render correctly
- Screenshots in slide 5 are present and not stretched

- [ ] **Step 4: Commit**

```bash
git add presentations/how-it-works/verify.spec.js presentations/how-it-works/screenshots/slide-*-rendered.png
git commit -m "test(presentation): add Playwright click-through verification"
```

---

## Task 12: Final review at projector aspect

**Files:** None modified — pure verification.

- [ ] **Step 1: Open in browser at full screen**

```bash
open presentations/how-it-works/index.html
```

Press F11 (Windows/Linux) or Ctrl+Cmd+F (macOS Chrome) to enter fullscreen. If your monitor is not 16:9, the deck still scales — just verify visually.

- [ ] **Step 2: Run a 5-minute walkthrough**

Click through all 6 slides, simulating the actual presentation:
- Read each slide's text aloud at a natural pace
- Confirm content fits comfortably (no rushed reading)
- Confirm no slide feels too sparse or too crowded
- Confirm the demo CTA on Slide 6 reads as a logical handoff

If a slide takes more than ~50 seconds to read, content density may be too high — flag back to Quinn for spec revision rather than auto-trimming.

- [ ] **Step 3: Confirm spec acceptance criteria**

Cross-check the deck against `docs/superpowers/specs/2026-04-29-presentation-design.md`:

- [ ] Single takeaway lands ("ranks all 103 divisions by fit using 5 axes from 20 questions — transparent, not magic")
- [ ] Japanese-only throughout (English reserved for `/` separators in eyebrows)
- [ ] No kanji-glyph decorative motif (axis-color stripes are the recognition device)
- [ ] High information density (no Apple-style sparse slides)
- [ ] MBTI lineage acknowledged on slide 5
- [ ] Tight visual match to the React app (palette + type)
- [ ] Live demo NOT embedded (CTA only)

- [ ] **Step 4: No commit needed**

This task is verification. If issues are found, fix them in the appropriate prior task and re-run Task 11.

---

## Done

The deck is at `presentations/how-it-works/index.html`. It can be opened in any modern browser, presented with arrow keys, and projected at 1920×1080 (or anything else — it scales).

Optional follow-ups (not part of this plan):
- PDF export via `huashu-design`'s `export_deck_pdf.mjs` for a paper handout
- PPTX export if 人事課長 wants an editable copy
- Additional accent animation (e.g., axis-stripe wipe-in on title) — only if a future iteration calls for it
