import { useEffect } from 'react';
import s from './HomepageCarousel.module.css';
import { Slide2Input } from './slides/Slide2Input';
import { Slide3Scoring } from './slides/Slide3Scoring';
import { Slide4Comparison } from './slides/Slide4Comparison';
import { Slide5Result } from './slides/Slide5Result';

export const SLIDE_COUNT = 4;

type Props = {
  idx: number;
  onIdxChange: (i: number) => void;
};

export function HomepageCarousel({ idx, onIdxChange }: Props) {
  const slides = [
    <Slide2Input onAdvance={() => onIdxChange(1)} />,
    <Slide3Scoring />,
    <Slide4Comparison />,
    <Slide5Result />,
  ];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement as HTMLElement | null;
      const tag = ae?.tagName;
      const editable = ae?.isContentEditable;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || editable) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onIdxChange(Math.min(SLIDE_COUNT - 1, idx + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onIdxChange(Math.max(0, idx - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, onIdxChange]);

  return (
    <section className={s.carousel} aria-label="部署タイプ診断の仕組み">
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
