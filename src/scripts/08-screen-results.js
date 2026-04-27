/* ═══════════════════════ RESULTS ═══════════════════════ */

const TOP_N = 5;

/* ── Section 1: Type banner (full-width reveal) ── */
function renderTypeReveal() {
  const t = S.type;
  const u = S.userScores;
  const chips = AX.map(ax => {
    const a = AXES[ax];
    const kanji = u[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
    return `<div class="type-chip" style="background:${a.tint};color:${a.dark}">${kanji}</div>`;
  }).join('');

  return `
  <div class="type-banner">
    <div class="type-pre">あなたのタイプ</div>
    <div class="type-chips">${chips}</div>
    <div class="type-name">「${t.name}」型</div>
    <div class="type-code">${t.code}</div>
    <div class="type-desc">${t.desc}</div>
  </div>`;
}

/* ── Section 2: Traits (carousel desc + 5-bar panel) ── */
function renderTraits() {
  const bars = AX.map((ax, i) => traitBar(ax, S.userScores[ax], i === S.traitIdx)).join('');
  return `
  <div class="traits-grid section-gap">
    <div class="card tc-panel">${traitCarouselDesc()}</div>
    <div class="card bars-panel">${bars}</div>
  </div>`;
}

/* ── Detail card HTML ── */
function renderDetailCard() {
  const r = S.results[S.sel];
  const fc = fitColor(r.fit);
  const bars = AX.map(ax => comparisonBars(ax, r.user[ax], r[ax])).join('');
  const about = (r.about || '');
  const rc = 24, c = 2 * Math.PI * rc, f = (r.fit / 100) * c;
  return `
    <div class="card match-card">
      <div class="match-top">
        <div class="fit-display">
          <div class="fit-arc">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="${rc}" fill="none" stroke="#E4E7ED" stroke-width="6"/>
              <circle class="js-arc" cx="28" cy="28" r="${rc}" fill="none" stroke="${fc.fill}" stroke-width="6"
                stroke-dasharray="${f} ${c}" stroke-linecap="round" style="transform:rotate(-90deg);transform-origin:center"/>
            </svg>
          </div>
          <div class="fit-text">
            <span class="js-fit-pct fit-pct" style="color:${fc.text}">${r.fit}%</span>
            <span class="fit-lbl">相性度</span>
          </div>
        </div>
        <div>
          <div class="js-dept div-dept">${r.dept}</div>
          <div class="js-name div-name">${r.name}</div>
          <div class="js-about div-about">${about}</div>
        </div>
      </div>
      <div class="comp-label">相性の内訳</div>
      ${bars}
    </div>`;
}

/* ── Section 3+4: Match + Browse (side-by-side) ── */
function renderMatchBrowse() {
  const all = S.results;

  const items = all.map((d, i) => {
    const dfc = fitColor(d.fit);
    const on = i === S.sel ? 'on' : '';
    const pressed = i === S.sel ? 'true' : 'false';
    return `<button type="button" class="all-item ${on}" onclick="go('SEL',${i})" aria-pressed="${pressed}">
      <span class="all-rn">${i + 1}</span>
      <div class="all-info">
        <div class="all-name">${d.name}</div>
        <div class="all-dept">${d.dept}</div>
      </div>
      <span class="all-fit" style="color:${dfc.text}">${d.fit}%</span>
    </button>`;
  }).join('');

  return `
  <div class="match-section section-gap">
    <div class="match-section-title">あなたに合う課</div>
    <div class="match-section-sub">5つの軸のプロファイルを比較して相性を算出しています</div>
    <div class="match-browse">
      <div class="all-list all-list--side">${items}</div>
      <div class="detail-col">${renderDetailCard()}</div>
    </div>
    <div class="bottom-actions">
      <button class="btn-share" type="button" onclick="go('SHARE')">結果をシェアする</button>
      <button class="btn-retake" type="button" onclick="go('RETAKE')">もう一度やってみる</button>
    </div>
  </div>`;
}

/* ── Targeted DOM patches ── */
function patchSel() {
  const r = S.results[S.sel];
  const fc = fitColor(r.fit);
  const rc = 24, c = 2 * Math.PI * rc, f = (r.fit / 100) * c;

  // Update header text
  const el = (s) => document.querySelector(s);
  el('.js-dept').textContent = r.dept;
  el('.js-name').textContent = r.name;
  el('.js-about').textContent = r.about || '';
  el('.js-fit-pct').textContent = r.fit + '%';
  el('.js-fit-pct').style.color = fc.text;

  // Update arc
  const arc = el('.js-arc');
  arc.setAttribute('stroke', fc.fill);
  arc.setAttribute('stroke-dasharray', f + ' ' + c);

  // Update dot positions (CSS transition handles animation)
  const dots = document.querySelectorAll('.comp-dot');
  AX.forEach((ax, i) => {
    const uPct = toFill(r.user[ax]) + '%';
    const dPct = toFill(r[ax]) + '%';
    dots[i * 2].style.left = uPct;
    dots[i * 2 + 1].style.left = dPct;
  });

  // Update list highlight
  document.querySelectorAll('.all-item').forEach((el, i) => {
    const isOn = i === S.sel;
    el.classList.toggle('on', isOn);
    el.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  });
}

function patchTrait() {
  const tc = document.querySelector('.tc-panel');
  if (tc) tc.innerHTML = traitCarouselDesc();
  // Update active highlight on bars
  document.querySelectorAll('.trait').forEach((el, i) => {
    const isActive = i === S.traitIdx;
    el.classList.toggle('trait--active', isActive);
    el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* ── Assemble ── */
function renderResults() {
  return renderTypeReveal()
    + renderTraits()
    + renderMatchBrowse();
}
