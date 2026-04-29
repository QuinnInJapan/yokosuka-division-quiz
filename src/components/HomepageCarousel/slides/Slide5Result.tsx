import s from './Slide5Result.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';
import { TYPES } from '../../../data/archetypes';
import { dist, fitPct, fitColor, scoreToPct } from '../../../lib/scoring';

/*
  Slide 4 (Result) — "What do I see at the end?"

  Visual contract: this slide IS the result page, miniaturized and stacked.
  We render the three real result-page primitives at smaller scale so the
  preview reads as a true peek at the live product:

    01 — TypeReveal hero   (dark indigo bg, 5 kanji chips, 「name」型, code, desc)
    02 — TraitBar profile  (5 fat axis-colored bars, 16px white dots, kanji ends)
    03 — MatchList ranking (numbered rows, green fit pcts via fitColor)

  Annotation numerals (01/02/03) sit in the LEFT gutter outside each region —
  they label, they don't compete. Indigo, all-caps, numeric only.

  Persona profile {A:2,B:1,C:2,D:1,E:0} matches the arc used in Slides 2–3,
  resolves to archetype code DASCG → 「街のよろず屋」.
*/

const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 1, E: 0 };

// Resolve archetype code from PROFILE (D is +1 → 守, E is 0 → defaults to plus side G)
const ARCHETYPE_CODE = AX.map((ax) => {
  const v = PROFILE[ax];
  return v >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus;
}).join('');
const ARCHETYPE = TYPES[ARCHETYPE_CODE];

// Real divisions from divisions.json with their real axis profiles.
type DivRow = {
  name: string;
  dept: string;
  profile: Record<AxisKey, number>;
};
const CANDIDATES: DivRow[] = [
  { name: '生活支援課',           dept: '福祉こども部',         profile: { A: 2, B: 0.5, C: 2,   D: 0.5, E: 0.5 } },
  { name: '子育て支援課',         dept: '福祉こども部',         profile: { A: 2, B: 0,   C: 2,   D: 0,   E: 0.5 } },
  { name: 'こども家庭支援課',     dept: 'こども家庭支援センター', profile: { A: 2, B: 0.5, C: 2,   D: 0,   E: -1  } },
  { name: '地域コミュニティ支援課', dept: '地域支援部',           profile: { A: 2, B: 0.5, C: 2,   D: 0.5, E: 1.5 } },
];
const RANKED = CANDIDATES
  .map((d) => ({ ...d, fit: Math.round(fitPct(dist(PROFILE, d.profile))) }))
  .sort((a, b) => b.fit - a.fit);

// Map score -2..+2 → 0..100 left% (TraitBar idiom).
const dotLeft = (v: number) => (((v + 2) / 4) * 100).toFixed(0);

export function Slide5Result() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 04 · 結果</h2>
        <div className={s.stripe} />
        <p className={s.sub}>1ページに、3つの答えが並ぶ。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.caption}>
          <span className={s.captionLabel}>結果ページの構成</span>
          <span className={s.captionMeta}>3 ブロック</span>
        </figcaption>

        <div className={s.preview} aria-label="結果ページのプレビュー">
          {/* ── 01 · Archetype hero (TypeReveal) ─────────────────── */}
          <section className={s.region}>
            <span className={s.annot} aria-hidden="true">01</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>アーキタイプ</div>
              <div className={s.heroBanner}>
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
                <div className={s.heroDesc}>{ARCHETYPE.desc}</div>
              </div>
            </div>
          </section>

          {/* ── 02 · 5-axis profile (TraitBar) ───────────────────── */}
          <section className={s.region}>
            <span className={s.annot} aria-hidden="true">02</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>5軸プロファイル</div>
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
                        <span
                          className={s.traitPct}
                          style={{ color: a.dark }}
                        >
                          {pct}%
                        </span>
                        <span
                          className={s.traitWin}
                          style={{ color: a.dark }}
                        >
                          {winLabel}
                        </span>
                      </div>
                      <div className={s.traitBarRow}>
                        <span className={s.traitEnd} aria-hidden="true">
                          {a.kanji_minus}
                        </span>
                        <div
                          className={s.traitTrack}
                          style={{ background: a.color }}
                        >
                          <div
                            className={s.traitDot}
                            style={{ left: `${left}%`, borderColor: a.dark }}
                          />
                        </div>
                        <span className={s.traitEnd} aria-hidden="true">
                          {a.kanji_plus}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          {/* ── 03 · Ranked divisions (MatchList) ────────────────── */}
          <section className={s.region}>
            <span className={s.annot} aria-hidden="true">03</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>部署ランキング（103課中）</div>
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
                      <span
                        className={s.allFit}
                        style={{ color: fc.text }}
                      >
                        {d.fit}%
                      </span>
                    </li>
                  );
                })}
                <li className={s.allMore} aria-hidden="true">
                  … 5位 〜 103位 まで続く
                </li>
              </ul>
            </div>
          </section>
        </div>

        <p className={s.foot}>
          スクロール1枚に、アーキタイプ・プロファイル・ランキングが並ぶ。
        </p>
      </figure>
    </div>
  );
}
