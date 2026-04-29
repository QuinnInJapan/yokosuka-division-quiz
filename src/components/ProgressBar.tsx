import { ORDER, QMAP } from '../data/questions';
import { AXES } from '../data/axes';
import s from './ProgressBar.module.css';

export function ProgressBar({ step }: { step: number }) {
  return (
    <div className={s['prog-wrap']}>
      <div
        className={s['prog-bar']}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={ORDER.length}
        aria-valuenow={step + 1}
        aria-label={`進捗 ${step + 1} / ${ORDER.length}`}
      >
        {ORDER.map((id, i) => {
          const c = AXES[QMAP[id].axis].color;
          let cls = s.seg;
          if (i < step) cls += ' ' + s.done;
          else if (i === step) cls += ' ' + s.cur;
          return (
            <div
              key={id}
              className={cls}
              style={{ ['--c' as never]: c } as React.CSSProperties}
            />
          );
        })}
      </div>
    </div>
  );
}
