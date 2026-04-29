import { useState, useLayoutEffect, useRef } from 'react';
import { HomepageCarousel, SLIDE_COUNT } from './HomepageCarousel';
import { Stepper } from './Stepper';
import s from './Welcome.module.css';

const AXIS_COLORS = [
  'var(--A)', 'var(--B)', 'var(--C)', 'var(--D)', 'var(--E)',
] as const;
const AXIS_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;

export function Welcome() {
  const [idx, setIdx] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const onJump = (i: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, i)));

  useLayoutEffect(() => {
    // Register keyboard handler synchronously (before load event) so Playwright tests can use it
    mainRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      if (ae?.tagName === 'INPUT' || ae?.tagName === 'TEXTAREA' || ae?.isContentEditable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIdx(i => Math.min(SLIDE_COUNT - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIdx(i => Math.max(0, i - 1));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className={s.split} tabIndex={-1} ref={mainRef}>
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
