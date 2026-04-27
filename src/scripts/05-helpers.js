/* ═══════════════════════ HELPERS ═══════════════════════ */

function fitColor(p) {
  if (p >= 80) return { text: '#1E7345', fill: '#4CAF7D', bg: '#ECF8F1' };
  if (p >= 60) return { text: '#2E6DB4', fill: '#4A90D9', bg: '#EBF3FC' };
  if (p >= 45) return { text: '#9C6310', fill: '#F5A623', bg: '#FFF6E6' };
  return { text: '#C0392B', fill: '#E8534A', bg: '#FFF0EE' };
}

function ring(pct, fc) {
  const r = 24, c = 2 * Math.PI * r, f = (pct / 100) * c;
  return `<div class="fit-display">
    <div class="fit-arc">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="${r}" fill="none" stroke="#E4E7ED" stroke-width="6"/>
        <circle cx="28" cy="28" r="${r}" fill="none" stroke="${fc.fill}" stroke-width="6"
          stroke-dasharray="${f} ${c}" stroke-linecap="round" style="transform:rotate(-90deg);transform-origin:center"/>
      </svg>
    </div>
    <div class="fit-text">
      <span class="fit-pct" style="color:${fc.text}">${pct}%</span>
      <span class="fit-lbl">相性度</span>
    </div>
  </div>`;
}

/* ── Score → percentage (always ≥50, winning side) ── */
function scoreToPct(score) {
  const isPlus = score >= 0;
  const pct = Math.round(50 + (Math.abs(score) / 2) * 50);
  return { pct, isPlus };
}

/* ── Trait bar (compact, for 5-bar panel) ── */
function traitBar(ax, score, active) {
  const a = AXES[ax];
  const { pct, isPlus } = scoreToPct(score);
  const winLabel = isPlus ? a.plus : a.minus;
  const dotLeft = ((score + 2) / 4 * 100).toFixed(0);

  return `
  <div class="trait${active ? ' trait--active' : ''}" onclick="go('TAXS','${ax}')">
    <div class="trait-header">
      <span class="trait-pct" style="color:${a.dark}">${pct}%</span>
      <span class="trait-win" style="color:${a.dark}">${winLabel}</span>
    </div>
    <div class="trait-bar-row">
      <span class="trait-end">${a.kanji_minus}</span>
      <div class="trait-track" style="background:${a.color}">
        <div class="trait-dot" style="left:${dotLeft}%;border-color:${a.dark}"></div>
      </div>
      <span class="trait-end">${a.kanji_plus}</span>
    </div>
  </div>`;
}

/* ── Axis description carousel (left panel) ── */
function traitCarouselDesc() {
  const ax = AX[S.traitIdx];
  const score = S.userScores[ax];
  const a = AXES[ax];
  const { pct, isPlus } = scoreToPct(score);
  const winLabel = isPlus ? a.plus : a.minus;
  const desc = getAxisDesc(ax, score);
  const dotLeft = ((score + 2) / 4 * 100).toFixed(0);

  const dots = AX.map((_, i) =>
    `<span class="tc-dot${i === S.traitIdx ? ' tc-dot--on' : ''}" style="${i === S.traitIdx ? 'background:'+a.color : ''}"></span>`
  ).join('');

  const winKanji = isPlus ? a.kanji_plus : a.kanji_minus;

  return `
  <div class="tc-axis-label">${a.label}</div>
  <div class="tc-hero" style="color:${a.dark}">
    <span class="tc-kanji" style="background:${a.tint}">${winKanji}</span>
    <span class="tc-win">${winLabel}</span>
  </div>
  <div class="tc-bar-row">
    <span class="tc-end">${a.minus}</span>
    <div class="tc-track" style="background:${a.color}">
      <div class="tc-marker" style="left:${dotLeft}%;border-color:${a.dark}"></div>
    </div>
    <span class="tc-end">${a.plus}</span>
  </div>
  <div class="tc-desc">${desc}</div>
  <div class="tc-nav-row">
    <button class="tc-nav" onclick="go('TPREV')">‹</button>
    <div class="tc-dots">${dots}</div>
    <button class="tc-nav" onclick="go('TNEXT')">›</button>
  </div>`;
}

/* ── Stacked comparison bars (match section, fixed orientation) ── */
function toFill(v) { return (((v + 2) / 4) * 100).toFixed(0); }

function comparisonBars(ax, userScore, divScore) {
  const a = AXES[ax];
  const uPct = toFill(userScore);
  const dPct = toFill(divScore);
  return `
  <div class="comp-row">
    <div class="comp-axis" style="color:${a.dark}">${a.label}</div>
    <div class="comp-pair">
      <span class="comp-who">あなた</span>
      <div class="comp-track" style="background:${a.color}">
        <div class="comp-dot" style="left:${uPct}%;border-color:${a.dark}"></div>
      </div>
    </div>
    <div class="comp-pair">
      <span class="comp-who">この課</span>
      <div class="comp-track comp-track--div" style="background:${a.color}">
        <div class="comp-dot" style="left:${dPct}%;border-color:${a.dark}"></div>
      </div>
    </div>
    <div class="comp-ends"><span>${a.minus}</span><span>${a.plus}</span></div>
  </div>`;
}
