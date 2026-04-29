import s from './Stepper.module.css';

const STEPS = [
  { num: '01', label: '入力' },
  { num: '02', label: '採点' },
  { num: '03', label: '比較' },
  { num: '04', label: '結果' },
  { num: '05', label: '例'   },
] as const;

type Props = {
  idx: number;
  onJump: (i: number) => void;
};

export function Stepper({ idx, onJump }: Props) {
  const current = STEPS[idx];
  return (
    <div className={s.wrap}>
      <ol className={s.row} aria-label="ステップ">
        {STEPS.map((st, i) => {
          const state =
            i === idx ? s.active
            : i < idx ? s.done
            : s.upcoming;
          return (
            <li key={i} className={s.cell}>
              <button
                type="button"
                className={`${s.btn} ${state}`}
                data-testid={`stepper-step-${i + 1}`}
                data-active={i === idx ? 'true' : 'false'}
                aria-current={i === idx ? 'step' : undefined}
                onClick={() => onJump(i)}
              >
                <span className={s.num}>{st.num}</span>
              </button>
              {i < STEPS.length - 1 && <span className={s.sep} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
      <p className={s.contextLabel} data-testid="stepper-current-label">
        {current.label}
      </p>
    </div>
  );
}
