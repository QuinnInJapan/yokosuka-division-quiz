import { useEffect, useState } from 'react';
import s from './HomepageCarousel.module.css';
import { Slide2Input } from './slides/Slide2Input';
import { Slide3Scoring } from './slides/Slide3Scoring';
import { Slide4Comparison } from './slides/Slide4Comparison';
import { Slide5Result } from './slides/Slide5Result';
import { Slide6Example } from './slides/Slide6Example';
import { Stepper } from './Stepper';

const SLIDE_COUNT = 5;

const slides = [
  <Slide2Input />,
  <Slide3Scoring />,
  <Slide4Comparison />,
  <Slide5Result />,
  <Slide6Example />,
];

export function HomepageCarousel() {
  const [idx, setIdx] = useState(0);

  const go = (n: number) => setIdx(Math.max(0, Math.min(SLIDE_COUNT - 1, n)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const tag = ae?.tagName;
      const editable = ae?.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setIdx((i) => Math.min(SLIDE_COUNT - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setIdx((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className={s.carousel} aria-label="部署タイプ診断の仕組み">
      <Stepper total={SLIDE_COUNT} idx={idx} onJump={go} />
      <div className={s.viewport} data-testid="carousel-viewport">
        {slides.map((node, i) => (
          <div
            key={i}
            data-testid={`carousel-slide-${i + 1}`}
            data-active={i === idx ? 'true' : 'false'}
            className={s.slide}
            hidden={i !== idx}
          >
            {node}
          </div>
        ))}
      </div>
    </section>
  );
}
