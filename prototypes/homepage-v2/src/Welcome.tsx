import { useState } from 'react';
import { HomepageCarousel, SLIDE_COUNT } from './HomepageCarousel';
import { Stepper } from './Stepper';
import s from './Welcome.module.css';

const AXIS_COLORS = [
  'var(--A)', 'var(--B)', 'var(--C)', 'var(--D)', 'var(--E)',
] as const;
const AXIS_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;

export function Welcome() {
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

        <ul className={s.stats}>
          <li>
            <span data-testid="hero-stat-20" className={s.statN}>20</span>
            <span className={s.statL}>問</span>
          </li>
          <li>
            <span data-testid="hero-stat-5" className={s.statN}>5</span>
            <span className={s.statL}>軸</span>
          </li>
          <li>
            <span data-testid="hero-stat-102" className={s.statN}>102</span>
            <span className={s.statL}>課</span>
          </li>
        </ul>

        <button type="button" className={s.cta}>
          診断をはじめる <span aria-hidden="true">→</span>
        </button>

        <div className={s.stripes} aria-hidden="true">
          {AXIS_KEYS.map((k, i) => (
            <span
              key={k}
              data-testid={`hero-axis-stripe-${k}`}
              style={{ background: AXIS_COLORS[i] }}
              className={s.stripe}
            />
          ))}
        </div>
      </aside>

      <section className={s.right}>
        <div className={s.carouselWrap}>
          <HomepageCarousel idx={idx} onIdxChange={setIdx} />
          <Stepper idx={idx} onJump={onJump} />
        </div>
      </section>
    </main>
  );
}
