import s from './Slide4Comparison.module.css';
import type { AxisKey, RankedDivision } from '../../../data/types';
import { DIVISIONS } from '../../../data/divisions';
import { dist, fitPct } from '../../../lib/scoring';
import { MatchDetail } from '../../MatchDetail';
import { MatchList } from '../../MatchList';

/*
  STEP 03 · 比較 — "How does my profile get compared to 103 divisions?"

  Renders the real <MatchDetail> (FitRing + ComparisonBars) and <MatchList>
  from Results so the slide is a true peek at the live product. Components
  are mounted in a pointer-events:none wrapper so clicks fall through to
  the carousel's right-panel advance handler.
*/

const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 1, E: 0 };

const RANKED: RankedDivision[] = DIVISIONS
  .map((d) => ({ ...d, user: PROFILE, fit: fitPct(dist(PROFILE, d)) }))
  .sort((a, b) => b.fit - a.fit);

// Focal: a deliberately mediocre match so the ComparisonBars show real
// gap on multiple axes (some "close" rows, some "wide"). Top-3 list still
// shows actual best matches for context.
const FOCAL_NAME = '観光課';
const FOCAL = RANKED.find((d) => d.name === FOCAL_NAME) ?? RANKED[0];
const TOP3 = RANKED.slice(0, 3);

export function Slide4Comparison() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 03 · 比較</h2>
        <div className={s.stripe} />
        <p className={s.sub}>5軸の距離で、103課ごとに相性を比較する。</p>
      </header>

      <div className={s.mount}>
        <MatchDetail division={FOCAL} />
        <div className={s.listWrap}>
          <div className={s.listHead}>近い順 · 上位3課（103課中）</div>
          <MatchList items={TOP3} />
        </div>
      </div>
    </div>
  );
}
