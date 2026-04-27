/* ═══════════════════════ STATE ═══════════════════════ */

let S = {
  screen: 'welcome',
  step: 0,
  resp: {},
  results: [],
  sel: 0,
  showAll: false,
  traitIdx: 0, // carousel index 0-4
  type: null,       // { code, name, desc }
  userScores: null,  // { A, B, C, D, E }
};

/* ── Share via URL ── */
function encodeResponses(resp) {
  return ORDER.map(id => resp[id] || 3).join('');
}

function decodeResponses(str) {
  const resp = {};
  ORDER.forEach((id, i) => { resp[id] = parseInt(str[i]) || 3; });
  return resp;
}

function getShareUrl() {
  const encoded = encodeResponses(S.resp);
  const url = new URL(window.location.href);
  url.hash = '';
  url.searchParams.set('r', encoded);
  return url.toString();
}

function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get('r');
  if (r && r.length === ORDER.length && /^[1-5]+$/.test(r)) {
    S.resp = decodeResponses(r);
    S.results = rankAll(S.resp);
    S.userScores = S.results[0].user;
    S.type = determineType(S.userScores);
    S.sel = 0;
    S.screen = 'results';
    return true;
  }
  return false;
}

function go(action, payload) {
  switch (action) {
    case 'START':
      S.screen = 'quiz'; S.step = 0; S.resp = {};
      break;
    case 'ANSWER':
      S.resp[ORDER[S.step]] = payload;
      if (S.step < ORDER.length - 1) {
        S.step++;
      } else {
        S.results = rankAll(S.resp);
        S.userScores = S.results[0].user;
        S.type = determineType(S.userScores);
        S.sel = 0;
        S.showAll = false;
        S.screen = 'results';
        history.replaceState(null, '', getShareUrl());
      }
      break;
    case 'BACK':
      if (S.step > 0) S.step--;
      break;
    case 'SEL':
      S.sel = payload;
      patchSel();
      return;
    case 'TALL':
      S.showAll = !S.showAll;
      break;
    case 'TPREV':
      S.traitIdx = (S.traitIdx + 4) % 5;
      patchTrait();
      return;
    case 'TNEXT':
      S.traitIdx = (S.traitIdx + 1) % 5;
      patchTrait();
      return;
    case 'TAXS':
      S.traitIdx = AX.indexOf(payload);
      patchTrait();
      return;
    case 'SHARE':
      const url = getShareUrl();
      if (navigator.share) {
        navigator.share({ title: '横須賀市 課 相性診断', url });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          const btn = document.querySelector('.btn-share');
          if (btn) { btn.textContent = 'コピーしました'; setTimeout(() => { btn.textContent = '結果をシェアする'; }, 2000); }
        });
      }
      return;
    case 'RETAKE':
      S.screen = 'welcome'; S.step = 0; S.resp = {};
      S.results = []; S.type = null; S.userScores = null;
      history.replaceState(null, '', window.location.pathname);
      break;
  }
  render();
}
