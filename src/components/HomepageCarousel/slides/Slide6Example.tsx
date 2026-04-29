import s from './Slide6Example.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';
import { TYPES } from '../../../data/archetypes';
import { dist, fitPct, fitColor, scoreToPct } from '../../../lib/scoring';

/*
  Slide 5 (Example) — "What does a real result look like?"

  This is the FINAL slide. It shows a literal slice of the real result page,
  fully populated, no annotations, no labels saying "this is region 02". Same
  persona arc as Slides 2–4 ({A:+2, B:+1, C:+2, D:+1, E:0} → DASCG 街のよろず屋).

  Three regions, primitive-faithful at full fidelity:
    1. Hero (TypeReveal)   — dark indigo banner, kanji chips, 「name」型, code, desc.
                             LARGEST element on the slide; anchors the eye.
    2. Trait profile (TraitBar) — 5 rows: pct + win label in axis-dark above a
                             fat 12px axis-color track with a 16px white dot.
    3. Top divisions (MatchList) — numbered rows from real divisions.json with
                             green fit pcts via fitColor (proves "out of 103").
*/

// Persona profile (continues the arc from Slides 2–4).
const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 1, E: 0 };

// Resolve archetype: each axis picks plus/minus letter from sign (0 → plus side,
// matching determineType in lib/scoring.ts). Yields DASCG → 街のよろず屋.
const ARCHETYPE_CODE = AX.map((ax) => {
  const v = PROFILE[ax];
  return v >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus;
}).join('');
const ARCHETYPE = TYPES[ARCHETYPE_CODE];

// Top-5 real divisions for this persona, computed via fitPct/dist against
// real axis values from src/data/divisions.ts (verified offline against the
// full 103-row table — these are the actual top 5).
type DivRow = {
  name: string;
  dept: string;
  profile: Record<AxisKey, number>;
};
const CANDIDATES: DivRow[] = [
  { name: '地域福祉課',         dept: '福祉こども部',           profile: { A: 1.5, B: 1,   C: 2,   D: 1,   E: 0   } },
  { name: '生活支援課',         dept: '福祉こども部',           profile: { A: 2,   B: 0.5, C: 2,   D: 0.5, E: 0.5 } },
  { name: '障害福祉課',         dept: '福祉こども部',           profile: { A: 2,   B: 0,   C: 2,   D: 0,   E: 0.5 } },
  { name: '市営住宅課',         dept: '都市部',                 profile: { A: 1,   B: 0.5, C: 1.5, D: 1.5, E: 0   } },
  { name: '子育て支援課',       dept: '福祉こども部',           profile: { A: 2,   B: 0,   C: 2,   D: 0,   E: 0.5 } },
];
const RANKED = CANDIDATES
  .map((d) => ({ ...d, fit: Math.round(fitPct(dist(PROFILE, d.profile))) }))
  .sort((a, b) => b.fit - a.fit);

// −2..+2 → 0..100 left% (TraitBar idiom).
const dotLeft = (v: number) => (((v + 2) / 4) * 100).toFixed(0);

export function Slide6Example() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 05 · 例</h2>
        <div className={s.stripe} />
        <p className={s.sub}>とある受検者の、実際の結果。</p>
      </header>

      <div className={s.result} aria-label="結果ページ（例）">
        {/* ── 1. TypeReveal hero ─────────────────────────────────── */}
        <section className={s.hero}>
          <div className={s.heroPre}>あなたのタイプ</div>
          <div className={s.heroChips}>
            {AX.map((ax) => {
              const a = AXES[ax];
              const v = PROFILE[ax];
              const kanji = v >= 0 ? a.kanji_plus : a.kanji_minus;
              return (
                <div
                  key={ax}
                  className={s.heroChip}
                  style={{ background: a.tint, color: a.dark }}
                >
                  {kanji}
                </div>
              );
            })}
          </div>
          <div className={s.heroName}>「{ARCHETYPE.name}」型</div>
          <div className={s.heroCode}>{ARCHETYPE_CODE}</div>
          <p className={s.heroDesc}>{ARCHETYPE.desc}</p>
        </section>

        {/* ── 2. TraitBar profile ────────────────────────────────── */}
        <section className={s.traits} aria-label="5軸プロファイル">
          <ul className={s.traitList}>
            {AX.map((ax) => {
              const a = AXES[ax];
              const v = PROFILE[ax];
              const { pct, isPlus } = scoreToPct(v);
              const winLabel = isPlus ? a.plus : a.minus;
              const left = dotLeft(v);
              return (
                <li key={ax} className={s.trait}>
                  <div className={s.traitHeader}>
                    <span className={s.traitPct} style={{ color: a.dark }}>
                      {pct}%
                    </span>
                    <span className={s.traitWin} style={{ color: a.dark }}>
                      {winLabel}
                    </span>
                  </div>
                  <div className={s.traitBarRow}>
                    <span className={s.traitEnd}>{a.kanji_minus}</span>
                    <div
                      className={s.traitTrack}
                      style={{ background: a.color }}
                    >
                      <div
                        className={s.traitDot}
                        style={{ left: `${left}%`, borderColor: a.dark }}
                      />
                    </div>
                    <span className={s.traitEnd}>{a.kanji_plus}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ── 3. MatchList ─────────────────────────────────────────── */}
        <section className={s.ranking} aria-label="部署ランキング 上位5">
          <div className={s.rankingHead}>
            <span className={s.rankingTitle}>あなたに合う部署</span>
            <span className={s.rankingMeta}>103課中 上位5</span>
          </div>
          <ul className={s.allList}>
            {RANKED.map((d, i) => {
              const fc = fitColor(d.fit);
              return (
                <li key={`${d.dept}|${d.name}`} className={s.allItem}>
                  <span className={s.allRn}>{i + 1}</span>
                  <div className={s.allInfo}>
                    <div className={s.allName}>{d.name}</div>
                    <div className={s.allDept}>{d.dept}</div>
                  </div>
                  <span className={s.allFit} style={{ color: fc.text }}>
                    {d.fit}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
