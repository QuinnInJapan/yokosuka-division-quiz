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
