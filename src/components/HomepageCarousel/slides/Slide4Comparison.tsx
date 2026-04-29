import s from './Slide4Comparison.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';

/*
  Slide 3 (Comparison)
  Question: "How does my profile get compared to 103 divisions?"
  Focal point: ONE concrete comparison — the visitor's 5-axis profile (filled
  marker) plotted against the single closest division's profile (ring marker)
  on five axis lines. The visual gap on each line IS the distance metric.
  Supporting: a tight ranked list of three actual divisions with their distance
  scores — so the visitor sees "this got picked from 103, ranked by closeness."
  Color discipline: each axis line uses ONLY its own axis color (rail tint +
  marker fills). Indigo is reserved for the visitor's marker. Grayscale and
  hairline borders elsewhere — register matches Slides 1 & 2.
*/

// Real visitor profile (illustrative answers from STEP 02, all 5 axes).
const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 0, E: 0 };

// Real divisions from divisions.json (福祉こども部 / こども家庭支援センター).
// Each has a 5-axis profile; distance = sum |visitor − dept| over A..E.
type DivRow = {
  name: string;
  dept: string;
  profile: Record<AxisKey, number>;
};

const DIVISIONS: DivRow[] = [
  {
    name: '生活支援課',
    dept: '福祉こども部',
    profile: { A: 2, B: 1, C: 2, D: 1, E: 0 },
  },
  {
    name: '子育て支援課',
    dept: '福祉こども部',
    profile: { A: 2, B: 0, C: 2, D: 0, E: 0 },
  },
  {
    name: 'こども家庭支援課',
    dept: 'こども家庭支援センター',
    profile: { A: 2, B: 1, C: 2, D: 0, E: -1 },
  },
];

// Each axis ranges -2..+2 → range = 4. Five axes, so max total distance = 20.
const AXIS_RANGE = 4;
const MAX_TOTAL_DIST = AXIS_RANGE * AX.length;

function distance(p: Record<AxisKey, number>): number {
  return AX.reduce((sum, a) => sum + Math.abs(PROFILE[a] - p[a]), 0);
}

function pct(p: Record<AxisKey, number>): number {
  // Closeness, in percent. 0 distance = 100%, max distance = 0%.
  return Math.round(((MAX_TOTAL_DIST - distance(p)) / MAX_TOTAL_DIST) * 100);
}

function pos(value: number): number {
  // Map -2..+2 → 0..100 for marker left%
  return ((value + 2) / 4) * 100;
}

const RANKED = [...DIVISIONS]
  .map((d) => ({ ...d, dist: distance(d.profile), match: pct(d.profile) }))
  .sort((a, b) => a.dist - b.dist);

const FOCAL = RANKED[0];

export function Slide4Comparison() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 03 · 比較</h2>
        <div className={s.stripe} />
        <p className={s.sub}>5軸の距離で、103部署から最も近い1課を選ぶ。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.caption}>
          <span className={s.captionLabel}>最も近い部署</span>
          <span className={s.captionMeta}>
            <span className={s.captionDept}>{FOCAL.dept}</span>
            <span className={s.captionDot} aria-hidden="true">·</span>
            <span className={s.captionName}>{FOCAL.name}</span>
          </span>
        </figcaption>

        <div className={s.focal}>
          <div className={s.matchBlock}>
            <div className={s.matchNumber} aria-label={`適合度 ${FOCAL.match}%`}>
              <span className={s.matchDigits}>{FOCAL.match}</span>
              <span className={s.matchUnit}>%</span>
            </div>
            <div className={s.matchLabel}>適合度</div>
            <div className={s.matchSub}>距離 {FOCAL.dist} / {MAX_TOTAL_DIST}</div>
          </div>

          <ol className={s.axisList} aria-label="軸ごとの比較">
            {AX.map((ax) => {
              const v = PROFILE[ax];
              const d = FOCAL.profile[ax];
              const gap = Math.abs(v - d);
              const lo = Math.min(pos(v), pos(d));
              const hi = Math.max(pos(v), pos(d));
              return (
                <li key={ax} className={s.axisRow} data-testid={`s4-bar-${ax}`}>
                  <span
                    className={s.axisChip}
                    style={{ background: AXES[ax].tint, color: AXES[ax].dark }}
                    aria-hidden="true"
                  >
                    {ax}
                  </span>
                  <span className={s.poleLeft}>{AXES[ax].minus}</span>
                  <span className={s.line}>
                    <span className={s.rail} aria-hidden="true" />
                    <span className={s.midTick} aria-hidden="true" />
                    {gap > 0 && (
                      <span
                        className={s.gap}
                        style={{
                          left: `${lo}%`,
                          width: `${hi - lo}%`,
                          background: AXES[ax].tint,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={s.markDept}
                      style={{ left: `${pos(d)}%`, borderColor: AXES[ax].dark }}
                      aria-label={`部署 ${d}`}
                    />
                    <span
                      className={s.markUser}
                      style={{ left: `${pos(v)}%` }}
                      aria-label={`受検者 ${v}`}
                    />
                  </span>
                  <span className={s.poleRight}>{AXES[ax].plus}</span>
                  <span className={s.gapNum} aria-label={`差 ${gap}`}>
                    {gap === 0 ? '–' : gap}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className={s.legend} aria-hidden="true">
            <span className={s.legendItem}>
              <span className={`${s.legendMark} ${s.legendUser}`} />受検者
            </span>
            <span className={s.legendItem}>
              <span className={`${s.legendMark} ${s.legendDept}`} />部署
            </span>
          </div>
        </div>

        <div className={s.rank}>
          <div className={s.rankHead}>近い順 · 上位3課（103部署中）</div>
          <ol className={s.rankList}>
            {RANKED.map((d, i) => {
              const focal = i === 0;
              return (
                <li
                  key={d.name}
                  className={`${s.rankRow} ${focal ? s.rankFocal : ''}`}
                >
                  <span className={s.rankNum}>{i + 1}</span>
                  <span className={s.rankName}>
                    <span className={s.rankDept}>{d.dept}</span>
                    <span className={s.rankDiv}>{d.name}</span>
                  </span>
                  <span className={s.rankBarWrap} aria-hidden="true">
                    <span
                      className={s.rankBar}
                      style={{ width: `${d.match}%` }}
                    />
                  </span>
                  <span
                    className={s.rankPct}
                    data-testid={focal ? 's4-pct' : undefined}
                  >
                    {d.match}%
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </figure>
    </div>
  );
}
