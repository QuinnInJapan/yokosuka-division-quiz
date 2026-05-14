import { useMemo } from 'react';
import s from './Slide4Comparison.module.css';
import type { AxisKey, RankedDivision } from '../../../data/types';
import { dist, fitPct } from '../../../lib/scoring';
import { useConfig } from '../../../config/ConfigProvider';
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

// Focal: a deliberately mediocre match so the ComparisonBars show real
// gap on multiple axes (some "close" rows, some "wide"). Top-3 list still
// shows actual best matches for context.
const FOCAL_NAME = '観光課';

export function Slide4Comparison() {
  const config = useConfig();
  const ranked: RankedDivision[] = useMemo(
    () => config.divisions
      .map((d) => ({ ...d, user: PROFILE, fit: fitPct(dist(PROFILE, d)) }))
      .sort((a, b) => b.fit - a.fit),
    [config.divisions],
  );
  const focal = ranked.find((d) => d.name === FOCAL_NAME) ?? ranked[0];
  const top3 = ranked.slice(0, 3);

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 03 · 比較</h2>
        <div className={s.stripe} />
        <p className={s.sub}>5軸の距離で、103課ごとに相性を比較する。</p>
      </header>

      <div className={s.mount}>
        <MatchDetail division={focal} />
        <div className={s.listWrap}>
          <div className={s.listHead}>近い順 · 上位3課（103課中）</div>
          <MatchList items={top3} />
        </div>
      </div>
    </div>
  );
}
