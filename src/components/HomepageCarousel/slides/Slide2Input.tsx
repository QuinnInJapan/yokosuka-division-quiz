import { useState } from 'react';
import { AXES } from '../../../data/axes';
import s from './Slide2Input.module.css';

/*
  Slide 1 (Input) — "What kind of questions am I going to answer?"
  Visual contract: borrows the *real* result-page primitives so this preview feels
  like a snapshot of the same product.
    - Card chrome: var(--card-shadow) + var(--card-r) (matches MatchDetail).
    - Axis-tag chip: 36×36 tint/dark chip from TypeReveal (kanji, not letter).
    - Likert track: fat 12px axis-color track with 16px white circular dot
      (matches TraitBar's --bar-h + --mkr-size + 2.5px axis-dark border).
*/

// Real question C1 from questions.json — axis C (担う役割, 援/律).
// Picking C lets us use a real axis kanji chip ("援") as the visual tag,
// which signals "this question scores axis C" the same way the results page
// uses kanji chips to summarise your type.
const Q_AXIS = 'C' as const;
const SCENARIO =
  '生活費に困っている市民が相談に来た。使える制度を複数調べて提案し、申請まで一緒に伴走した。';

// Endpoint labels from C1's option set (1 and 5).
const POLE_MIN = '向いていない';
const POLE_MAX = '最もやりがい';

const SCALE = [1, 2, 3, 4, 5] as const;

export function Slide2Input() {
  const [picked, setPicked] = useState<number>(4); // pre-selected so the bar shows
  const ax = AXES[Q_AXIS];

  // Marker position on the fat track (0..100%) — same math idiom as TraitBar.
  const markerLeft = ((picked - 1) / (SCALE.length - 1)) * 100;

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 01 · 入力</h2>
        <div className={s.stripe} />
        <p className={s.sub}>ひとつの場面に、5段階で答える。</p>
      </header>

      <figure className={s.card}>
        {/* Axis tag — echoes TypeReveal's chip + pre-label */}
        <div className={s.tag}>
          <div
            className={s.chip}
            style={{ background: ax.tint, color: ax.dark }}
            aria-hidden="true"
          >
            {ax.kanji_plus}
          </div>
          <div className={s.tagText}>
            <span className={s.tagPre}>この質問が測る軸</span>
            <span className={s.tagLabel} style={{ color: ax.dark }}>
              {ax.label}
            </span>
          </div>
          <span className={s.qIndex}>1 / 20</span>
        </div>

        {/* Focal: the scenario */}
        <blockquote className={s.scenario} data-testid="s2-example-q">
          {SCENARIO}
        </blockquote>

        {/* Likert: fat axis-color track + white circular dot, TraitBar idiom */}
        <div
          className={s.scale}
          role="radiogroup"
          aria-label="あなたの答え"
        >
          <div className={s.scaleHeader}>
            <span className={s.pole}>{POLE_MIN}</span>
            <span className={s.pole}>{POLE_MAX}</span>
          </div>

          <div className={s.barRow}>
            <div className={s.track} style={{ background: ax.color }}>
              {/* Tick marks under the dot, snapping to the 5 positions */}
              {SCALE.map((n) => {
                const left = ((n - 1) / (SCALE.length - 1)) * 100;
                return (
                  <span
                    key={`tick-${n}`}
                    className={s.tick}
                    style={{ left: `${left}%` }}
                    aria-hidden="true"
                  />
                );
              })}
              {/* The white circular marker — TraitBar.trait-dot styling */}
              <div
                className={s.marker}
                style={{
                  left: `${markerLeft.toFixed(0)}%`,
                  borderColor: ax.dark,
                }}
                aria-hidden="true"
              />
            </div>

            {/* Invisible hit-targets aligned to the 5 ticks */}
            <div className={s.hits}>
              {SCALE.map((n) => {
                const active = picked === n;
                return (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={active}
                    aria-label={`${n} / 5`}
                    className={s.hit}
                    onClick={() => setPicked(n)}
                  >
                    <span className={s.hitNum} aria-hidden="true">
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className={s.foot}>全20問 · 約3分</p>
      </figure>
    </div>
  );
}
