import s from './Slide4Comparison.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';
import { dist, fitPct, fitColor } from '../../../lib/scoring';

/*
  Slide 3 (Comparison) — "How does my profile get compared to 103 divisions?"

  Visual contract: borrows the *real* result-page primitives so this preview
  feels like a snapshot of the same product.
    - Card chrome: var(--card-shadow) + var(--card-r) (matches MatchDetail).
    - Top: FitRing-style 56px arc + green match% (fitColor) + division name.
    - Body: 5 paired ComparisonBars rows, one per axis, each row =
        · 12px fat fully-saturated axis-color track (TraitBar idiom)
        · visitor row on top (full saturation), division row below (.45 tint)
        · 16px white circular dots with 2.5px axis-dark border
        · kanji_minus / kanji_plus poles (not "A" letters)
    - Footer: MatchList-style ranked top-3 with green fit pcts.
*/

// Real visitor profile from the demo answers in Slide 2.
const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 0, E: 0 };

// Real divisions from divisions.json — three of the closest rows by hand
// so we can render a believable "top 3 of 103" without loading the full file.
type DivRow = {
  name: string;
  dept: string;
  profile: Record<AxisKey, number>;
};

const CANDIDATES: DivRow[] = [
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

const RANKED = CANDIDATES
  .map((d) => ({ ...d, fit: Math.round(fitPct(dist(PROFILE, d.profile))) }))
  .sort((a, b) => b.fit - a.fit);

const FOCAL = RANKED[0];

// Map score -2..+2 → 0..100 for the dot's left% (same math as ComparisonBars).
const toLeft = (v: number) => (((v + 2) / 4) * 100).toFixed(0);

export function Slide4Comparison() {
  const fc = fitColor(FOCAL.fit);

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 03 · 比較</h2>
        <div className={s.stripe} />
        <p className={s.sub}>5軸の距離で、103課から最も近い1課を選ぶ。</p>
      </header>

      <figure className={s.card}>
        {/* ── Top: ring + match% + focal division name (MatchDetail echo) ── */}
        <div className={s.matchTop}>
          <div className={s.fitDisplay}>
            <div className={s.fitArc}>
              <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden="true">
                <circle
                  cx={28} cy={28} r={24}
                  fill="none" stroke="var(--border)" strokeWidth={6}
                />
                <circle
                  cx={28} cy={28} r={24}
                  fill="none"
                  stroke={fc.fill}
                  strokeWidth={6}
                  strokeDasharray={`${(FOCAL.fit / 100) * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
            </div>
            <div className={s.fitText}>
              <span
                className={s.fitPct}
                style={{ color: fc.text }}
                data-testid="s4-pct"
              >
                {FOCAL.fit}%
              </span>
              <span className={s.fitLbl}>相性度</span>
            </div>
          </div>

          <div className={s.divInfo}>
            <div className={s.divDept}>{FOCAL.dept}</div>
            <div className={s.divName}>{FOCAL.name}</div>
            <div className={s.divAbout}>
              受検者プロフィールに最も近い1課（103課中）
            </div>
          </div>
        </div>

        {/* ── Body: 5 paired ComparisonBars rows ── */}
        <div className={s.compBlock}>
          <div className={s.compLabel}>相性の内訳</div>

          {AX.map((ax) => {
            const a = AXES[ax];
            const uPct = toLeft(PROFILE[ax]);
            const dPct = toLeft(FOCAL.profile[ax]);
            return (
              <div
                key={ax}
                className={s.compRow}
                data-testid={`s4-bar-${ax}`}
              >
                <div className={s.compAxis} style={{ color: a.dark }}>
                  {a.label}
                </div>

                <div className={s.compPair}>
                  <span className={s.compWho}>あなた</span>
                  <span className={s.compEnd} aria-hidden="true">
                    {a.kanji_minus}
                  </span>
                  <div
                    className={s.compTrack}
                    style={{ background: a.color }}
                  >
                    <div
                      className={s.compDot}
                      style={{ left: `${uPct}%`, borderColor: a.dark }}
                    />
                  </div>
                  <span className={s.compEnd} aria-hidden="true">
                    {a.kanji_plus}
                  </span>
                </div>

                <div className={s.compPair}>
                  <span className={s.compWho}>この課</span>
                  <span className={s.compEnd} aria-hidden="true">
                    {a.kanji_minus}
                  </span>
                  <div
                    className={`${s.compTrack} ${s.compTrackDiv}`}
                    style={{ background: a.color }}
                  >
                    <div
                      className={s.compDot}
                      style={{ left: `${dPct}%`, borderColor: a.dark }}
                    />
                  </div>
                  <span className={s.compEnd} aria-hidden="true">
                    {a.kanji_plus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer: MatchList-style top-3 ranked rows ── */}
        <div className={s.allList} aria-label="近い順 上位3課">
          <div className={s.allHead}>近い順 · 上位3課（103課中）</div>
          {RANKED.map((d, i) => {
            const rfc = fitColor(d.fit);
            const isFocal = i === 0;
            return (
              <div
                key={`${d.dept}|${d.name}`}
                className={`${s.allItem}${isFocal ? ' ' + s.allItemOn : ''}`}
              >
                <span className={s.allRn}>{i + 1}</span>
                <div className={s.allInfo}>
                  <div className={s.allName}>{d.name}</div>
                  <div className={s.allDept}>{d.dept}</div>
                </div>
                <span
                  className={s.allFit}
                  style={{ color: rfc.text }}
                >
                  {d.fit}%
                </span>
              </div>
            );
          })}
        </div>
      </figure>
    </div>
  );
}
