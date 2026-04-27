/* ═══════════════════════ ALGORITHM ═══════════════════════ */

const AX = ['A','B','C','D','E'];
const MAX_D = Math.sqrt(5 * 16); // sqrt(80) ≈ 8.944
const QMAP = {};
QUESTIONS.forEach(q => QMAP[q.id] = q);

function scoreResp(r, rev) {
  const v = r - 3;
  return rev ? -v : v;
}

function axisScores(resp) {
  const s = { A:[], B:[], C:[], D:[], E:[] };
  for (const [id, r] of Object.entries(resp)) {
    const q = QMAP[id];
    s[q.axis].push(scoreResp(r, q.reversed));
  }
  const o = {};
  for (const ax of AX) {
    const a = s[ax];
    o[ax] = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  return o;
}

function dist(u, d) {
  return Math.sqrt(AX.reduce((s, ax) => s + (u[ax] - d[ax]) ** 2, 0));
}

function fitPct(d) {
  return Math.round((1 - d / MAX_D) * 1000) / 10;
}

function rankAll(resp) {
  const u = axisScores(resp);
  return DIVISIONS
    .map(d => ({ ...d, user: u, fit: fitPct(dist(u, d)) }))
    .sort((a, b) => b.fit - a.fit);
}

function determineType(userScores) {
  const code = AX.map(ax => {
    return userScores[ax] >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus;
  }).join('');
  const t = TYPES[code] || { name: '探究者', desc: 'あなたは独自のバランス感覚を持つタイプです。' };
  return { code, ...t };
}
