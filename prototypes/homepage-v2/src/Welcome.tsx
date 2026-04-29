import { useState } from 'react';
import { HomepageCarousel, SLIDE_COUNT } from './HomepageCarousel';
import { Stepper } from './Stepper';
import s from './Welcome.module.css';
import { AXES } from '../../../src/data/axes';
import { AX } from '../../../src/data/types';

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

        <button type="button" className={s.cta}>
          診断をはじめる <span aria-hidden="true">→</span>
        </button>
      </aside>

      <div className={s.stepperSlot}>
        <Stepper idx={idx} onJump={onJump} />
      </div>
      <section className={s.right}>
        <div className={s.carouselWrap}>
          <HomepageCarousel idx={idx} onIdxChange={setIdx} />
        </div>
      </section>
    </main>
  );
}
