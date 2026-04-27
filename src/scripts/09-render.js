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
