import s from './HomepageCarousel.module.css';
import { Slide2Input } from './slides/Slide2Input';
import { Slide3Scoring } from './slides/Slide3Scoring';
import { Slide4Comparison } from './slides/Slide4Comparison';
import { Slide5Result } from './slides/Slide5Result';
import { Slide6Example } from './slides/Slide6Example';

export const SLIDE_COUNT = 5;

const slides = [
  <Slide2Input />,
  <Slide3Scoring />,
  <Slide4Comparison />,
  <Slide5Result />,
  <Slide6Example />,
];

type Props = {
  idx: number;
  onIdxChange: (i: number) => void;
};

export function HomepageCarousel({ idx, onIdxChange: _onIdxChange }: Props) {

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
            aria-hidden={i !== idx ? 'true' : undefined}
          >
            {i === idx ? node : null}
          </div>
        ))}
      </div>
    </section>
  );
}
