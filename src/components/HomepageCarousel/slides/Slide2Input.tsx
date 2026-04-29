import { useState } from 'react';
import s from './Slide2Input.module.css';

// Real question C1 from questions.json — chosen for human, relatable scene
// that any visitor can picture themselves answering.
const SCENARIO =
  '生活費に困っている市民が相談に来た。使える制度を複数調べて提案し、申請まで一緒に伴走した。';

// Endpoint labels from C1's option set (1 and 5).
const POLE_MIN = '向いていない';
const POLE_MAX = '最もやりがいを感じる';

const SCALE = [1, 2, 3, 4, 5] as const;

export function Slide2Input() {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 01 · 入力</h2>
        <div className={s.stripe} />
        <p className={s.sub}>ひとつの場面に、5段階で答える。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.qLabel}>質問の例 · 1 / 20</figcaption>
        <blockquote className={s.scenario}>
          {SCENARIO}
        </blockquote>

        <div className={s.scale} role="radiogroup" aria-label="あなたの答え">
          <span className={s.poleMin}>{POLE_MIN}</span>
          <div className={s.dots}>
            {SCALE.map((n) => {
              const active = picked === n;
              return (
                <button
                  type="button"
                  key={n}
                  role="radio"
                  aria-checked={active}
                  aria-label={`${n} / 5`}
                  className={`${s.dot} ${active ? s.dotActive : ''}`}
                  onClick={() => setPicked(n)}
                >
                  <span className={s.dotInner} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <span className={s.poleMax}>{POLE_MAX}</span>
        </div>

        <p className={s.foot}>全20問 · 約3分</p>
      </figure>
    </div>
  );
}
