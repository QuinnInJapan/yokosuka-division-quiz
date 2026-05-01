import type { RankedDivision } from '../data/types';
import { fitColor } from '../lib/scoring';
import { FitRing } from './FitRing';
import { ComparisonBars } from './ComparisonBars';
import s from './MatchDetail.module.css';

export function MatchDetail({ division }: { division: RankedDivision }) {
  const fc = fitColor(division.fit);
  return (
    <div className={s['match-card']}>
      <div className={s['match-top']}>
        <FitRing pct={division.fit} fillColor={fc.fill} textColor={fc.text} />
        <div>
          <div className={s['div-dept']}>{division.dept}</div>
          <div className={s['div-name']}>{division.name}</div>
          <div className={s['div-about']}>{division.about ?? ''}</div>
        </div>
      </div>
      <ComparisonBars
        user={division.user}
        division={division}
        divisionName={division.name}
        fit={division.fit}
      />
    </div>
  );
}
