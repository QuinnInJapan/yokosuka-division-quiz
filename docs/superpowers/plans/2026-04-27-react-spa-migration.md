# React SPA Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing vanilla-JS quiz app to an idiomatic React 18 + TypeScript SPA built with Vite, preserving all behavior except the URL-based share feature (removed; PNG export deferred).

**Architecture:** By-type folder layout under `src/` — `data/` (typed modules), `lib/` (pure functions), `state/` (Context + `useReducer` store), `screens/` and `components/` (presentational React), `styles/` (global tokens + per-component CSS Modules). Derived state (`userScores`, `type`, `results`) is recomputed via `useMemo` from `resp` instead of stored, eliminating drift.

**Tech Stack:** React 18, TypeScript 5+, Vite, Vitest, ESLint+Prettier defaults, CSS Modules.

**Reference spec:** `docs/superpowers/specs/2026-04-27-react-spa-migration-design.md`.

**Working strategy:** All new work happens inside a `react/` subdirectory until step 35. The old `src/`, `build.py`, and `dist/` remain untouched, so both versions can be A/B compared in the browser at any time. The cutover at the end promotes `react/` to the project root.

---

## File Structure

The plan produces this final layout (after the cutover task):

```
src/
  data/         types.ts, axes.ts, questions.ts, divisions.ts, archetypes.ts, descriptions.ts
  lib/          scoring.ts, scoring.test.ts
  state/        store.tsx, reducer.test.ts
  screens/      Welcome.tsx + .module.css, Quiz.tsx + .module.css, Results.tsx + .module.css
  components/   AppShell.tsx, ProgressBar(.tsx + .module.css), TypeReveal(.tsx + .module.css),
                TraitsPanel(.tsx + .module.css), TraitCarousel(.tsx + .module.css),
                TraitBar(.tsx + .module.css), MatchBrowse(.tsx + .module.css),
                MatchList(.tsx + .module.css), MatchDetail(.tsx + .module.css),
                FitRing.tsx, ComparisonBars(.tsx + .module.css), RetakeButton(.tsx + .module.css)
  styles/       tokens.css, reset.css, layout.css
  App.tsx, main.tsx
index.html, package.json, tsconfig.json, vite.config.ts, .eslintrc.cjs
```

Each component owns a single, well-bounded responsibility and communicates with the rest of the app through the typed `useStore()` / `useDerived()` hooks. Components do not call into each other's internals.

---

## Phase A — Scaffold

### Task 1: Create Vite project in `react/` subdirectory

**Files:**
- Create: `react/` (Vite scaffold output)

- [ ] **Step 1: Run Vite scaffold**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
npm create vite@latest react -- --template react-ts -y
```

Expected: directory `react/` created with Vite + React + TS template.

- [ ] **Step 2: Install dependencies**

```bash
cd react && npm install
```

Expected: `node_modules/` populated, no errors.

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev -- --port 5174
```

Expected: server boots, prints `Local: http://localhost:5174/`. Press Ctrl+C to stop.

- [ ] **Step 4: Replace template assets with empty entry**

Replace `react/src/App.tsx` contents:

```tsx
export default function App() {
  return <div>migration in progress</div>;
}
```

Replace `react/src/main.tsx` contents:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Delete: `react/src/App.css`, `react/src/index.css`, `react/src/assets/react.svg`, `react/public/vite.svg`.

Update `react/index.html` to set Japanese language and document title:

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>横須賀市役所 部署タイプ診断</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Verify build still works**

```bash
cd react && npm run build
```

Expected: `dist/` produced under `react/` with no TypeScript errors.

- [ ] **Step 6: Add `.gitignore` entries for the new tree**

Append to `/Users/quinnngo/Desktop/projects/yokosuka-division-quiz/.gitignore`:

```
react/node_modules/
react/dist/
```

- [ ] **Step 7: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/ .gitignore
git commit -m "chore: scaffold Vite + React + TS in react/ subdir"
```

---

### Task 2: Install and configure Vitest

**Files:**
- Modify: `react/package.json`
- Modify: `react/vite.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
cd react
npm install --save-dev vitest @vitest/ui
```

- [ ] **Step 2: Add `test` script to `react/package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Final scripts block should look like:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

Replace `react/vite.config.ts` contents:

```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Verify Vitest runs (no tests yet)**

```bash
cd react && npm test
```

Expected: `No test files found` or equivalent. Exit code 0 or 1 — the point is the binary resolves.

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/package.json react/package-lock.json react/vite.config.ts
git commit -m "chore: add Vitest with node environment"
```

---

## Phase B — Data Layer

The five data modules port verbatim content from `src/scripts/01-data.js`, `src/scripts/01b-descriptions.js`, and `src/scripts/02-types.js`. The TypeScript types are added to give the rest of the codebase compile-time validation. The `DIV_ABOUT` table is folded into `DIVISIONS[i].about` during migration.

### Task 3: Define shared types

**Files:**
- Create: `react/src/data/types.ts`

- [ ] **Step 1: Write `react/src/data/types.ts`**

```ts
export type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';

export const AX: readonly AxisKey[] = ['A', 'B', 'C', 'D', 'E'] as const;

export type Response = 1 | 2 | 3 | 4 | 5;
export type Responses = Record<string, Response>;

export type Axis = {
  label: string;
  minus: string;
  plus: string;
  color: string;
  dark: string;
  tint: string;
  kanji_plus: string;
  kanji_minus: string;
  letter_plus: string;
  letter_minus: string;
  en_plus: string;
  en_minus: string;
};

export type Question = {
  id: string;
  axis: AxisKey;
  reversed: boolean;
  scenario: string;
  options: [string, string, string, string, string];
};

export type Division = {
  dept: string;
  name: string;
  en: string;
  about?: string;
} & Record<AxisKey, number>;

export type Archetype = { name: string; desc: string };

export type ResolvedArchetype = Archetype & { code: string };

export type RankedDivision = Division & {
  user: Record<AxisKey, number>;
  fit: number;
};

export type AxisDescTier =
  | 'strong_plus'
  | 'mild_plus'
  | 'neutral'
  | 'mild_minus'
  | 'strong_minus';

export type AxisDescTiers = Record<AxisDescTier, string>;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd react && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/types.ts
git commit -m "feat(data): add shared TypeScript types for quiz domain"
```

---

### Task 4: Port `axes.ts`

**Files:**
- Create: `react/src/data/axes.ts`

- [ ] **Step 1: Write `react/src/data/axes.ts`**

```ts
import type { Axis, AxisKey } from './types';

export const AXES: Record<AxisKey, Axis> = {
  A: {
    label: '人との関わり方',
    minus: '制度・仕組み',
    plus: '市民対話',
    color: '#E8534A',
    dark: '#C0392B',
    tint: '#FFF0EE',
    kanji_plus: '人',
    kanji_minus: '機',
    letter_plus: 'D',
    letter_minus: 'F',
    en_plus: 'Dialogue',
    en_minus: 'Framework',
  },
  B: {
    label: '仕事の進め方',
    minus: '政策立案',
    plus: '現場対応',
    color: '#4A90D9',
    dark: '#2E6DB4',
    tint: '#EBF3FC',
    kanji_plus: '動',
    kanji_minus: '策',
    letter_plus: 'A',
    letter_minus: 'P',
    en_plus: 'Action',
    en_minus: 'Policy',
  },
  C: {
    label: '担う役割',
    minus: 'ルール管理',
    plus: '市民支援',
    color: '#4CAF7D',
    dark: '#1E7345',
    tint: '#ECF8F1',
    kanji_plus: '援',
    kanji_minus: '律',
    letter_plus: 'S',
    letter_minus: 'R',
    en_plus: 'Support',
    en_minus: 'Rule',
  },
  D: {
    label: '変化への姿勢',
    minus: '革新推進',
    plus: '安定運営',
    color: '#9B59B6',
    dark: '#7B3F9E',
    tint: '#F5EDF8',
    kanji_plus: '守',
    kanji_minus: '革',
    letter_plus: 'C',
    letter_minus: 'I',
    en_plus: 'Conservation',
    en_minus: 'Innovation',
  },
  E: {
    label: '知識のスタイル',
    minus: '専門追求',
    plus: '幅広対応',
    color: '#F5A623',
    dark: '#9C6310',
    tint: '#FFF6E6',
    kanji_plus: '幅',
    kanji_minus: '専',
    letter_plus: 'G',
    letter_minus: 'X',
    en_plus: 'Generalist',
    en_minus: 'Expert',
  },
};
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/axes.ts
git commit -m "feat(data): port AXES with typed Axis records"
```

---

### Task 5: Port `questions.ts`

**Files:**
- Create: `react/src/data/questions.ts`

- [ ] **Step 1: Write `react/src/data/questions.ts`**

The `QUESTIONS` and `ORDER` arrays are copied verbatim from `src/scripts/01-data.js` lines 9–72 and converted to TS:

```ts
import type { Question } from './types';

export const QUESTIONS: readonly Question[] = [
  { id: 'A1', axis: 'A', reversed: false,
    scenario: '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。',
    options: ['自分には向いていないと思う','あまり気が乗らないが、こなせる','どちらとも言えない','やりがいを感じながら取り組める','まさに自分が輝ける場面'] },
  { id: 'B1', axis: 'B', reversed: false,
    scenario: '台風の翌朝、道路の損傷箇所を現場で確認しながら、修繕の優先順位を判断し作業を指揮する。',
    options: ['現場対応は自分には合わないと思う','あまり気が進まない','どちらとも言えない','現場感があって充実する','まさにこういう仕事がしたい'] },
  { id: 'C1', axis: 'C', reversed: false,
    scenario: '生活費に困っている市民が相談に訪れた。使える制度を複数調べて提案し、申請まで一緒に伴走する。',
    options: ['責任が重くて自分には難しい','あまり気が進まない','どちらとも言えない','力になれる実感がある','この種の仕事に最もやりがいを感じる'] },
  { id: 'D1', axis: 'D', reversed: false,
    scenario: '20年間変わらない手順で処理されてきた窓口業務を、正確に・丁寧にこなすことが求められている。',
    options: ['変化のない繰り返しはつらい','やれなくはないが、物足りない','どちらとも言えない','正確にこなすことに誇りを持てる','安定した仕事こそ自分に合っている'] },
  { id: 'E1', axis: 'E', reversed: false,
    scenario: '担当が決まっていない問い合わせが入った。専門外でも、関係部署に橋渡ししながら自分で対応を進める。',
    options: ['専門外の対応は不安が大きい','あまり得意ではない','どちらとも言えない','幅広く動ける方が自分には合っている','こういう縦横無尽な動き方が一番好き'] },
  { id: 'A2', axis: 'A', reversed: false,
    scenario: '地域の子育てサークルに出向き、参加者と直接会話しながら市の支援制度を紹介する。',
    options: ['人前で話すのが苦手で気が重い','できなくはないが、積極的にはやりたくない','どちらとも言えない','楽しみながら取り組める','こういう機会が増えるほどうれしい'] },
  { id: 'B2', axis: 'B', reversed: false,
    scenario: '「公園の照明が壊れている」と市民から連絡が入った。すぐ現地に向かって状況を確認し、即日対応する。',
    options: ['突発的な対応は苦手','できなくはないが、好まない','どちらとも言えない','すぐ動けると達成感がある','臨機応変に動ける場面が好き'] },
  { id: 'C2', axis: 'C', reversed: false,
    scenario: '障害のあるお子さんを抱えるご家族が、利用できるサービスがわからず不安そうにしている。丁寧に案内し、安心して帰ってもらう。',
    options: ['感情的に消耗しそうで苦手','あまり積極的にはなれない','どちらとも言えない','安心してもらえるとうれしい','こういう場面にいちばんやりがいを感じる'] },
  { id: 'D2', axis: 'D', reversed: false,
    scenario: '市民が毎年楽しみにしている年中行事を、例年通りの品質で滞りなく運営する役割を任されている。',
    options: ['毎年同じことの繰り返しは物足りない','あまり積極的になれない','どちらとも言えない','確実に運営できると満足感がある','こういう安定した役割が自分には向いている'] },
  { id: 'E2', axis: 'E', reversed: false,
    scenario: '大きなイベントの運営で、会場設営・広報・予算管理・関係者調整をすべて一手に担う。',
    options: ['何でも屋的な動き方は好きではない','あまり得意ではない','どちらとも言えない','幅広くこなせると充実する','何でもこなせることが自分の強み'] },
  { id: 'A3', axis: 'A', reversed: true,
    scenario: '複数部署にまたがる業務フローの非効率を発見し、新しい仕組みを設計して改善する。',
    options: ['あまりピンとこない','やれなくはないが、得意ではない','どちらとも言えない','達成感を感じながら取り組める','こういう仕事がいちばん好き'] },
  { id: 'B3', axis: 'B', reversed: true,
    scenario: '10年後の市の交通網を見据え、データをもとに都市交通計画の草案を半年かけて策定する。',
    options: ['長期的な計画づくりは性に合わない','あまり気が進まない','どちらとも言えない','じっくり取り組めて充実する','こういう構想を練る仕事が好き'] },
  { id: 'C3', axis: 'C', reversed: true,
    scenario: '飲食店の衛生検査で違反を発見した。改善指導を行い、基準を満たすまで営業停止の措置を取る。',
    options: ['厳しい措置を取るのは気が引ける','あまり得意ではない','どちらとも言えない','ルールを守らせることに使命感がある','こういう毅然とした対応が自分には向いている'] },
  { id: 'D3', axis: 'D', reversed: true,
    scenario: '紙で行われていた申請手続きをオンライン化するプロジェクトを立ち上げ、庁内の抵抗を説得しながら実現する。',
    options: ['反発を受けてまで変えるのは疲れる','あまり向いていないと思う','どちらとも言えない','変化を生み出すことに達成感がある','こういう改革推進こそ自分の役割だと思う'] },
  { id: 'E3', axis: 'E', reversed: true,
    scenario: '下水道管の老朽化調査のため、専門的な検査機器の使い方を習得し、データを解析して報告書をまとめる。',
    options: ['専門的な技術の習得は性に合わない','あまり気が進まない','どちらとも言えない','専門を深めることに達成感がある','こういう技術的な仕事こそ自分の強み'] },
  { id: 'A4', axis: 'A', reversed: true,
    scenario: '市の財政データを分析し、来年度の予算配分の最適案をまとめたレポートを作成する。',
    options: ['数字中心の仕事は気が進まない','やれなくはないが、得意ではない','どちらとも言えない','集中して取り組める','この種の分析業務が得意で楽しい'] },
  { id: 'B4', axis: 'B', reversed: true,
    scenario: '複数部署が関わる新規事業について、スケジュールと役割分担を整理し、全体の進行を管理する。',
    options: ['調整役はあまり向いていない','できなくはないが、得意ではない','どちらとも言えない','全体を動かす充実感がある','こういうコーディネートが得意'] },
  { id: 'C4', axis: 'C', reversed: true,
    scenario: '福祉施設の運営が適切かどうか、書類と現場を照らし合わせながら監査し、不正を見抜いて是正させる。',
    options: ['相手を追い詰めるようで気が引ける','あまり向いていないと思う','どちらとも言えない','公正さを守る仕事として納得できる','こういう監査・検査こそ自分の役割だと思う'] },
  { id: 'D4', axis: 'D', reversed: true,
    scenario: '他の自治体では前例のない市民参加型の政策立案プロセスを設計し、試験導入の提案をまとめる。',
    options: ['前例がないことは不安で気が進まない','あまり自信がない','どちらとも言えない','新しいものを生み出すおもしろさがある','ゼロから作る仕事がいちばん楽しい'] },
  { id: 'E4', axis: 'E', reversed: true,
    scenario: '地域の健康診断を担当し、専門知識をもとに住民一人ひとりに合わせた健康指導を行う。',
    options: ['専門知識で指導するのはプレッシャーに感じる','あまり自信がない','どちらとも言えない','専門を活かした指導に充実感がある','こういう専門職の役割が自分には最適'] },
];

export const ORDER: readonly string[] = [
  'A1','B1','C1','D1','E1',
  'A2','B2','C2','D2','E2',
  'A3','B3','C3','D3','E3',
  'A4','B4','C4','D4','E4',
];

export const QMAP: Record<string, Question> = Object.fromEntries(
  QUESTIONS.map(q => [q.id, q]),
);
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/questions.ts
git commit -m "feat(data): port QUESTIONS, ORDER, QMAP"
```

---

### Task 6: Port `divisions.ts` with `DIV_ABOUT` folded inline

**Files:**
- Create: `react/src/data/divisions.ts`
- Use as source: `src/scripts/01-data.js` lines 74–331 (DIVISIONS array)
- Use as source: `src/scripts/01b-descriptions.js` lines 1–256 (DIV_ABOUT object)

The 102 entries are large. To avoid manual transcription errors, do this with a one-shot Node script that produces the final TypeScript file, then delete the script.

- [ ] **Step 1: Write generator script**

Create `react/scripts/gen-divisions.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..', '..');

// Read the legacy JS files and evaluate them in a sandboxed scope so we get
// real DIVISIONS / DIV_ABOUT objects without parsing.
const dataJs = readFileSync(resolve(root, 'src/scripts/01-data.js'), 'utf8');
const descJs = readFileSync(resolve(root, 'src/scripts/01b-descriptions.js'), 'utf8');

// eslint-disable-next-line no-new-func
const fn = new Function(`
  ${dataJs}
  ${descJs}
  return { DIVISIONS, DIV_ABOUT };
`);
const { DIVISIONS, DIV_ABOUT } = fn();

const merged = DIVISIONS.map(d => {
  const key = d.dept + '|' + d.name;
  const about = DIV_ABOUT[key];
  return about ? { ...d, about } : { ...d };
});

const lines = merged.map(d => {
  const fields = [
    `dept: ${JSON.stringify(d.dept)}`,
    `name: ${JSON.stringify(d.name)}`,
    `en: ${JSON.stringify(d.en)}`,
    `A: ${d.A}`,
    `B: ${d.B}`,
    `C: ${d.C}`,
    `D: ${d.D}`,
    `E: ${d.E}`,
  ];
  if (d.about) fields.push(`about: ${JSON.stringify(d.about)}`);
  return `  { ${fields.join(', ')} },`;
});

const output = `import type { Division } from './types';

export const DIVISIONS: readonly Division[] = [
${lines.join('\n')}
];
`;

writeFileSync(resolve(root, 'react/src/data/divisions.ts'), output);
console.log(`Wrote ${merged.length} divisions`);
```

- [ ] **Step 2: Run generator**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
node react/scripts/gen-divisions.mjs
```

Expected: prints `Wrote 102 divisions` and creates `react/src/data/divisions.ts`.

- [ ] **Step 3: Spot-check first and last entry**

Open `react/src/data/divisions.ts` and confirm:
- First entry is `市長室 | 秘書課` with `A: 1.5, B: -0.5, C: 0.5, D: 0.5, E: 1.5` and an `about` field beginning `市長・副市長のスケジュール管理`.
- Last entry is `議会事務局 | 議事課` with `A: -0.5, B: 0.5, C: 0, D: 1.5, E: 0.5`.

- [ ] **Step 4: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 5: Delete generator script**

```bash
rm react/scripts/gen-divisions.mjs
rmdir react/scripts
```

- [ ] **Step 6: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/divisions.ts
git commit -m "feat(data): port DIVISIONS with DIV_ABOUT folded inline"
```

---

### Task 7: Port `archetypes.ts`

**Files:**
- Create: `react/src/data/archetypes.ts`

- [ ] **Step 1: Write `react/src/data/archetypes.ts`**

Copy verbatim from `src/scripts/02-types.js` lines 56–89 (the `TYPES` object). Wrap as a typed export:

```ts
import type { Archetype } from './types';

export const TYPES: Record<string, Archetype> = {
  'DASCG': { name: '街のよろず屋',       desc: '市民に寄り添いながら現場を駆け回り、幅広く対応できる万能タイプ。窓口でも地域でも「あの人に聞けば大丈夫」と頼られる存在です。' },
  'DASCX': { name: '福祉の守り手',       desc: '市民の声を直接聞きながら、専門知識で支援を届ける現場型の専門職。福祉や健康の分野で、かけがえのない力を発揮します。' },
  'DASIG': { name: '地域の風雲児',       desc: '現場で市民と関わりながら、新しい支援のかたちを次々と生み出す行動派。既存の枠にとらわれない発想力が持ち味です。' },
  'DASIX': { name: '開拓するプロ',       desc: '専門スキルを武器に現場で市民を支えつつ、支援の仕組みそのものを革新していくパイオニアです。' },
  'DARCG': { name: '秩序の番人',         desc: '市民と接しながらルールを守らせる、現場の要。幅広い知識で検査・指導を着実にこなす頼もしい存在です。' },
  'DARCX': { name: '現場の目利き',       desc: '専門的な基準に基づき、現場で的確に検査・監督を行うプロフェッショナル。衛生や安全を守る砦です。' },
  'DARIG': { name: '改革の現場指揮官',   desc: '現場感覚と広い視野を兼ね備え、ルールや制度を市民目線で作り変えていく実行力の持ち主です。' },
  'DARIX': { name: '制度を変える技術者', desc: '専門知識とルール運用の経験を活かし、制度そのものをより良い方向へ刷新していくタイプです。' },
  'DPSCG': { name: '支援の設計者',       desc: '市民の声を聴きながら、支援制度を広い視野で設計・運営する企画タイプ。温かさと戦略性を兼ね備えています。' },
  'DPSCX': { name: '福祉政策の知恵袋',   desc: '福祉の専門知識を活かし、市民を支える制度や事業を企画・運営する頭脳派。現場を知る参謀として活躍します。' },
  'DPSIG': { name: '共創のプロデューサー', desc: '市民参加を重視しながら、新しい支援の仕組みを幅広く構想するクリエイティブな企画者です。' },
  'DPSIX': { name: '社会変革の仕掛人',   desc: '専門的な視点と市民との対話を通じて、支援制度の根本的な改革を構想し推進するタイプです。' },
  'DPRCG': { name: '調整の達人',         desc: '対話力と企画力を武器に、ルールに基づく行政運営を幅広くコーディネートする万能型です。' },
  'DPRCX': { name: '法令の翻訳者',       desc: '専門的な法令知識を市民にわかりやすく届け、制度の安定運用を支える橋渡し役です。' },
  'DPRIG': { name: '改革の語り部',       desc: '市民との対話からルールや制度の課題を見つけ出し、幅広い視野で改革を企画・推進する変革リーダーです。' },
  'DPRIX': { name: '政策イノベーター',   desc: '専門知識と市民感覚を併せ持ち、規制や制度を根本から見直す――政策立案のスペシャリストです。' },
  'FASCG': { name: '縁の下の万能選手',   desc: '仕組みづくりが得意でありながら現場にも出向き、幅広いサポートを安定的に届ける実務家です。' },
  'FASCX': { name: '技術で支える人',     desc: '専門技術を駆使して現場で支援を届ける、寡黙ながら頼りになる技術系サポーターです。' },
  'FASIG': { name: '現場発の改善者',     desc: 'システム思考と現場経験を融合させ、支援の仕組みを幅広く改善していく――実行力のある改革者です。' },
  'FASIX': { name: '技術革新の推進者',   desc: '専門技術で現場の課題を解決しながら、支援システムの革新を推し進めるエンジニア気質のタイプです。' },
  'FARCG': { name: '堅実な管理者',       desc: '仕組みとルールに基づき、現場の維持管理を幅広く担う堅実な実務タイプ。施設管理や保守に強い適性があります。' },
  'FARCX': { name: 'インフラの匠',       desc: '高い専門性で設備やインフラの維持管理を担う職人気質のタイプ。水道・道路・施設など、暮らしの基盤を支えます。' },
  'FARIG': { name: '現場改革の実行者',   desc: 'ルール運用と現場経験を活かし、業務改善を幅広く実行に移していくアクション派です。' },
  'FARIX': { name: '技術革新の先導者',   desc: '専門分野の技術とルール知識を駆使し、現場のオペレーションを根本から革新するタイプです。' },
  'FPSCG': { name: '組織の潤滑油',       desc: '仕組みの設計と調整が得意で、幅広い視野から組織全体の支援体制を企画・維持する――まさに総務の要です。' },
  'FPSCX': { name: '制度設計の専門家',   desc: '専門知識を活かし、支援制度や事業の仕組みを裏側からしっかり設計・運営する頭脳派です。' },
  'FPSIG': { name: '変革の設計者',       desc: 'システム思考と幅広い視野で、組織の支援体制をゼロベースで再構築する改革志向の企画者です。' },
  'FPSIX': { name: '未来を描く技術者',   desc: '高度な専門知識で新しい支援システムを構想し、長期的な視点から制度改革を設計するビジョナリーです。' },
  'FPRCG': { name: '行政の守護者',       desc: '制度とルールの番人として、幅広い行政事務を安定的に企画・管理する堅実な組織人です。' },
  'FPRCX': { name: '精密な分析者',       desc: '専門的なデータ分析と制度知識で、ルールに基づく行政運営を精密に支える――組織の参謀役です。' },
  'FPRIG': { name: 'DX推進リーダー',     desc: '広い視野とシステム思考で、行政の業務プロセスやルールをデジタル化・効率化していく改革派です。' },
  'FPRIX': { name: '戦略のアーキテクト', desc: '高い専門性と制度への深い理解を武器に、行政の仕組みそのものを再設計する戦略家です。' },
};
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/archetypes.ts
git commit -m "feat(data): port TYPES (32 archetypes)"
```

---

### Task 8: Port `descriptions.ts` (axis tier descriptions + getter)

**Files:**
- Create: `react/src/data/descriptions.ts`

- [ ] **Step 1: Write `react/src/data/descriptions.ts`**

Copy `AXIS_DESC` from `src/scripts/01b-descriptions.js` lines 5–41, with type annotations:

```ts
import type { AxisKey, AxisDescTiers } from './types';

export const AXIS_DESC: Record<AxisKey, AxisDescTiers> = {
  A: {
    strong_plus:  'あなたは市民との直接的な対話に、大きな充実感を覚えるタイプです。窓口対応や地域活動など、人と向き合う場面で最も力を発揮します。相手の話に丁寧に耳を傾け、自然と信頼関係を築ける――それがあなたの持ち味です。',
    mild_plus:    '人と接する仕事にやりがいを感じやすいタイプです。対話の機会がある環境で、自然体で力を発揮できるでしょう。チームでの協力や市民との日常的なやり取りを通じて、仕事の手応えを実感できます。',
    neutral:      '人と接する仕事もデスクワークも、バランスよくこなせるタイプです。状況に応じて柔軟に切り替えられる適応力があります。対面業務と裏方業務を行き来しながら、幅広い場面で安定した力を発揮できるでしょう。',
    mild_minus:   'データや仕組みを扱う業務に適性があります。裏方から組織を支える役割が心地よく感じられるでしょう。正確な事務処理や制度運用を通じて、目立たなくても確実に組織へ貢献できるタイプです。',
    strong_minus: '制度設計やシステム構築など、仕組みで課題を解決するアプローチが得意です。分析的な視点で組織全体に貢献します。データに基づく客観的な判断力は、政策立案や業務改善の場面で大きな武器になるでしょう。',
  },
  B: {
    strong_plus:  '現場での即応力に優れ、実際に体を動かして結果を出すことに大きな充実感を覚えるタイプです。状況を素早く判断し、臨機応変に動ける力は、緊急対応や住民サービスの最前線で頼りにされます。',
    mild_plus:    '現場で直接行動することにやりがいを感じるタイプです。机上の計画よりも、実行を通じて学ぶ方が性に合っています。実際にやってみて改善するサイクルが得意で、現場の声を聞きながら仕事を前へ進められます。',
    neutral:      '現場対応と計画立案の両方にバランスよく取り組めるタイプです。状況に応じた切り替えが自然にできます。現場のリアルな課題を理解しつつ、それを俯瞰して整理できる――そのバランス感覚が強みです。',
    mild_minus:   '物事を俯瞰して計画を立てることが得意なタイプです。戦略的な思考で組織に貢献します。目の前の対応に追われるよりも、中長期の視点で業務を設計・改善していく仕事にやりがいを感じるでしょう。',
    strong_minus: '長期的な視野で政策や計画を練ることに強い適性があります。データに基づく構想力が大きな武器です。複雑な課題を整理し、根本的な解決策を設計する力は、行政の企画・計画部門で高く評価されるでしょう。',
  },
  C: {
    strong_plus:  '困っている人を支え、その人の状況を少しでも良くすることに深いやりがいを感じるタイプです。福祉・支援の最前線が活躍の場。一人ひとりの事情に寄り添い、必要な支援を届ける――その使命感があなたの原動力です。',
    mild_plus:    '市民をサポートし、安心を届けることに自然とやりがいを感じるタイプです。困りごとの相談を受けたり、手続きを手助けしたりする場面で、持ち前のホスピタリティが光ります。',
    neutral:      '支援とルール管理の両方にバランスよく対応できるタイプです。場面に応じて柔軟に役割を切り替えられます。市民の立場にも組織のルールにも配慮できるので、調整役として信頼される存在になれるでしょう。',
    mild_minus:   '基準や規則を適切に運用することに使命感を持てるタイプです。公正さを大切にする姿勢が強みです。法令や基準に基づいた正確な判断で、行政の信頼性を支える縁の下の力持ちとして力を発揮します。',
    strong_minus: '検査・監査・指導など、基準を守らせる仕事に強い適性があります。社会の秩序を守る番人的な存在です。ルールの本質を理解し、公平に適用する力は、市民の安全と信頼を守るうえで欠かせません。',
  },
  D: {
    strong_plus:  '安定した業務を着実にこなし、日々の積み重ねで信頼を築くことに価値を見出すタイプです。確実な仕事ぶりと丁寧さは、行政サービスの品質を支える大切な基盤。あなたがいるから安心できる、と頼られる存在です。',
    mild_plus:    '確立されたやり方を丁寧に守ることに安心感を覚えるタイプです。継続性を大切にする姿勢があります。安定した運営を維持しながら、必要に応じて小さな改善を積み重ねていくスタイルが合っています。',
    neutral:      '安定した運営も新しい挑戦も、どちらにも柔軟に対応できるバランス型です。既存の枠組みを尊重しつつ、より良い方法があれば積極的に取り入れる――そんな柔軟さが強みです。',
    mild_minus:   '新しいやり方や改善に前向きなタイプです。現状に満足せず、より良い方法を模索し続けます。「もっとこうした方がいいのでは？」という気づきを大切にし、周囲を巻き込みながら変化を起こせる人です。',
    strong_minus: '前例のない取り組みに強く惹かれるタイプです。改革や新規事業の推進で力を発揮するイノベーター。既存の枠組みにとらわれず、新しい仕組みや事業を構想し、実現まで導く推進力が際立っています。',
  },
  E: {
    strong_plus:  '幅広い業務を柔軟にこなす万能型です。部署を横断する調整力と対応力が大きな強み。異なる分野の知識をつなぎ合わせて課題を解決する力は、複雑な行政課題に取り組む場面で特に重宝されます。',
    mild_plus:    '特定の専門に縛られず、さまざまな業務に順応できる柔軟性があります。新しい分野でも素早く学び、一定の水準までキャッチアップできる適応力は、異動の多い行政組織で大きな武器になります。',
    neutral:      '専門性と幅広さのバランスが取れたタイプです。必要に応じてどちらの役割も担えます。得意分野を持ちつつ視野を広く保てるので、専門チームでもゼネラリストとしても活躍できるでしょう。',
    mild_minus:   '特定の分野を深く追求することに充実感を覚えるタイプです。専門知識を活かした仕事が向いています。ひとつの領域を深掘りし、その道のプロとして頼られる存在になれるポテンシャルを持っています。',
    strong_minus: '高い専門性を武器に、技術的・学術的な課題に取り組むスペシャリストです。資格や専門スキルを直接活かせる環境で輝きます。深い知識と経験に裏打ちされた判断力は、組織の中で唯一無二の存在感を放つでしょう。',
  },
};

export function getAxisDesc(axis: AxisKey, score: number): string {
  const d = AXIS_DESC[axis];
  if (score >= 1.0)   return d.strong_plus;
  if (score >= 0.25)  return d.mild_plus;
  if (score > -0.25)  return d.neutral;
  if (score > -1.0)   return d.mild_minus;
  return d.strong_minus;
}
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/data/descriptions.ts
git commit -m "feat(data): port AXIS_DESC and getAxisDesc()"
```

---

## Phase C — Pure Logic with TDD

### Task 9: Test scaffolding for `scoring.ts`

**Files:**
- Create: `react/src/lib/scoring.test.ts`

- [ ] **Step 1: Write the failing test file**

```ts
import { describe, it, expect } from 'vitest';
import { scoreResp } from './scoring';

describe('scoreResp', () => {
  it('returns r-3 when not reversed', () => {
    expect(scoreResp(3, false)).toBe(0);
    expect(scoreResp(5, false)).toBe(2);
    expect(scoreResp(1, false)).toBe(-2);
  });
  it('returns -(r-3) when reversed', () => {
    expect(scoreResp(3, true)).toBe(0);
    expect(scoreResp(5, true)).toBe(-2);
    expect(scoreResp(1, true)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

```bash
cd react && npm test
```

Expected: fails with module-not-found error for `./scoring`.

---

### Task 10: Implement `scoreResp`

**Files:**
- Create: `react/src/lib/scoring.ts`

- [ ] **Step 1: Write minimal implementation**

```ts
import type { Response } from '../data/types';

export function scoreResp(r: Response, reversed: boolean): number {
  const v = r - 3;
  return reversed ? -v : v;
}
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd react && npm test
```

Expected: 2 tests passing in `scoring.test.ts`.

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/lib/scoring.ts react/src/lib/scoring.test.ts
git commit -m "feat(lib): add scoreResp with tests"
```

---

### Task 11: Add `axisScores` (TDD)

**Files:**
- Modify: `react/src/lib/scoring.test.ts`
- Modify: `react/src/lib/scoring.ts`

- [ ] **Step 1: Append failing tests**

Add to `react/src/lib/scoring.test.ts`:

```ts
import { axisScores } from './scoring';
import type { Responses } from '../data/types';

describe('axisScores', () => {
  it('returns 0 for every axis when no responses', () => {
    expect(axisScores({})).toEqual({ A: 0, B: 0, C: 0, D: 0, E: 0 });
  });
  it('averages signed responses per axis, honoring reversed flag', () => {
    const resp: Responses = { A1: 5, A3: 5 }; // A1 not reversed → +2; A3 reversed → -2
    expect(axisScores(resp).A).toBeCloseTo(0);
    expect(axisScores(resp).B).toBeCloseTo(0);
  });
  it('produces 2 when only positive non-reversed answer is provided for axis', () => {
    const resp: Responses = { A1: 5 };
    expect(axisScores(resp).A).toBeCloseTo(2);
  });
  it('produces -2 when reversed Q1 answered as 5', () => {
    const resp: Responses = { A3: 5 };
    expect(axisScores(resp).A).toBeCloseTo(-2);
  });
});
```

- [ ] **Step 2: Run tests, expect failures**

```bash
cd react && npm test
```

Expected: import-not-found errors for `axisScores`.

- [ ] **Step 3: Implement `axisScores`**

Add to `react/src/lib/scoring.ts`:

```ts
import type { AxisKey, Responses } from '../data/types';
import { AX } from '../data/types';
import { QMAP } from '../data/questions';

export function axisScores(resp: Responses): Record<AxisKey, number> {
  const buckets: Record<AxisKey, number[]> = { A: [], B: [], C: [], D: [], E: [] };
  for (const [id, r] of Object.entries(resp)) {
    const q = QMAP[id];
    if (!q) continue;
    buckets[q.axis].push(scoreResp(r, q.reversed));
  }
  const out = {} as Record<AxisKey, number>;
  for (const ax of AX) {
    const a = buckets[ax];
    out[ax] = a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  }
  return out;
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd react && npm test
```

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/lib/scoring.ts react/src/lib/scoring.test.ts
git commit -m "feat(lib): add axisScores aggregation with tests"
```

---

### Task 12: Add `dist`, `fitPct`, `MAX_D`, `rankAll` (TDD)

**Files:**
- Modify: `react/src/lib/scoring.test.ts`
- Modify: `react/src/lib/scoring.ts`

- [ ] **Step 1: Append failing tests**

```ts
import { dist, fitPct, rankAll } from './scoring';
import type { Division } from '../data/types';

describe('dist', () => {
  const u = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const d: Division = { dept: 'X', name: 'Y', en: 'Z', A: 0, B: 0, C: 0, D: 0, E: 0 };
  it('returns 0 for identical vectors', () => {
    expect(dist(u, d)).toBe(0);
  });
  it('is symmetric in shifted single axis', () => {
    const d2: Division = { ...d, A: 2 };
    expect(dist(u, d2)).toBeCloseTo(2);
  });
});

describe('fitPct', () => {
  it('returns 100 at distance 0', () => {
    expect(fitPct(0)).toBe(100);
  });
  it('returns 0 at maximum distance sqrt(80)', () => {
    expect(fitPct(Math.sqrt(80))).toBe(0);
  });
});

describe('rankAll', () => {
  it('returns 102 ranked divisions sorted descending by fit', () => {
    const ranked = rankAll({ A1: 5 });
    expect(ranked).toHaveLength(102);
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i].fit).toBeGreaterThanOrEqual(ranked[i + 1].fit);
    }
  });
  it('attaches user scores to every entry', () => {
    const ranked = rankAll({ A1: 5 });
    expect(ranked[0].user).toEqual({ A: 2, B: 0, C: 0, D: 0, E: 0 });
  });
});
```

- [ ] **Step 2: Run tests, expect failures**

```bash
cd react && npm test
```

- [ ] **Step 3: Implement the new functions**

Append to `react/src/lib/scoring.ts`:

```ts
import type { Division, RankedDivision } from '../data/types';
import { DIVISIONS } from '../data/divisions';

export const MAX_D = Math.sqrt(5 * 16); // sqrt(80) ≈ 8.944

export function dist(
  u: Record<AxisKey, number>,
  d: Division | Record<AxisKey, number>,
): number {
  return Math.sqrt(AX.reduce((s, ax) => s + (u[ax] - d[ax]) ** 2, 0));
}

export function fitPct(d: number): number {
  return Math.round((1 - d / MAX_D) * 1000) / 10;
}

export function rankAll(resp: Responses): RankedDivision[] {
  const u = axisScores(resp);
  return DIVISIONS
    .map((d): RankedDivision => ({ ...d, user: u, fit: fitPct(dist(u, d)) }))
    .sort((a, b) => b.fit - a.fit);
}
```

If TypeScript reports duplicate type imports, consolidate the import lines at the top of the file into one:

```ts
import type { AxisKey, Responses, Response, Division, RankedDivision } from '../data/types';
import { AX } from '../data/types';
import { QMAP } from '../data/questions';
import { DIVISIONS } from '../data/divisions';
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd react && npm test
```

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/lib/scoring.ts react/src/lib/scoring.test.ts
git commit -m "feat(lib): add dist, fitPct, rankAll"
```

---

### Task 13: Add `determineType` (TDD)

**Files:**
- Modify: `react/src/lib/scoring.test.ts`
- Modify: `react/src/lib/scoring.ts`

- [ ] **Step 1: Append failing tests**

```ts
import { determineType } from './scoring';

describe('determineType', () => {
  it('all-positive scores produce DASCG ("街のよろず屋")', () => {
    const t = determineType({ A: 1, B: 1, C: 1, D: 1, E: 1 });
    expect(t.code).toBe('DASCG');
    expect(t.name).toBe('街のよろず屋');
  });
  it('all-zero scores still pick letter_plus → DASCG', () => {
    const t = determineType({ A: 0, B: 0, C: 0, D: 0, E: 0 });
    expect(t.code).toBe('DASCG');
  });
  it('all-negative scores produce FPRIX ("戦略のアーキテクト")', () => {
    const t = determineType({ A: -1, B: -1, C: -1, D: -1, E: -1 });
    expect(t.code).toBe('FPRIX');
    expect(t.name).toBe('戦略のアーキテクト');
  });
  it('returns a fallback Archetype with code preserved when TYPES has no entry', () => {
    // synthesize a code that is not in TYPES is not possible by pure scoring inputs,
    // so this test is more documentation. determineType(x) for any 5-axis score
    // must return an entry whose code property matches the constructed code.
    const t = determineType({ A: 1, B: -1, C: 1, D: -1, E: 1 });
    expect(t.code.length).toBe(5);
  });
});
```

- [ ] **Step 2: Run tests, expect failures**

```bash
cd react && npm test
```

- [ ] **Step 3: Implement `determineType`**

Append to `react/src/lib/scoring.ts`:

```ts
import { AXES } from '../data/axes';
import { TYPES } from '../data/archetypes';
import type { ResolvedArchetype } from '../data/types';

export function determineType(
  userScores: Record<AxisKey, number>,
): ResolvedArchetype {
  const code = AX.map(ax =>
    userScores[ax] >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus,
  ).join('');
  const t = TYPES[code] ?? {
    name: '探究者',
    desc: 'あなたは独自のバランス感覚を持つタイプです。',
  };
  return { code, ...t };
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd react && npm test
```

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/lib/scoring.ts react/src/lib/scoring.test.ts
git commit -m "feat(lib): add determineType with archetype lookup"
```

---

### Task 14: Add `scoreToPct` and `fitColor` (no tests — pure shape, used in render only)

**Files:**
- Modify: `react/src/lib/scoring.ts`

These are presentation helpers ported from `src/scripts/05-helpers.js`. They are exercised by visual smoke and don't justify dedicated unit tests.

- [ ] **Step 1: Append to `react/src/lib/scoring.ts`**

```ts
export function scoreToPct(score: number): { pct: number; isPlus: boolean } {
  const isPlus = score >= 0;
  const pct = Math.round(50 + (Math.abs(score) / 2) * 50);
  return { pct, isPlus };
}

export function fitColor(p: number): { text: string; fill: string; bg: string } {
  if (p >= 80) return { text: '#1E7345', fill: '#4CAF7D', bg: '#ECF8F1' };
  if (p >= 60) return { text: '#2E6DB4', fill: '#4A90D9', bg: '#EBF3FC' };
  if (p >= 45) return { text: '#9C6310', fill: '#F5A623', bg: '#FFF6E6' };
  return { text: '#C0392B', fill: '#E8534A', bg: '#FFF0EE' };
}
```

- [ ] **Step 2: Verify compile and tests still green**

```bash
cd react && npx tsc -b --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/lib/scoring.ts
git commit -m "feat(lib): add presentation helpers scoreToPct, fitColor"
```

---

## Phase D — Store

### Task 15: Reducer with TDD

**Files:**
- Create: `react/src/state/reducer.ts`
- Create: `react/src/state/reducer.test.ts`

The reducer is split out from the React provider so it can be tested without React, then imported by `store.tsx`.

- [ ] **Step 1: Write the failing test file**

```ts
import { describe, it, expect } from 'vitest';
import { reducer, initial, type State, type Action } from './reducer';
import { ORDER } from '../data/questions';

describe('reducer', () => {
  it('initial state is welcome', () => {
    expect(initial.screen).toBe('welcome');
    expect(initial.step).toBe(0);
    expect(initial.resp).toEqual({});
  });

  it('START moves to quiz and clears resp', () => {
    const after = reducer({ ...initial, resp: { A1: 5 } }, { type: 'START' });
    expect(after.screen).toBe('quiz');
    expect(after.step).toBe(0);
    expect(after.resp).toEqual({});
  });

  it('ANSWER records the response and advances step', () => {
    const s1 = reducer({ ...initial, screen: 'quiz' }, { type: 'ANSWER', value: 5 });
    expect(s1.resp[ORDER[0]]).toBe(5);
    expect(s1.step).toBe(1);
  });

  it('final ANSWER transitions to results screen', () => {
    let s: State = { ...initial, screen: 'quiz', step: ORDER.length - 1 };
    const last = reducer(s, { type: 'ANSWER', value: 4 });
    expect(last.screen).toBe('results');
    expect(last.sel).toBe(0);
    expect(last.traitIdx).toBe(0);
  });

  it('BACK respects step floor at 0', () => {
    const s = reducer({ ...initial, screen: 'quiz', step: 0 }, { type: 'BACK' });
    expect(s.step).toBe(0);
  });

  it('BACK decrements step', () => {
    const s = reducer({ ...initial, screen: 'quiz', step: 5 }, { type: 'BACK' });
    expect(s.step).toBe(4);
  });

  it('SEL sets the selected division index', () => {
    const s = reducer({ ...initial, screen: 'results' }, { type: 'SEL', idx: 7 });
    expect(s.sel).toBe(7);
  });

  it('TPREV wraps from 0 to 4', () => {
    const s = reducer({ ...initial, traitIdx: 0 }, { type: 'TPREV' });
    expect(s.traitIdx).toBe(4);
  });

  it('TNEXT wraps from 4 to 0', () => {
    const s = reducer({ ...initial, traitIdx: 4 }, { type: 'TNEXT' });
    expect(s.traitIdx).toBe(0);
  });

  it('TAXS maps an axis key to its index', () => {
    const s = reducer(initial, { type: 'TAXS', axis: 'C' });
    expect(s.traitIdx).toBe(2);
  });

  it('RETAKE resets to welcome and clears resp', () => {
    const s = reducer(
      { screen: 'results', step: 19, resp: { A1: 5 }, sel: 3, traitIdx: 2 },
      { type: 'RETAKE' },
    );
    expect(s.screen).toBe('welcome');
    expect(s.resp).toEqual({});
    expect(s.step).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests, expect failures**

```bash
cd react && npm test
```

- [ ] **Step 3: Implement the reducer**

Create `react/src/state/reducer.ts`:

```ts
import type { AxisKey, Responses, Response } from '../data/types';
import { AX } from '../data/types';
import { ORDER } from '../data/questions';

export type Screen = 'welcome' | 'quiz' | 'results';

export type State = {
  screen: Screen;
  step: number;
  resp: Responses;
  sel: number;
  traitIdx: number;
};

export type Action =
  | { type: 'START' }
  | { type: 'ANSWER'; value: Response }
  | { type: 'BACK' }
  | { type: 'SEL'; idx: number }
  | { type: 'TPREV' }
  | { type: 'TNEXT' }
  | { type: 'TAXS'; axis: AxisKey }
  | { type: 'RETAKE' };

export const initial: State = {
  screen: 'welcome',
  step: 0,
  resp: {},
  sel: 0,
  traitIdx: 0,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'quiz', step: 0, resp: {} };

    case 'ANSWER': {
      const id = ORDER[state.step];
      const resp: Responses = { ...state.resp, [id]: action.value };
      if (state.step < ORDER.length - 1) {
        return { ...state, resp, step: state.step + 1 };
      }
      return { ...state, resp, screen: 'results', sel: 0, traitIdx: 0 };
    }

    case 'BACK':
      return { ...state, step: Math.max(0, state.step - 1) };

    case 'SEL':
      return { ...state, sel: action.idx };

    case 'TPREV':
      return { ...state, traitIdx: (state.traitIdx + 4) % 5 };

    case 'TNEXT':
      return { ...state, traitIdx: (state.traitIdx + 1) % 5 };

    case 'TAXS':
      return { ...state, traitIdx: AX.indexOf(action.axis) };

    case 'RETAKE':
      return { ...initial };
  }
}
```

- [ ] **Step 4: Run tests, verify pass**

```bash
cd react && npm test
```

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/state/reducer.ts react/src/state/reducer.test.ts
git commit -m "feat(state): add reducer with full action coverage tests"
```

---

### Task 16: Provider, Context, and hooks

**Files:**
- Create: `react/src/state/store.tsx`

- [ ] **Step 1: Write `react/src/state/store.tsx`**

```tsx
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import { reducer, initial, type State, type Action } from './reducer';
import { axisScores, determineType, rankAll } from '../lib/scoring';
import type { AxisKey, RankedDivision, ResolvedArchetype } from '../data/types';

type StoreValue = { state: State; dispatch: Dispatch<Action> };

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}

export type Derived = {
  userScores: Record<AxisKey, number>;
  type: ResolvedArchetype;
  results: RankedDivision[];
};

export function useDerived(): Derived {
  const { state } = useStore();
  return useMemo(() => {
    const userScores = axisScores(state.resp);
    return {
      userScores,
      type: determineType(userScores),
      results: rankAll(state.resp),
    };
  }, [state.resp]);
}
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/state/store.tsx
git commit -m "feat(state): add Context StoreProvider with useStore and useDerived hooks"
```

---

## Phase E — Global Styles

### Task 17: Port global stylesheets

**Files:**
- Create: `react/src/styles/tokens.css`
- Create: `react/src/styles/reset.css`
- Create: `react/src/styles/layout.css`
- Modify: `react/src/main.tsx`

- [ ] **Step 1: Write `react/src/styles/tokens.css`**

Copy the entire contents of `src/styles/01-tokens.css` (62 lines) verbatim into `react/src/styles/tokens.css`.

- [ ] **Step 2: Write `react/src/styles/reset.css`**

Copy the entire contents of `src/styles/02-reset.css` (22 lines) verbatim into `react/src/styles/reset.css`.

- [ ] **Step 3: Write `react/src/styles/layout.css`**

Copy `src/styles/03-layout.css` and `src/styles/10-utilities.css` verbatim. Replace the `#app` selector with `#root` (Vite's mount point):

```css
body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#root {
  width: 100%;
  max-width: var(--app-max);
  padding: 0 var(--sp-lg) var(--sp-2xl);
}

.content-w {
  max-width: var(--content-max);
  margin-left: auto;
  margin-right: auto;
}

.card {
  background: var(--card);
  border-radius: var(--card-r);
  padding: var(--card-pad);
  box-shadow: var(--card-shadow);
}

.section-gap { margin-top: var(--sp-lg); }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}

.truncate {
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
```

- [ ] **Step 4: Import the global stylesheets in `main.tsx`**

Replace `react/src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/layout.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log(
  '%c横須賀市役所 部署タイプ診断 %c\n内部向けの遊び。気軽にどうぞ。',
  'font-weight:700; font-size:13px; color:#1C2340;',
  'font-size:11px; color:#6B7280;',
);
```

- [ ] **Step 5: Verify build still works**

```bash
cd react && npm run build
```

- [ ] **Step 6: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/styles/ react/src/main.tsx
git commit -m "feat(styles): port global tokens, reset, layout stylesheets"
```

---

## Phase F — Bootstrap shell + Welcome screen

### Task 18: AppShell component

**Files:**
- Create: `react/src/components/AppShell.tsx`

The AppShell wraps every screen, performs scroll-to-top on screen change, and moves keyboard focus to the page's primary heading.

- [ ] **Step 1: Write `react/src/components/AppShell.tsx`**

```tsx
import { useEffect, type ReactNode } from 'react';
import { useStore } from '../state/store';

export function AppShell({ children }: { children: ReactNode }) {
  const { state } = useStore();

  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLHeadingElement>('h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [state.screen]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/AppShell.tsx
git commit -m "feat: add AppShell with focus and scroll management"
```

---

### Task 19: Wire `App.tsx` with provider and screen switch

**Files:**
- Modify: `react/src/App.tsx`

- [ ] **Step 1: Replace `react/src/App.tsx`**

```tsx
import { StoreProvider, useStore } from './state/store';
import { AppShell } from './components/AppShell';
import { Welcome } from './screens/Welcome';
import { Quiz } from './screens/Quiz';
import { Results } from './screens/Results';

function ScreenSwitch() {
  const { state } = useStore();
  if (state.screen === 'welcome') return <Welcome />;
  if (state.screen === 'quiz') return <Quiz />;
  return <Results />;
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell>
        <ScreenSwitch />
      </AppShell>
    </StoreProvider>
  );
}
```

The screens do not exist yet — TypeScript will error. Tasks 20–28 add them.

---

### Task 20: Welcome screen

**Files:**
- Create: `react/src/screens/Welcome.tsx`
- Create: `react/src/screens/Welcome.module.css`

- [ ] **Step 1: Write `react/src/screens/Welcome.module.css`**

Copy the entire contents of `src/styles/04-welcome.css` into `react/src/screens/Welcome.module.css`. Strip the leading `/* ── 04-welcome.css ── */` comment if present. The class selectors stay the same; CSS Modules will hash them when imported.

- [ ] **Step 2: Write `react/src/screens/Welcome.tsx`**

```tsx
import { useStore } from '../state/store';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import s from './Welcome.module.css';

export function Welcome() {
  const { dispatch } = useStore();

  const pills = AX.map(ax => {
    const a = AXES[ax];
    return (
      <span
        key={ax}
        className={s.apill}
        style={{ background: a.tint, color: a.dark }}
      >
        {a.label}
      </span>
    );
  });

  return (
    <>
      <div className={s['w-header']}>
        <div className={s['w-city']}>Yokosuka City Hall</div>
        <h1 className={s['w-title']}>
          横須賀市役所
          <br />
          部署タイプ診断
        </h1>
        <p className={s['w-sub']}>
          20の質問に答えるだけで、
          <br />
          あなたにぴったりの課が見つかります
        </p>
      </div>
      <div className="card">
        <div className={s['axis-pills']}>{pills}</div>
        <p className={s['w-intro']}>
          5つの視点からあなたの「働き方タイプ」を診断し、全102課の中から相性の高い部署をランキングでご紹介します。
        </p>
        <div className={s['w-steps']}>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>1</span>
            <span>20の仕事場面に、あなたがどう感じるか回答</span>
          </div>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>2</span>
            <span>5つの軸であなたの「働き方タイプ」を診断</span>
          </div>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>3</span>
            <span>全102課との相性をランキングで発表！</span>
          </div>
        </div>
        <div className={s['w-stats']}>
          <div className={s.stat}>
            <div className={s['stat-n']}>20</div>
            <div className={s['stat-l']}>質問数</div>
          </div>
          <div className={s.stat}>
            <div className={s['stat-n']}>5</div>
            <div className={s['stat-l']}>診断軸</div>
          </div>
          <div className={s.stat}>
            <div className={s['stat-n']}>102</div>
            <div className={s['stat-l']}>対象の課</div>
          </div>
        </div>
        <button
          className={s['btn-start']}
          onClick={() => dispatch({ type: 'START' })}
        >
          診断をはじめる →
        </button>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verify compile (other screens still missing — Quiz/Results stubs needed below before whole-app build)**

Move on; full build verification happens after Task 28.

---

### Task 21: Quiz screen + ProgressBar

**Files:**
- Create: `react/src/screens/Quiz.tsx`
- Create: `react/src/screens/Quiz.module.css`
- Create: `react/src/components/ProgressBar.tsx`
- Create: `react/src/components/ProgressBar.module.css`

- [ ] **Step 1: Write `react/src/screens/Quiz.module.css`**

Copy the entire contents of `src/styles/05-quiz.css` into `react/src/screens/Quiz.module.css`.

- [ ] **Step 2: Write `react/src/components/ProgressBar.module.css`**

Move the `.prog-wrap`, `.prog-bar`, `.seg`, `.seg.done`, `.seg.cur` rules out of `Quiz.module.css` and into `ProgressBar.module.css`. Final contents:

```css
.prog-wrap { padding: 20px 0 var(--sp-md); }
.prog-bar { display: flex; gap: 3px; }
.seg {
  flex: 1; height: 6px; border-radius: 999px;
  background: var(--border);
  transition: background .25s;
}
.seg.done { background: var(--c); }
.seg.cur  { background: var(--c); opacity: .4; }
```

After moving, delete those five rules from `Quiz.module.css` so they don't duplicate.

- [ ] **Step 3: Write `react/src/components/ProgressBar.tsx`**

```tsx
import { ORDER, QMAP } from '../data/questions';
import { AXES } from '../data/axes';
import s from './ProgressBar.module.css';

export function ProgressBar({ step }: { step: number }) {
  return (
    <div className={s['prog-wrap']}>
      <div
        className={s['prog-bar']}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={ORDER.length}
        aria-valuenow={step + 1}
        aria-label={`進捗 ${step + 1} / ${ORDER.length}`}
      >
        {ORDER.map((id, i) => {
          const c = AXES[QMAP[id].axis].color;
          let cls = s.seg;
          if (i < step) cls += ' ' + s.done;
          else if (i === step) cls += ' ' + s.cur;
          return (
            <div
              key={id}
              className={cls}
              style={{ ['--c' as never]: c } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `react/src/screens/Quiz.tsx`**

```tsx
import { useStore } from '../state/store';
import { ORDER, QMAP } from '../data/questions';
import { AXES } from '../data/axes';
import { ProgressBar } from '../components/ProgressBar';
import s from './Quiz.module.css';

export function Quiz() {
  const { state, dispatch } = useStore();
  const qid = ORDER[state.step];
  const q = QMAP[qid];
  const ax = AXES[q.axis];

  const prev = state.resp[qid];
  const total = ORDER.length;
  const remaining = total - state.step - 1;
  let flourish = '';
  if (state.step === 0) flourish = 'ゆっくり考えて大丈夫です';
  else if (remaining === 1) flourish = 'あと2問';
  else if (remaining === 0) flourish = 'ラスト1問！';

  return (
    <div className={s['quiz-content']}>
      <ProgressBar step={state.step} />
      <div className={s['quiz-meta']}>
        <span className={s['q-num']}>
          Q.{state.step + 1} <span aria-hidden="true">/</span> {ORDER.length}
          {flourish && <span className={s['q-flourish']}>{flourish}</span>}
        </span>
        <span
          className={s['axis-tag']}
          style={{ background: ax.tint, color: ax.dark }}
        >
          {ax.label}
        </span>
      </div>
      <h1 className={s.scenario} style={{ color: ax.dark }}>
        {q.scenario}
      </h1>
      <p className={s['opts-label']} id={`opts-label-${state.step}`}>
        この場面、あなたにはどのくらい合っていますか？
      </p>
      <div role="group" aria-labelledby={`opts-label-${state.step}`}>
        {q.options.map((o, i) => {
          const value = (i + 1) as 1 | 2 | 3 | 4 | 5;
          const isSelected = prev === value;
          return (
            <button
              key={i}
              className={s.opt}
              style={
                isSelected
                  ? { borderColor: ax.dark, background: ax.tint }
                  : undefined
              }
              onClick={() => dispatch({ type: 'ANSWER', value })}
            >
              <span className={s['opt-num']} style={{ color: ax.dark }}>
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {state.step > 0 && (
        <button
          className={s['btn-back']}
          onClick={() => dispatch({ type: 'BACK' })}
        >
          ← 戻る
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 6: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/screens/Welcome.tsx react/src/screens/Welcome.module.css \
        react/src/screens/Quiz.tsx react/src/screens/Quiz.module.css \
        react/src/components/ProgressBar.tsx react/src/components/ProgressBar.module.css \
        react/src/App.tsx
git commit -m "feat: add Welcome, Quiz, and ProgressBar (Results stub follows)"
```

(If `App.tsx` still imports a missing `Results`, add a temporary stub before committing — see Task 22's Step 1 stub note.)

---

### Task 22: Results stub (so app compiles before full build-out)

**Files:**
- Create: `react/src/screens/Results.tsx` (temporary stub, replaced fully in Task 28)

- [ ] **Step 1: Write a minimal `Results.tsx` stub**

```tsx
import { useStore } from '../state/store';

export function Results() {
  const { dispatch } = useStore();
  return (
    <div>
      <h1>Results (placeholder)</h1>
      <button onClick={() => dispatch({ type: 'RETAKE' })}>もう一度やってみる</button>
    </div>
  );
}
```

- [ ] **Step 2: Verify the app builds and dev server runs end-to-end**

```bash
cd react && npm run build
cd react && npm run dev -- --port 5174
```

Manually verify:
1. Welcome screen renders with all axis pills, steps, and stats.
2. Clicking 「診断をはじめる」 advances to Quiz Q1.
3. Answering Q1–Q20 advances correctly; the back button works on Q2+.
4. After Q20, the placeholder Results screen renders. 「もう一度やってみる」 returns to Welcome.

- [ ] **Step 3: Commit (smoke checkpoint)**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/screens/Results.tsx
git commit -m "chore: stub Results screen for end-to-end navigation smoke test"
```

---

## Phase G — Results screen build-out

### Task 23: TypeReveal component

**Files:**
- Create: `react/src/components/TypeReveal.tsx`
- Create: `react/src/components/TypeReveal.module.css`

- [ ] **Step 1: Write `react/src/components/TypeReveal.module.css`**

Copy the entire contents of `src/styles/06-results-type.css` into `react/src/components/TypeReveal.module.css`.

- [ ] **Step 2: Write `react/src/components/TypeReveal.tsx`**

```tsx
import { useDerived } from '../state/store';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import s from './TypeReveal.module.css';

export function TypeReveal() {
  const { type, userScores } = useDerived();
  return (
    <div className={s['type-banner']}>
      <div className={s['type-pre']}>あなたのタイプ</div>
      <div className={s['type-chips']}>
        {AX.map(ax => {
          const a = AXES[ax];
          const kanji = userScores[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
          return (
            <div
              key={ax}
              className={s['type-chip']}
              style={{ background: a.tint, color: a.dark }}
            >
              {kanji}
            </div>
          );
        })}
      </div>
      <h1 className={s['type-name']}>「{type.name}」型</h1>
      <div className={s['type-code']}>{type.code}</div>
      <div className={s['type-desc']}>{type.desc}</div>
    </div>
  );
}
```

- [ ] **Step 3: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 4: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/TypeReveal.tsx react/src/components/TypeReveal.module.css
git commit -m "feat(results): add TypeReveal component"
```

---

### Task 24: TraitsPanel + TraitCarousel + TraitBar

**Files:**
- Create: `react/src/components/TraitsPanel.tsx`
- Create: `react/src/components/TraitsPanel.module.css`
- Create: `react/src/components/TraitCarousel.tsx`
- Create: `react/src/components/TraitCarousel.module.css`
- Create: `react/src/components/TraitBar.tsx`
- Create: `react/src/components/TraitBar.module.css`

The CSS source for this entire group is `src/styles/07-results-axes.css` (206 lines). Split it across the three component modules along these prefixes:
- `.traits-grid`, `.bars-panel`, generic grid utilities → **TraitsPanel.module.css**
- `.tc-*` (carousel rules) → **TraitCarousel.module.css**
- `.trait`, `.trait--active`, `.trait-*` (compact bar rules) → **TraitBar.module.css**

If the split is fiddly, an acceptable shortcut is to put all 206 lines in **TraitsPanel.module.css** and have the children import the same module via a relative path (`import s from '../TraitsPanel/TraitsPanel.module.css'`). The plan favors the clean split.

- [ ] **Step 1: Split CSS into three module files** (per the rules above)

- [ ] **Step 2: Write `react/src/components/TraitBar.tsx`**

```tsx
import { useStore } from '../state/store';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
import { scoreToPct } from '../lib/scoring';
import s from './TraitBar.module.css';

export function TraitBar({
  axis,
  score,
  active,
}: {
  axis: AxisKey;
  score: number;
  active: boolean;
}) {
  const { dispatch } = useStore();
  const a = AXES[axis];
  const { pct, isPlus } = scoreToPct(score);
  const winLabel = isPlus ? a.plus : a.minus;
  const dotLeft = ((score + 2) / 4) * 100;

  return (
    <button
      type="button"
      className={`${s.trait}${active ? ' ' + s['trait--active'] : ''}`}
      onClick={() => dispatch({ type: 'TAXS', axis })}
      aria-pressed={active}
    >
      <div className={s['trait-header']}>
        <span className={s['trait-pct']} style={{ color: a.dark }}>{pct}%</span>
        <span className={s['trait-win']} style={{ color: a.dark }}>{winLabel}</span>
      </div>
      <div className={s['trait-bar-row']}>
        <span className={s['trait-end']}>{a.kanji_minus}</span>
        <div className={s['trait-track']} style={{ background: a.color }}>
          <div
            className={s['trait-dot']}
            style={{ left: `${dotLeft.toFixed(0)}%`, borderColor: a.dark }}
          />
        </div>
        <span className={s['trait-end']}>{a.kanji_plus}</span>
      </div>
    </button>
  );
}
```

- [ ] **Step 3: Write `react/src/components/TraitCarousel.tsx`**

```tsx
import { useStore, useDerived } from '../state/store';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import { getAxisDesc } from '../data/descriptions';
import { scoreToPct } from '../lib/scoring';
import s from './TraitCarousel.module.css';

export function TraitCarousel() {
  const { state, dispatch } = useStore();
  const { userScores } = useDerived();
  const ax = AX[state.traitIdx];
  const score = userScores[ax];
  const a = AXES[ax];
  const { pct: _pct, isPlus } = scoreToPct(score);
  void _pct;
  const winLabel = isPlus ? a.plus : a.minus;
  const desc = getAxisDesc(ax, score);
  const dotLeft = ((score + 2) / 4) * 100;
  const winKanji = isPlus ? a.kanji_plus : a.kanji_minus;

  return (
    <>
      <div className={s['tc-axis-label']}>{a.label}</div>
      <div className={s['tc-hero']} style={{ color: a.dark }}>
        <span className={s['tc-kanji']} style={{ background: a.tint }}>{winKanji}</span>
        <span className={s['tc-win']}>{winLabel}</span>
      </div>
      <div className={s['tc-bar-row']}>
        <span className={s['tc-end']}>{a.minus}</span>
        <div className={s['tc-track']} style={{ background: a.color }}>
          <div
            className={s['tc-marker']}
            style={{ left: `${dotLeft.toFixed(0)}%`, borderColor: a.dark }}
          />
        </div>
        <span className={s['tc-end']}>{a.plus}</span>
      </div>
      <div className={s['tc-desc']}>{desc}</div>
      <div className={s['tc-nav-row']}>
        <button className={s['tc-nav']} onClick={() => dispatch({ type: 'TPREV' })}>‹</button>
        <div className={s['tc-dots']}>
          {AX.map((_, i) => (
            <span
              key={i}
              className={`${s['tc-dot']}${i === state.traitIdx ? ' ' + s['tc-dot--on'] : ''}`}
              style={i === state.traitIdx ? { background: a.color } : undefined}
            />
          ))}
        </div>
        <button className={s['tc-nav']} onClick={() => dispatch({ type: 'TNEXT' })}>›</button>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Write `react/src/components/TraitsPanel.tsx`**

```tsx
import { useStore, useDerived } from '../state/store';
import { AX } from '../data/types';
import { TraitCarousel } from './TraitCarousel';
import { TraitBar } from './TraitBar';
import s from './TraitsPanel.module.css';

export function TraitsPanel() {
  const { state } = useStore();
  const { userScores } = useDerived();

  return (
    <div className={`${s['traits-grid']} section-gap`}>
      <div className={`card ${s['tc-panel']}`}>
        <TraitCarousel />
      </div>
      <div className={`card ${s['bars-panel']}`}>
        {AX.map((ax, i) => (
          <TraitBar
            key={ax}
            axis={ax}
            score={userScores[ax]}
            active={i === state.traitIdx}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 6: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/TraitsPanel.tsx react/src/components/TraitsPanel.module.css \
        react/src/components/TraitCarousel.tsx react/src/components/TraitCarousel.module.css \
        react/src/components/TraitBar.tsx react/src/components/TraitBar.module.css
git commit -m "feat(results): add TraitsPanel, TraitCarousel, TraitBar"
```

---

### Task 25: FitRing + ComparisonBars

**Files:**
- Create: `react/src/components/FitRing.tsx`
- Create: `react/src/components/ComparisonBars.tsx`
- Create: `react/src/components/ComparisonBars.module.css`

- [ ] **Step 1: Write `react/src/components/FitRing.tsx`**

```tsx
type Props = {
  pct: number;
  fillColor: string;
  textColor: string;
};

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FitRing({ pct, fillColor, textColor }: Props) {
  const filled = (pct / 100) * CIRCUMFERENCE;
  return (
    <div className="fit-display">
      <div className="fit-arc">
        <svg width={56} height={56} viewBox="0 0 56 56">
          <circle
            cx={28} cy={28} r={RADIUS}
            fill="none" stroke="#E4E7ED" strokeWidth={6}
          />
          <circle
            cx={28} cy={28} r={RADIUS}
            fill="none"
            stroke={fillColor}
            strokeWidth={6}
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <div className="fit-text">
        <span className="fit-pct" style={{ color: textColor }}>{pct}%</span>
        <span className="fit-lbl">相性度</span>
      </div>
    </div>
  );
}
```

(`fit-display`, `fit-arc`, `fit-text`, `fit-pct`, `fit-lbl` come from the global match CSS in Task 27 — they live as global selectors in `MatchDetail.module.css` via `:global(...)` wrappers, see Task 27.)

- [ ] **Step 2: Write `react/src/components/ComparisonBars.module.css`**

Extract `.comp-row`, `.comp-axis`, `.comp-pair`, `.comp-who`, `.comp-track`, `.comp-track--div`, `.comp-dot`, `.comp-ends`, `.comp-label` rules from `src/styles/08-results-match.css` and put them in `react/src/components/ComparisonBars.module.css`. The remaining match selectors stay for Task 27.

- [ ] **Step 3: Write `react/src/components/ComparisonBars.tsx`**

```tsx
import { AX } from '../data/types';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
import s from './ComparisonBars.module.css';

function toFill(v: number) {
  return (((v + 2) / 4) * 100).toFixed(0);
}

export function ComparisonBars({
  user,
  division,
}: {
  user: Record<AxisKey, number>;
  division: Record<AxisKey, number>;
}) {
  return (
    <>
      <div className={s['comp-label']}>相性の内訳</div>
      {AX.map(ax => {
        const a = AXES[ax];
        const uPct = toFill(user[ax]);
        const dPct = toFill(division[ax]);
        return (
          <div key={ax} className={s['comp-row']}>
            <div className={s['comp-axis']} style={{ color: a.dark }}>{a.label}</div>
            <div className={s['comp-pair']}>
              <span className={s['comp-who']}>あなた</span>
              <div className={s['comp-track']} style={{ background: a.color }}>
                <div
                  className={s['comp-dot']}
                  style={{ left: `${uPct}%`, borderColor: a.dark }}
                />
              </div>
            </div>
            <div className={s['comp-pair']}>
              <span className={s['comp-who']}>この課</span>
              <div
                className={`${s['comp-track']} ${s['comp-track--div']}`}
                style={{ background: a.color }}
              >
                <div
                  className={s['comp-dot']}
                  style={{ left: `${dPct}%`, borderColor: a.dark }}
                />
              </div>
            </div>
            <div className={s['comp-ends']}>
              <span>{a.minus}</span>
              <span>{a.plus}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
```

- [ ] **Step 4: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 5: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/FitRing.tsx \
        react/src/components/ComparisonBars.tsx react/src/components/ComparisonBars.module.css
git commit -m "feat(results): add FitRing and ComparisonBars"
```

---

### Task 26: MatchList + MatchDetail + MatchBrowse

**Files:**
- Create: `react/src/components/MatchList.tsx`
- Create: `react/src/components/MatchList.module.css`
- Create: `react/src/components/MatchDetail.tsx`
- Create: `react/src/components/MatchDetail.module.css`
- Create: `react/src/components/MatchBrowse.tsx`
- Create: `react/src/components/MatchBrowse.module.css`

- [ ] **Step 1: Split match CSS across the three modules**

`src/styles/08-results-match.css` and `src/styles/09-results-list.css` together define the rules. Distribute:
- `.match-section`, `.match-section-title`, `.match-section-sub`, `.match-browse`, `.detail-col`, `.bottom-actions`, `.btn-share`, `.btn-retake` → **MatchBrowse.module.css**
- `.all-list`, `.all-list--side`, `.all-item`, `.all-item.on`, `.all-rn`, `.all-info`, `.all-name`, `.all-dept`, `.all-fit` → **MatchList.module.css**
- `.match-card`, `.match-top`, `.div-dept`, `.div-name`, `.div-about` → **MatchDetail.module.css**
- `.fit-display`, `.fit-arc`, `.fit-text`, `.fit-pct`, `.fit-lbl` (used by FitRing globally) → in **MatchDetail.module.css**, wrap as `:global(...)` so FitRing's plain class names continue to match:

```css
:global(.fit-display) {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
:global(.fit-arc) {
  width: 56px; height: 56px;
  flex-shrink: 0;
}
:global(.fit-text) {
  display: flex;
  flex-direction: column;
}
:global(.fit-pct) {
  font-size: 28px;
  font-weight: var(--fw-black);
  line-height: 1;
}
:global(.fit-lbl) {
  font-size: var(--fs-xs);
  color: var(--sub);
  font-weight: var(--fw-bold);
  letter-spacing: .06em;
  margin-top: 2px;
}
```

(Rationale: FitRing uses no scoped classes — its styles live as global selectors so any consumer can render it without importing a separate stylesheet.)

- [ ] **Step 2: Write `react/src/components/MatchList.tsx`**

```tsx
import { useStore } from '../state/store';
import type { RankedDivision } from '../data/types';
import { fitColor } from '../lib/scoring';
import s from './MatchList.module.css';

export function MatchList({ items }: { items: RankedDivision[] }) {
  const { state, dispatch } = useStore();
  return (
    <div className={`${s['all-list']} ${s['all-list--side']}`}>
      {items.map((d, i) => {
        const fc = fitColor(d.fit);
        const isOn = i === state.sel;
        return (
          <button
            key={`${d.dept}|${d.name}`}
            type="button"
            className={`${s['all-item']}${isOn ? ' ' + s.on : ''}`}
            onClick={() => dispatch({ type: 'SEL', idx: i })}
            aria-pressed={isOn}
          >
            <span className={s['all-rn']}>{i + 1}</span>
            <div className={s['all-info']}>
              <div className={s['all-name']}>{d.name}</div>
              <div className={s['all-dept']}>{d.dept}</div>
            </div>
            <span className={s['all-fit']} style={{ color: fc.text }}>{d.fit}%</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Write `react/src/components/MatchDetail.tsx`**

```tsx
import type { RankedDivision } from '../data/types';
import { fitColor } from '../lib/scoring';
import { FitRing } from './FitRing';
import { ComparisonBars } from './ComparisonBars';
import s from './MatchDetail.module.css';

export function MatchDetail({ division }: { division: RankedDivision }) {
  const fc = fitColor(division.fit);
  return (
    <div className={`card ${s['match-card']}`}>
      <div className={s['match-top']}>
        <FitRing pct={division.fit} fillColor={fc.fill} textColor={fc.text} />
        <div>
          <div className={s['div-dept']}>{division.dept}</div>
          <div className={s['div-name']}>{division.name}</div>
          <div className={s['div-about']}>{division.about ?? ''}</div>
        </div>
      </div>
      <ComparisonBars user={division.user} division={division} />
    </div>
  );
}
```

- [ ] **Step 4: Write `react/src/components/MatchBrowse.tsx`**

```tsx
import { useStore, useDerived } from '../state/store';
import { MatchList } from './MatchList';
import { MatchDetail } from './MatchDetail';
import { RetakeButton } from './RetakeButton';
import s from './MatchBrowse.module.css';

export function MatchBrowse() {
  const { state } = useStore();
  const { results } = useDerived();
  const selected = results[state.sel];

  return (
    <div className={`${s['match-section']} section-gap`}>
      <div className={s['match-section-title']}>あなたに合う課</div>
      <div className={s['match-section-sub']}>
        5つの軸のプロファイルを比較して相性を算出しています
      </div>
      <div className={s['match-browse']}>
        <MatchList items={results} />
        <div className={s['detail-col']}>
          <MatchDetail division={selected} />
        </div>
      </div>
      <div className={s['bottom-actions']}>
        <RetakeButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 6: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/MatchList.tsx react/src/components/MatchList.module.css \
        react/src/components/MatchDetail.tsx react/src/components/MatchDetail.module.css \
        react/src/components/MatchBrowse.tsx react/src/components/MatchBrowse.module.css
git commit -m "feat(results): add MatchList, MatchDetail, MatchBrowse"
```

---

### Task 27: RetakeButton

**Files:**
- Create: `react/src/components/RetakeButton.tsx`
- Create: `react/src/components/RetakeButton.module.css`

- [ ] **Step 1: Write `react/src/components/RetakeButton.module.css`**

Move the `.btn-retake` rules out of `MatchBrowse.module.css` (which received them from `09-results-list.css` in Task 26) and into this new module. Drop the unused `.btn-share` rules entirely — share is removed:

```css
.btn-retake {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--hall-indigo);
  border-radius: 12px;
  font-size: 14px; font-weight: var(--fw-bold);
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  transition: background .15s ease-out, color .15s ease-out;
  background: var(--card);
  color: var(--hall-indigo);
}
.btn-retake:hover { background: var(--hall-indigo); color: white; }
.btn-retake:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Write `react/src/components/RetakeButton.tsx`**

```tsx
import { useStore } from '../state/store';
import s from './RetakeButton.module.css';

export function RetakeButton() {
  const { dispatch } = useStore();
  return (
    <button
      className={s['btn-retake']}
      type="button"
      onClick={() => dispatch({ type: 'RETAKE' })}
    >
      もう一度やってみる
    </button>
  );
}
```

- [ ] **Step 3: Verify compile**

```bash
cd react && npx tsc -b --noEmit
```

- [ ] **Step 4: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/components/RetakeButton.tsx react/src/components/RetakeButton.module.css
git commit -m "feat(results): add RetakeButton"
```

---

### Task 28: Final Results screen composition

**Files:**
- Modify: `react/src/screens/Results.tsx` (replace stub from Task 22)
- Create: `react/src/screens/Results.module.css` (may end up empty if no screen-specific rules)

- [ ] **Step 1: Replace `react/src/screens/Results.tsx`**

```tsx
import { TypeReveal } from '../components/TypeReveal';
import { TraitsPanel } from '../components/TraitsPanel';
import { MatchBrowse } from '../components/MatchBrowse';

export function Results() {
  return (
    <>
      <TypeReveal />
      <TraitsPanel />
      <MatchBrowse />
    </>
  );
}
```

- [ ] **Step 2: Verify compile and tests stay green**

```bash
cd react && npx tsc -b --noEmit && npm test
```

- [ ] **Step 3: Commit**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git add react/src/screens/Results.tsx
git commit -m "feat: assemble final Results screen"
```

---

## Phase H — Browser smoke test and design fidelity

### Task 29: Manual browser smoke test

No code changes. The goal is to verify the React build matches the legacy `dist/index.html` behaviorally.

- [ ] **Step 1: Open both versions side by side**

Terminal 1:
```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
python3 build.py
python3 -m http.server 5173 --directory dist
```

Terminal 2:
```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz/react
npm run dev -- --port 5174
```

- [ ] **Step 2: Walk through each screen on both ports**

For each, compare visually and confirm parity:

- **Welcome**: header, axis pills (5 colors), 3 step rows, 3 stat tiles, start button.
- **Quiz**: progress bar (5-color segments), Q.N indicator, axis tag, scenario text, 5 option buttons, back button on Q2+. Selecting an option already answered shows highlighted border.
- **Results**: type banner (chips, name, code, desc), traits panel (carousel left, 5 bars right; clicking a bar updates carousel), match browse (102-item list, detail card with fit ring, comparison bars), retake button.
- **Retake** returns to Welcome with cleared state.
- **Keyboard**: tab through all interactive elements, headings receive focus on screen change.
- **Reduced motion**: enable `prefers-reduced-motion` in DevTools rendering tab; transitions should be near-instant.

Document any visual deltas. Resolve them in subsequent commits before continuing.

- [ ] **Step 3: Verify production build**

```bash
cd react && npm run build && npm run preview -- --port 5175
```

Sanity-check the same flows against the production preview.

- [ ] **Step 4: No commit unless code changed**

If the smoke test surfaced fixes, commit each as a separate `fix(...)` commit and re-run smoke. Otherwise proceed.

---

## Phase I — Cutover

### Task 30: Promote `react/` to project root

This task removes the legacy code and moves the React app to the top level. **Confirm everything works first** (Task 29 must be clean).

**Files:**
- Move: `react/*` → repository root
- Delete: `src/scripts/`, `src/styles/`, `src/index.html`, `build.py`, `dist/`
- Verify-then-delete: `matcher.py` (only delete after confirming nothing imports it)

- [ ] **Step 1: Confirm `matcher.py` is unused**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
grep -r "matcher" --include="*.py" --include="*.js" --include="*.ts" --include="*.html" --include="*.json" || true
```

If the only matches are inside `matcher.py` itself or git/log files, it is safe to delete.

- [ ] **Step 2: Move legacy directories aside**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
git rm -r src dist
git rm build.py
# only if Step 1 confirmed it's unused:
git rm matcher.py
```

- [ ] **Step 3: Promote `react/` contents to root**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
mv react/src ./src
mv react/index.html ./index.html
mv react/package.json ./package.json
mv react/package-lock.json ./package-lock.json
mv react/tsconfig.json ./tsconfig.json
mv react/tsconfig.app.json ./tsconfig.app.json
mv react/tsconfig.node.json ./tsconfig.node.json
mv react/vite.config.ts ./vite.config.ts
mv react/eslint.config.js ./eslint.config.js
mv react/.gitignore ./react.gitignore.tmp # don't overwrite root .gitignore
rm -rf react/node_modules react/dist
rmdir react
```

(File names from the Vite scaffold may vary slightly across versions; adjust as needed.)

- [ ] **Step 4: Update root `.gitignore`**

Replace `/Users/quinnngo/Desktop/projects/yokosuka-division-quiz/.gitignore` contents:

```
.DS_Store
node_modules/
dist/
build/
*.log
.env
.env.local
.vite/
```

(Old Python and `react/` entries removed.) Then delete the temporary `react.gitignore.tmp` file:

```bash
rm react.gitignore.tmp
```

- [ ] **Step 5: Reinstall and rebuild from root**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
npm install
npm run build
```

Expected: clean build, `dist/` created at root.

- [ ] **Step 6: Final smoke test from root**

```bash
npm run dev
```

Walk through all three screens once more.

- [ ] **Step 7: Commit cutover**

```bash
git add -A
git commit -m "chore: cutover to React SPA — remove legacy build, promote react/ to root"
```

---

### Task 31: Project README

**Files:**
- Create or replace: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# 横須賀市役所 部署タイプ診断 (Yokosuka City Hall Department Type Quiz)

Internal personality quiz for Yokosuka City Hall staff. 20 questions on five axes, one of 32 archetypes, all 102 departments ranked by fit. No backend, no database, runs entirely in the browser.

## Stack

React 18, TypeScript, Vite, Vitest, CSS Modules.

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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add project README"
```

---

### Task 32: Final verification

- [ ] **Step 1: Clean install and full test/build cycle**

```bash
cd /Users/quinnngo/Desktop/projects/yokosuka-division-quiz
rm -rf node_modules dist
npm install
npm run lint
npm test
npm run build
npm run preview
```

Walk through all screens in the preview server. Confirm:
1. All three screens render correctly.
2. Quiz flow completes end-to-end.
3. Retake works.
4. No TypeScript errors.
5. No ESLint errors.
6. All tests pass.

- [ ] **Step 2: Confirm git status is clean**

```bash
git status
```

Expected: nothing to commit.

The migration is complete.

---

## Out-of-scope reminder (do not implement here)

- Share-by-URL was removed in this migration; PNG-export share is a future enhancement (see spec §11).
- No component-level tests, no E2E tests, no routing, no global state library.
