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
  const dotLeft = ((score + 2) / 4) * 100;

  return (
    <button
      type="button"
      className={`${s.trait}${active ? ' ' + s['trait--active'] : ''}`}
      onClick={() => dispatch({ type: 'TAXS', axis })}
      aria-pressed={active}
    >
      <div className={s['trait-header']}>
        <span className={s['trait-label']}>{a.label}</span>
      </div>
      <div className={s['trait-track']} style={{ background: a.color }}>
        <div
          className={s['trait-dot']}
          style={{ left: `${dotLeft.toFixed(0)}%`, borderColor: a.dark }}
        />
      </div>
      <div className={s['trait-poles']}>
        <span
          className={`${s['trait-pole']}${!isPlus ? ' ' + s['trait-pole--win'] : ''}`}
          style={!isPlus ? { color: a.dark } : undefined}
        >
          {!isPlus ? `${pct}% ${a.minus}` : a.minus}
        </span>
        <span
          className={`${s['trait-pole']}${isPlus ? ' ' + s['trait-pole--win'] : ''}`}
          style={isPlus ? { color: a.dark } : undefined}
        >
          {isPlus ? `${pct}% ${a.plus}` : a.plus}
        </span>
      </div>
    </button>
  );
}
