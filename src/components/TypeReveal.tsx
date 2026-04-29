import { useDerived } from '../state/hooks';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import s from './TypeReveal.module.css';

export function TypeReveal() {
  const { type, userScores } = useDerived();
  return (
    <div className={s['type-banner']}>
      <div className={s['type-pre']}>あなたのタイプ</div>
      <div className={s['type-chips']}>
        {AX.map(ax => {
          const a = AXES[ax];
          const kanji = userScores[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
          return (
            <div
              key={ax}
              className={s['type-chip']}
              style={{ background: a.tint, color: a.dark }}
            >
              {kanji}
            </div>
          );
        })}
      </div>
      <h1 className={s['type-name']}>「{type.name}」型</h1>
      <div className={s['type-code']}>{type.code}</div>
      <div className={s['type-desc']}>{type.desc}</div>
    </div>
  );
}
