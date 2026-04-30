import { useState } from 'react';
import { useStore } from '../state/hooks';
import { HomepageCarousel, SLIDE_COUNT } from '../components/HomepageCarousel';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import s from './Welcome.module.css';

export function Welcome() {
  const { dispatch } = useStore();
  const [idx, setIdx] = useState(0);
  const onJump = (i: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, i)));

  return (
    <main className={s.split}>
      <aside className={s.hero}>
        <div className={s.eyebrow}>YOKOSUKA CITY HALL</div>
        <h1 className={s.title}>
          横須賀市役所<br />部署タイプ診断
        </h1>
        <p className={s.lede}>3分で、あなたに合う課が見つかります。</p>

        <ul className={s.axisChips} aria-label="診断軸">
          {AX.map((ax) => (
            <li className={s.axisChip} key={ax} data-testid={`hero-axis-chip-${ax}`}>
              <span
                className={s.axisLetter}
                style={{ background: AXES[ax].tint, color: AXES[ax].dark }}
                aria-hidden="true"
              >
                {ax}
              </span>
              <span className={s.axisLabel}>{AXES[ax].label}</span>
            </li>
          ))}
        </ul>

        <div className={s.ctaWrap}>
          <button
            type="button"
            className={s.cta}
            onClick={() => dispatch({ type: 'START' })}
          >
            診断をはじめる <span aria-hidden="true" className={s.ctaArrow}>→</span>
          </button>
        </div>
      </aside>

      <section className={s.right}>
        <div className={s.carouselWrap}>
          <div className={s.explainerHead} data-testid="explainer-head">
            <button
              type="button"
              className={s.navBtn}
              data-testid="explainer-prev"
              aria-label="前のステップ"
              onClick={() => onJump(idx - 1)}
              disabled={idx === 0}
            >
              ←
            </button>
            <span className={s.explainerLabel}>
              <span className={s.explainerEyebrow}>仕組み · HOW IT WORKS</span>
              <span
                className={s.dots}
                role="tablist"
                aria-label="ステップを選ぶ"
                data-testid="explainer-dots"
              >
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === idx}
                    aria-label={`ステップ ${i + 1} / ${SLIDE_COUNT}`}
                    data-testid={`explainer-dot-${i + 1}`}
                    className={s.dot}
                    data-active={i === idx ? 'true' : 'false'}
                    onClick={() => onJump(i)}
                  />
                ))}
              </span>
            </span>
            <button
              type="button"
              className={s.navBtn}
              data-testid="explainer-next"
              aria-label="次のステップ"
              onClick={() => onJump(idx + 1)}
              disabled={idx === SLIDE_COUNT - 1}
            >
              →
            </button>
          </div>
          <HomepageCarousel idx={idx} onIdxChange={setIdx} />
        </div>
      </section>
    </main>
  );
}
