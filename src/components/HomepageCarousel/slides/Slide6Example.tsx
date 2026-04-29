import s from './Slide6Example.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';
import { TYPES } from '../../../data/archetypes';

/*
  Slide 5 (Example)
  Question: "What does a real result look like?"
  Slide 4 showed the result page abstractly (annotated regions). This slide
  fills the same shape with one specific person's real outcome. Same persona
  used on Slides 3 & 4 (with D nudged from 0 to +1 so the ranking has visible
  variation between 1st and 2nd place) — the carousel arc reads as one
  continuous story: input → scoring → comparison → result structure → result
  filled in.
  Persona profile {A:+2, B:+1, C:+2, D:+1, E:0} resolves to archetype DASCG
  (街のよろず屋). All five ranked divisions below are real entries from
  divisions.json with their real axis values; match % is computed from L1
  distance against the persona over five −2..+2 axes (max distance = 20).
  Color discipline: axis colors appear ONLY on the 5 axis profile rows.
  Indigo carries the archetype focal type and the #1 rank chip. Everything
  else is grayscale + hairline borders, matching Slides 1–4 and the chrome.
*/

// Persona profile (continued from Slides 3 & 4).
const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 1, E: 0 };

// Real divisions from divisions.json — top-5 closest to PROFILE by L1 distance.
type DivRow = {
  name: string;
  dept: string;
  profile: Record<AxisKey, number>;
};
const DIVISIONS: DivRow[] = [
  { name: '生活支援課',       dept: '福祉こども部',           profile: { A: 2, B: 1, C: 2, D: 1, E:  0 } },
  { name: '子育て支援課',     dept: '福祉こども部',           profile: { A: 2, B: 0, C: 2, D: 0, E:  0 } },
  { name: 'こども家庭支援課', dept: 'こども家庭支援センター', profile: { A: 2, B: 1, C: 2, D: 0, E: -1 } },
  { name: '障害福祉課',       dept: '福祉こども部',           profile: { A: 2, B: 0, C: 2, D: 0, E:  0 } },
  { name: '介護保険課',       dept: '福祉こども部',           profile: { A: 1, B: 0, C: 1, D: 1, E: -1 } },
];

const AXIS_RANGE = 4;
const MAX_TOTAL_DIST = AXIS_RANGE * AX.length; // 20
function distance(p: Record<AxisKey, number>): number {
  return AX.reduce((sum, a) => sum + Math.abs(PROFILE[a] - p[a]), 0);
}
function matchPct(p: Record<AxisKey, number>): number {
  return Math.round(((MAX_TOTAL_DIST - distance(p)) / MAX_TOTAL_DIST) * 100);
}
function pos(value: number): number {
  return ((value + 2) / 4) * 100;
}

const RANKED = DIVISIONS
  .map((d) => ({ ...d, dist: distance(d.profile), match: matchPct(d.profile) }))
  .sort((a, b) => a.dist - b.dist);

// Archetype code from the profile: each axis picks plus or minus letter
// depending on sign (0 takes the plus side — matches archetype lookup).
const ARCH_CODE = AX.map((ax) => {
  const v = PROFILE[ax];
  return v >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus;
}).join('');
const ARCHETYPE = TYPES[ARCH_CODE]; // DASCG → 街のよろず屋

export function Slide6Example() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 05 · 例</h2>
        <div className={s.stripe} />
        <p className={s.sub}>とある受検者の、実際の結果。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.caption}>
          <span className={s.captionLabel}>受検者の結果</span>
          <span className={s.captionMeta}>架空の例</span>
        </figcaption>

        {/* ── Block 01: archetype hero (the focal point) ───────── */}
        <section className={s.arch} aria-label="アーキタイプ">
          <div className={s.archCode} aria-hidden="true">
            {ARCH_CODE.split('').map((ch, i) => (
              <span key={i} className={s.archChip}>{ch}</span>
            ))}
          </div>
          <h3 className={s.archName}>{ARCHETYPE.name}</h3>
          <p className={s.archDesc}>{ARCHETYPE.desc}</p>
        </section>

        {/* ── Block 02: 5-axis profile ─────────────────────────── */}
        <section className={s.profile} aria-label="5軸プロファイル">
          <div className={s.blockHead}>
            <span className={s.blockLabel}>5軸プロファイル</span>
            <span className={s.blockMeta}>32種から1つ</span>
          </div>
          <ol className={s.axisList}>
            {AX.map((ax) => {
              const v = PROFILE[ax];
              const ax_ = AXES[ax];
              const sideLabel = v > 0 ? ax_.plus : v < 0 ? ax_.minus : '中立';
              return (
                <li key={ax} className={s.axisRow}>
                  <span
                    className={s.axisChip}
                    style={{ background: ax_.tint, color: ax_.dark }}
                    aria-hidden="true"
                  >
                    {ax}
                  </span>
                  <span className={s.axisName}>{ax_.label}</span>
                  <span className={s.axisLine} aria-hidden="true">
                    <span className={s.axisRail} />
                    <span className={s.axisMid} />
                    <span
                      className={s.axisMark}
                      style={{ left: `${pos(v)}%`, background: ax_.dark }}
                    />
                  </span>
                  <span
                    className={s.axisSide}
                    style={{ color: v === 0 ? 'var(--sub)' : ax_.dark }}
                  >
                    {sideLabel}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ── Block 03: ranked divisions ───────────────────────── */}
        <section className={s.rank} aria-label="部署ランキング">
          <div className={s.blockHead}>
            <span className={s.blockLabel}>部署ランキング</span>
            <span className={s.blockMeta}>103課中 · 上位5</span>
          </div>
          <ol className={s.rankList}>
            {RANKED.map((d, i) => {
              const focal = i === 0;
              return (
                <li
                  key={d.name}
                  className={`${s.rankRow} ${focal ? s.rankFocal : ''}`}
                >
                  <span className={s.rankNum}>{i + 1}</span>
                  <span className={s.rankName}>
                    <span className={s.rankDept}>{d.dept}</span>
                    <span className={s.rankDiv}>{d.name}</span>
                  </span>
                  <span className={s.rankBarWrap} aria-hidden="true">
                    <span
                      className={s.rankBar}
                      style={{ width: `${d.match}%` }}
                    />
                  </span>
                  <span className={s.rankPct}>{d.match}%</span>
                </li>
              );
            })}
          </ol>
        </section>

        <p className={s.foot}>
          全20問に答えると、この1ページがあなたのものになる。
        </p>
      </figure>
    </div>
  );
}
