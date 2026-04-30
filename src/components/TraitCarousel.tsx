import { useStore, useDerived } from '../state/hooks';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import { getAxisDesc } from '../data/descriptions';
import { scoreToPct } from '../lib/scoring';
import s from './TraitCarousel.module.css';

export function TraitCarousel() {
  const { state, dispatch } = useStore();
  const { userScores } = useDerived();
  const ax = AX[state.traitIdx];
  const score = userScores[ax];
  const a = AXES[ax];
  const { isPlus } = scoreToPct(score);
  const winLabel = isPlus ? a.plus : a.minus;
  const desc = getAxisDesc(ax, score);

  return (
    <>
      <div className={s['tc-axis-label']}>{a.label}</div>
      <div className={s['tc-hero']} style={{ color: a.dark }}>
        <span className={s['tc-win']}>{winLabel}</span>
      </div>
      <div className={s['tc-desc']}>{desc}</div>
      <div className={s['tc-nav-row']}>
        <button className={s['tc-nav']} onClick={() => dispatch({ type: 'TPREV' })}>‹</button>
        <div className={s['tc-dots']}>
          {AX.map((_, i) => (
            <span
              key={i}
              className={`${s['tc-dot']}${i === state.traitIdx ? ' ' + s['tc-dot--on'] : ''}`}
              style={i === state.traitIdx ? { background: a.color } : undefined}
            />
          ))}
        </div>
        <button className={s['tc-nav']} onClick={() => dispatch({ type: 'TNEXT' })}>›</button>
      </div>
    </>
  );
}
