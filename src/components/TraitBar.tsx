import type { AxisKey } from '../data/types';
import { useConfig } from '../config/ConfigProvider';
import { axisValueToPct } from '../data/axisScale';
import s from './TraitBar.module.css';

export function TraitBar({
  axis,
  score,
}: {
  axis: AxisKey;
  score: number;
  active?: boolean;
}) {
  const config = useConfig();
  const a = config.axes[axis];
  const tendency = score === 0 ? '中立' : `${score > 0 ? a.plus : a.minus}寄り`;
  const dotLeft = axisValueToPct(score);

  return (
    <div className={s.trait}>
      <div className={s['trait-header']}>
        <span className={s['trait-label']}>{a.label}</span>
        <span className={s['trait-tendency']}>{tendency}</span>
      </div>
      <div className={s['trait-track']} style={{ background: a.color }}>
        <span
          className={s['trait-midline']}
          aria-hidden="true"
        />
        <span
          className={s['trait-dot']}
          style={{ left: `${dotLeft}%`, borderColor: a.dark }}
          aria-hidden="true"
        />
      </div>
      <div className={s['trait-poles']}>
        <span className={s['trait-pole']}>{a.minus}</span>
        <span className={s['trait-separator']} aria-hidden="true">/</span>
        <span className={s['trait-pole']}>{a.plus}</span>
      </div>
    </div>
  );
}
