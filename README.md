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

## GitHub Pages Preview

This repo deploys the normal Vite `dist/` output to GitHub Pages on every push to
`main`, using `.github/workflows/deploy-pages.yml`. The app is built with
relative asset paths, so split JS/CSS/image files work under the repository Pages
URL:

```text
https://quinninjapan.github.io/yokosuka-division-quiz/
```

In the GitHub repository settings, set **Pages** to deploy from **GitHub Actions**
if it is not already enabled.

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
