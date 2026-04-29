import s from './Stepper.module.css';

const TOTAL = 4;

type Props = {
  idx: number;
  onJump: (i: number) => void;
};

export function Stepper({ idx, onJump }: Props) {
  return (
    <ol className={s.bar} aria-label="ステップ">
      {Array.from({ length: TOTAL }, (_, i) => {
        const filled = i <= idx;
        const active = i === idx;
        const label = String(i + 1).padStart(2, '0');
        return (
          <li key={i} className={s.cell}>
            <button
              type="button"
              className={`${s.seg} ${filled ? s.filled : s.empty} ${active ? s.active : ''}`}
              data-testid={`stepper-step-${i + 1}`}
              data-active={active ? 'true' : 'false'}
              data-filled={filled ? 'true' : 'false'}
              aria-current={active ? 'step' : undefined}
              aria-label={`ステップ ${i + 1} / ${TOTAL}`}
              onClick={() => onJump(i)}
            >
              {active ? <span className={s.num}>{label}</span> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
