/* ═══════════════════════ WELCOME ═══════════════════════ */

function renderWelcome() {
  const pills = Object.entries(AXES).map(([k, v]) =>
    `<span class="apill" style="background:${v.tint};color:${v.dark}">${v.label}</span>`
  ).join('');

  return `
  <div class="w-header">
    <div class="w-city">Yokosuka City Hall</div>
    <h1 class="w-title">横須賀市役所<br>部署タイプ診断</h1>
    <p class="w-sub">20の質問に答えるだけで、<br>あなたにぴったりの課が見つかります</p>
  </div>
  <div class="card">
    <div class="axis-pills">${pills}</div>
    <p class="w-intro">
      5つの視点からあなたの「働き方タイプ」を診断し、全102課の中から相性の高い部署をランキングでご紹介します。
    </p>
    <div class="w-steps">
      <div class="w-step">
        <span class="w-step-num">1</span>
        <span>20の仕事場面に、あなたがどう感じるか回答</span>
      </div>
      <div class="w-step">
        <span class="w-step-num">2</span>
        <span>5つの軸であなたの「働き方タイプ」を診断</span>
      </div>
      <div class="w-step">
        <span class="w-step-num">3</span>
        <span>全102課との相性をランキングで発表！</span>
      </div>
    </div>
    <div class="w-stats">
      <div class="stat"><div class="stat-n">20</div><div class="stat-l">質問数</div></div>
      <div class="stat"><div class="stat-n">5</div><div class="stat-l">診断軸</div></div>
      <div class="stat"><div class="stat-n">102</div><div class="stat-l">対象の課</div></div>
    </div>
    <button class="btn-start" onclick="go('START')">診断をはじめる →</button>
  </div>`;
}
