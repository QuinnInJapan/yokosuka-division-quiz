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
  const dotLeft = ((score + 2) / 4) * 100;
  const winKanji = isPlus ? a.kanji_plus : a.kanji_minus;

  return (
    <>
      <div className={s['tc-axis-label']}>{a.label}</div>
      <div className={s['tc-hero']} style={{ color: a.dark }}>
        <span className={s['tc-kanji']} style={{ background: a.tint }}>{winKanji}</span>
        <span className={s['tc-win']}>{winLabel}</span>
      </div>
      <div className={s['tc-bar-row']}>
        <span className={s['tc-end']}>{a.minus}</span>
        <div className={s['tc-track']} style={{ background: a.color }}>
          <div
            className={s['tc-marker']}
            style={{ left: `${dotLeft.toFixed(0)}%`, borderColor: a.dark }}
          />
        </div>
        <span className={s['tc-end']}>{a.plus}</span>
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
