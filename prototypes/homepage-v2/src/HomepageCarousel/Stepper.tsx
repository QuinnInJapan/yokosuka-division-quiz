import s from './Stepper.module.css';

const STEPS = [
  { num: '01', label: '入力', en: 'Input' },
  { num: '02', label: '採点', en: 'Scoring' },
  { num: '03', label: '比較', en: 'Comparison' },
  { num: '04', label: '結果', en: 'Output' },
  { num: '05', label: '例',   en: 'Example' },
] as const;

export function Stepper({
  total,
  idx,
  onJump,
}: {
  total: number;
  idx: number;
  onJump: (i: number) => void;
}) {
  return (
    <ol className={s.rail} aria-label="ステップ">
      {STEPS.slice(0, total).map((st, i) => {
        const state =
          i === idx ? s.active
          : i < idx ? s.done
          : s.upcoming;
        return (
          <li key={i} className={`${s.row} ${state}`}>
            <button
              type="button"
              className={s.btn}
              data-testid={`stepper-step-${i + 1}`}
              data-active={i === idx ? 'true' : 'false'}
              aria-current={i === idx ? 'step' : undefined}
              onClick={() => onJump(i)}
            >
              <span className={s.badge} aria-hidden="true">
                <span className={s.num}>{st.num}</span>
              </span>
              <span className={s.labels}>
                <span className={s.label}>{st.label}</span>
                <span className={s.en}>{st.en}</span>
              </span>
            </button>
            {i < total - 1 && <span className={s.connector} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
