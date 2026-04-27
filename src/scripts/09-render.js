/* ═══════════════════════ RENDER ═══════════════════════ */

function render() {
  const app = document.getElementById('app');
  if (S.screen === 'welcome')      app.innerHTML = renderWelcome();
  else if (S.screen === 'quiz')    app.innerHTML = renderQuiz();
  else                              app.innerHTML = renderResults();

  window.scrollTo(0, 0);
}

restoreFromUrl();
render();
