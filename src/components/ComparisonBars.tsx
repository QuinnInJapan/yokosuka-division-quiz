import { AX } from '../data/types';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
import s from './ComparisonBars.module.css';

function toFill(v: number) {
  return (((v + 2) / 4) * 100).toFixed(0);
}

export function ComparisonBars({
  user,
  division,
}: {
  user: Record<AxisKey, number>;
  division: Record<AxisKey, number>;
}) {
  return (
    <>
      <div className={s['comp-label']}>相性の内訳</div>
      {AX.map(ax => {
        const a = AXES[ax];
        const uPct = toFill(user[ax]);
        const dPct = toFill(division[ax]);
        return (
          <div key={ax} className={s['comp-row']}>
            <div className={s['comp-axis']} style={{ color: a.dark }}>{a.label}</div>
            <div className={s['comp-pair']}>
              <span className={s['comp-who']}>あなた</span>
              <div className={s['comp-track']} style={{ background: a.color }}>
                <div
                  className={s['comp-dot']}
                  style={{ left: `${uPct}%`, borderColor: a.dark }}
                />
              </div>
            </div>
            <div className={s['comp-pair']}>
              <span className={s['comp-who']}>この課</span>
              <div
                className={`${s['comp-track']} ${s['comp-track--div']}`}
                style={{ background: a.color }}
              >
                <div
                  className={s['comp-dot']}
                  style={{ left: `${dPct}%`, borderColor: a.dark }}
                />
              </div>
            </div>
            <div className={s['comp-ends']}>
              <span>{a.minus}</span>
              <span>{a.plus}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}
