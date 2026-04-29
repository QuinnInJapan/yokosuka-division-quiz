import s from './Stepper.module.css';

const TOTAL = 5;

type Props = {
  idx: number;
  onJump: (i: number) => void;
};

export function Stepper({ idx, onJump }: Props) {
  return (
    <ol className={s.bar} aria-label="ステップ">
      {Array.from({ length: TOTAL }, (_, i) => {
        const filled = i <= idx;
        return (
          <li key={i} className={s.cell}>
            <button
              type="button"
              className={`${s.seg} ${filled ? s.filled : s.empty}`}
              data-testid={`stepper-step-${i + 1}`}
              data-active={i === idx ? 'true' : 'false'}
              data-filled={filled ? 'true' : 'false'}
              aria-current={i === idx ? 'step' : undefined}
              aria-label={`ステップ ${i + 1} / ${TOTAL}`}
              onClick={() => onJump(i)}
            />
          </li>
        );
      })}
    </ol>
  );
}
