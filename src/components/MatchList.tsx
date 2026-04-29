import { useStore } from '../state/hooks';
import type { RankedDivision } from '../data/types';
import { fitColor } from '../lib/scoring';
import s from './MatchList.module.css';

export function MatchList({ items }: { items: RankedDivision[] }) {
  const { state, dispatch } = useStore();
  return (
    <div className={`${s['all-list']} ${s['all-list--side']}`}>
      {items.map((d, i) => {
        const fc = fitColor(d.fit);
        const isOn = i === state.sel;
        return (
          <button
            key={`${d.dept}|${d.name}`}
            type="button"
            className={`${s['all-item']}${isOn ? ' ' + s.on : ''}`}
            onClick={() => dispatch({ type: 'SEL', idx: i })}
            aria-pressed={isOn}
          >
            <span className={s['all-rn']}>{i + 1}</span>
            <div className={s['all-info']}>
              <div className={s['all-name']}>{d.name}</div>
              <div className={s['all-dept']}>{d.dept}</div>
            </div>
            <span className={s['all-fit']} style={{ color: fc.text }}>{d.fit}%</span>
          </button>
        );
      })}
    </div>
  );
}
