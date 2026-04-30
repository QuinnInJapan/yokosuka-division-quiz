import { useStore } from '../state/hooks';
import { AXES } from '../data/axes';
import type { AxisKey } from '../data/types';
import { scoreToPct } from '../lib/scoring';
import s from './TraitBar.module.css';

export function TraitBar({
  axis,
  score,
  active,
}: {
  axis: AxisKey;
  score: number;
  active: boolean;
}) {
  const { dispatch } = useStore();
  const a = AXES[axis];
  const { pct, isPlus } = scoreToPct(score);
  const winLabel = isPlus ? a.plus : a.minus;
  const dotLeft = ((score + 2) / 4) * 100;

  return (
    <button
      type="button"
      className={`${s.trait}${active ? ' ' + s['trait--active'] : ''}`}
      onClick={() => dispatch({ type: 'TAXS', axis })}
      aria-pressed={active}
    >
      <div className={s['trait-header']}>
        <span className={s['trait-pct']} style={{ color: a.dark }}>{pct}%</span>
        <span className={s['trait-win']} style={{ color: a.dark }}>{winLabel}</span>
      </div>
      <div className={s['trait-track']} style={{ background: a.color }}>
        <div
          className={s['trait-dot']}
          style={{ left: `${dotLeft.toFixed(0)}%`, borderColor: a.dark }}
        />
      </div>
      <div className={s['trait-poles']}>
        <span className={s['trait-pole']}>{a.minus}</span>
        <span className={s['trait-pole']}>{a.plus}</span>
      </div>
    </button>
  );
}
