# 横須賀市役所 部署タイプ診断 (Yokosuka City Hall Department Type Quiz)

Internal personality quiz for Yokosuka City Hall staff. 20 questions on five axes, one of 32 archetypes, all 103 departments ranked by fit. No backend, no database — runs entirely in the browser.

## Stack

React 19, TypeScript 6, Vite 8, Vitest, CSS Modules.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

The tracked `dist/` package is also usable from the filesystem without a local
server. Open `dist/index.html` in a browser and keep `dist/app-config.js` beside
it; nontechnical editors can update that config file independently.

### Editable Config

The runtime config is intentionally a JavaScript file, not JSON:

```text
dist/
  index.html
  app-config.js
```

When users open `index.html` directly from their filesystem, browsers can load a
sibling JavaScript file with `<script src="./app-config.js"></script>`. Loading a
sibling JSON file would require `fetch()` or module imports, which are not
reliable from `file://` pages across browsers.

The admin screen exports the editable config as `app-config.js`. Keep that exact
filename beside `index.html` when distributing the local package.

## GitHub Pages Preview

This repo deploys the tracked `dist/` output to the `gh-pages` branch on every
push to `main`, using `.github/workflows/deploy-pages.yml`.

```text
https://quinninjapan.github.io/yokosuka-division-quiz/
```

If GitHub does not enable Pages automatically after the first `gh-pages` branch
push, set **Pages** to deploy from the `gh-pages` branch at `/`.

## Test

```bash
npm test
```

## Project layout

- `src/data/` — typed quiz data (axes, questions, divisions, archetypes, descriptions)
- `src/lib/` — pure scoring and ranking logic
- `src/state/` — Context + reducer global store
- `src/screens/` — Welcome, Quiz, Results
- `src/components/` — reusable presentation pieces
- `src/styles/` — global tokens, reset, layout
- `docs/superpowers/` — design specs and implementation plans
