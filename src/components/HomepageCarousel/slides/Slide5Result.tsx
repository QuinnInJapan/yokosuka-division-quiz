import s from './Slide5Result.module.css';
import { AXES } from '../../../data/axes';
import { AX } from '../../../data/types';
import type { AxisKey } from '../../../data/types';

/*
  Slide 4 (Result)
  Question: "What do I see at the end?"
  Focal point: a single annotated wireframe / preview of the result page,
  showing the three components in the SHAPE they appear: archetype hero on
  top, 5-axis profile in the middle, ranked divisions at the bottom.
  Numbered annotations 01/02/03 point at each region — supporting role.
  This is the meta-anatomy slide; Slide 5 owns the worked example.
  Color discipline: only axis-tagged content carries axis color (the five
  profile rows). Indigo is reserved for structural emphasis (annotation
  numbers, callout lines, archetype code chips). Everything else is
  grayscale + hairline borders to match the outer chrome.
*/

// Real visitor profile values (-2..+2) used for the abstract bars in the
// preview. These are the same illustrative answers used on Slide 3, so the
// arc reads consistently across slides.
const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 0, E: 0 };

// Real divisions from divisions.json for the ranked-list region preview.
const RANK_PREVIEW: { name: string; pct: number }[] = [
  { name: '生活支援課',       pct: 95 },
  { name: '子育て支援課',     pct: 90 },
  { name: 'こども家庭支援課', pct: 80 },
];

// Map -2..+2 → 0..100 for marker left%
function pos(value: number): number {
  return ((value + 2) / 4) * 100;
}

// Archetype code derived from the PROFILE: each axis picks plus or minus
// letter depending on sign. (D is 0 → take the "plus" / 守 side as default.)
const ARCHETYPE_CODE = AX.map((ax) => {
  const v = PROFILE[ax];
  return v >= 0 ? AXES[ax].letter_plus : AXES[ax].letter_minus;
});

export function Slide5Result() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 04 · 結果</h2>
        <div className={s.stripe} />
        <p className={s.sub}>1ページに、3つの答えが並ぶ。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.caption}>
          <span className={s.captionLabel}>結果ページの構成</span>
          <span className={s.captionMeta}>3 ブロック</span>
        </figcaption>

        <div className={s.preview} aria-label="結果ページのプレビュー">
          {/* ── Region 01: archetype hero ───────────────────────── */}
          <section className={s.region} aria-label="アーキタイプ">
            <span className={s.annot} aria-hidden="true">01</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>あなたのアーキタイプ</div>
              <div className={s.archRow}>
                <div className={s.archCode} aria-hidden="true">
                  {ARCHETYPE_CODE.map((ch, i) => (
                    <span key={i} className={s.archChip}>{ch}</span>
                  ))}
                </div>
                <div className={s.archMeta}>
                  <div className={s.archName}>32種類から1つ</div>
                  <div className={s.archHint}>5軸の組み合わせで決まる5文字コード</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Region 02: 5-axis profile ───────────────────────── */}
          <section className={s.region} aria-label="プロファイル">
            <span className={s.annot} aria-hidden="true">02</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>5軸プロファイル</div>
              <ol className={s.axisList}>
                {AX.map((ax) => {
                  const v = PROFILE[ax];
                  return (
                    <li key={ax} className={s.axisRow}>
                      <span
                        className={s.axisChip}
                        style={{ background: AXES[ax].tint, color: AXES[ax].dark }}
                        aria-hidden="true"
                      >
                        {ax}
                      </span>
                      <span className={s.axisName}>{AXES[ax].label}</span>
                      <span className={s.axisLine} aria-hidden="true">
                        <span className={s.axisRail} />
                        <span className={s.axisMid} />
                        <span
                          className={s.axisMark}
                          style={{ left: `${pos(v)}%`, background: AXES[ax].dark }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </section>

          {/* ── Region 03: ranked divisions ─────────────────────── */}
          <section className={s.region} aria-label="部署ランキング">
            <span className={s.annot} aria-hidden="true">03</span>
            <div className={s.regionBody}>
              <div className={s.regionLabel}>部署ランキング（103課中）</div>
              <ol className={s.rankList}>
                {RANK_PREVIEW.map((d, i) => (
                  <li key={d.name} className={s.rankRow}>
                    <span className={s.rankNum}>{i + 1}</span>
                    <span className={s.rankName}>{d.name}</span>
                    <span className={s.rankBarWrap} aria-hidden="true">
                      <span className={s.rankBar} style={{ width: `${d.pct}%` }} />
                    </span>
                    <span className={s.rankPct}>{d.pct}%</span>
                  </li>
                ))}
                <li className={s.rankMore} aria-hidden="true">… 4位 〜 103位 まで続く</li>
              </ol>
            </div>
          </section>
        </div>

        <p className={s.foot}>
          スクロール1枚に、アーキタイプ・プロファイル・ランキングが並ぶ。
        </p>
      </figure>
    </div>
  );
}
