/* ═══════════════════════ QUIZ ═══════════════════════ */

function renderQuiz() {
  const qid = ORDER[S.step];
  const q = QMAP[qid];
  const ax = AXES[q.axis];

  const segs = ORDER.map((id, i) => {
    const c = AXES[QMAP[id].axis].color;
    let cls = 'seg';
    if (i < S.step) cls += ' done';
    else if (i === S.step) cls += ' cur';
    return `<div class="${cls}" style="--c:${c}"></div>`;
  }).join('');

  const prev = S.resp[qid];
  const opts = q.options.map((o, i) => {
    const selected = prev === (i + 1) ? ' style="border-color:' + ax.dark + ';background:' + ax.tint + '"' : '';
    return `<button class="opt"${selected} onclick="go('ANSWER',${i + 1})">
      <span class="opt-num" style="color:${ax.dark}">${i + 1}</span>${o}
    </button>`;
  }).join('');

  const back = S.step > 0
    ? `<button class="btn-back" onclick="go('BACK')">← 戻る</button>`
    : '';

  return `
  <div class="quiz-content">
    <div class="prog-wrap">
      <div
        class="prog-bar"
        role="progressbar"
        aria-valuemin="1"
        aria-valuemax="${ORDER.length}"
        aria-valuenow="${S.step + 1}"
        aria-label="進捗 ${S.step + 1} / ${ORDER.length}"
      >${segs}</div>
    </div>
    <div class="quiz-meta">
      <span class="q-num">Q.${S.step + 1} <span aria-hidden="true">/</span> ${ORDER.length}</span>
      <span class="axis-tag" style="background:${ax.tint};color:${ax.dark}">${ax.label}</span>
    </div>
    <h1 class="scenario" style="color:${ax.dark}">${q.scenario}</h1>
    <p class="opts-label" id="opts-label-${S.step}">この場面、あなたにはどのくらい合っていますか？</p>
    <div role="group" aria-labelledby="opts-label-${S.step}">${opts}</div>
    ${back}
  </div>`;
}
