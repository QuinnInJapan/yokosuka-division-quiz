import { useConfig } from '../config/ConfigProvider';
import s from './ProgressBar.module.css';

export function ProgressBar({ step }: { step: number }) {
  const config = useConfig();
  const total = config.questions.length;

  return (
    <div className={s['prog-wrap']}>
      <div
        className={s['prog-bar']}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step + 1}
        aria-label={`進捗 ${step + 1} / ${total}`}
      >
        {config.questions.map((question, i) => {
          const c = config.axes[question.axis].color;
          let cls = s.seg;
          if (i < step) cls += ' ' + s.done;
          else if (i === step) cls += ' ' + s.cur;
          return (
            <div
              key={i}
              className={cls}
              style={{ ['--c' as never]: c } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
