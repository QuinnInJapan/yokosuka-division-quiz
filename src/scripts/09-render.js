/* ═══════════════════════ RENDER ═══════════════════════ */

function render() {
  const app = document.getElementById('app');
  if (S.screen === 'welcome')      app.innerHTML = renderWelcome();
  else if (S.screen === 'quiz')    app.innerHTML = renderQuiz();
  else                              app.innerHTML = renderResults();

  window.scrollTo(0, 0);
  manageFocus();
}

function manageFocus() {
  // Move focus to the screen's primary heading so keyboard + screen-reader users
  // know the page changed. Headings get tabindex=-1 to be focusable without a tab stop.
  const target = document.querySelector('h1');
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
}

restoreFromUrl();
render();

// Hello to whoever's poking around in DevTools.
console.log(
  '%c横須賀市役所 部署タイプ診断 %c\n内部向けの遊び。気軽にどうぞ。',
  'font-weight:700; font-size:13px; color:#1C2340;',
  'font-size:11px; color:#6B7280;'
);
