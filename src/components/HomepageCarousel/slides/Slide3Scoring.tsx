import s from './Slide3Scoring.module.css';
import { AXES } from '../../../data/axes';

/*
  Slide 2 (Scoring) — "How do my answers turn into a profile?"
  Visual contract: borrows the *real* result-page primitives so this preview
  feels like a snapshot of the same product.
    - Card chrome: var(--card-shadow) + var(--card-r) (matches MatchDetail).
    - Axis-tag chip: 36×36 tint/dark kanji chip (matches TypeReveal).
    - Mini feeder bars: fat var(--bar-h) axis-color tracks with white circular
      dots — same idiom as TraitBar, scaled to row density.
    - Focal: the actual TraitBar layout (pct + win label in axis-dark above a
      fat axis-color track, kanji ends, 16px white dot at the score position).
*/

// Real A-axis questions from questions.json (A1..A4), trimmed to scannable labels.
// `pick` is the 1..5 likert answer; `signed` is the contribution after the
// forward/reverse map from questions.json scoring.
const A = AXES.A;

type Row = {
  id: string;
  label: string;
  reversed: boolean;
  pick: 1 | 2 | 3 | 4 | 5;
  signed: -2 | -1 | 0 | 1 | 2;
};

const ROWS: Row[] = [
  { id: 'A1', label: '窓口で介護申請を一緒に進める',         reversed: false, pick: 4, signed:  1 },
  { id: 'A2', label: '地域サークルで支援制度を直接説明',       reversed: false, pick: 4, signed:  1 },
  { id: 'A3', label: '部署横断の業務フローを再設計',          reversed: true,  pick: 2, signed:  1 },
  { id: 'A4', label: '財政データを分析して予算案を作成',       reversed: true,  pick: 3, signed:  0 },
];

// Mean of the four signed contributions: 0.75 on the [-2, +2] axis.
const MEAN = ROWS.reduce((acc, r) => acc + r.signed, 0) / ROWS.length;

// Same math as scoreToPct() in src/lib/scoring.ts:
//   pct = round(50 + (|score| / 2) * 50)
const PCT = Math.round(50 + (Math.abs(MEAN) / 2) * 50);
const IS_PLUS = MEAN >= 0;
const WIN_LABEL = IS_PLUS ? A.plus : A.minus;

// Same math as TraitBar's dotLeft for the focal marker position.
const DOT_LEFT = ((MEAN + 2) / 4) * 100;

// Map a 1..5 pick to its position on the fat track (0..100%).
const pickToLeft = (pick: number) => ((pick - 1) / 4) * 100;

export function Slide3Scoring() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 02 · 採点</h2>
        <div className={s.stripe} />
        <p className={s.sub}>同じ軸の4問を平均し、軸スコアを1つ出す。</p>
      </header>

      <figure className={s.card}>
        {/* Axis tag — TypeReveal echo: kanji chip + axis label */}
        <div className={s.tag}>
          <div
            className={s.chip}
            style={{ background: A.tint, color: A.dark }}
            aria-hidden="true"
          >
            {A.kanji_plus}
          </div>
          <div className={s.tagText}>
            <span className={s.tagPre}>軸の例</span>
            <span className={s.tagLabel} style={{ color: A.dark }}>
              {A.label}
            </span>
          </div>
          <span className={s.qIndex}>4問</span>
        </div>

        {/* Feeder rows — 4 mini TraitBars, one per contributing question */}
        <ol className={s.rows} aria-label="軸Aに寄与する4問">
          {ROWS.map((r) => {
            const left = pickToLeft(r.pick);
            return (
              <li key={r.id} className={s.row}>
                <span className={s.rowId}>{r.id}</span>
                <span className={s.rowLabel}>
                  {r.label}
                  {r.reversed ? (
                    <span className={s.revFlag} title="逆転項目">R</span>
                  ) : null}
                </span>
                <span
                  className={s.miniBar}
                  aria-label={`回答 ${r.pick} / 5`}
                  style={{ background: A.color }}
                >
                  <span
                    className={s.miniDot}
                    style={{ left: `${left.toFixed(0)}%`, borderColor: A.dark }}
                    aria-hidden="true"
                  />
                </span>
                <span
                  className={s.rowDelta}
                  style={{ color: A.dark }}
                  aria-label={`寄与 ${r.signed >= 0 ? '+' : ''}${r.signed}`}
                >
                  {r.signed > 0 ? '+' : r.signed < 0 ? '−' : '±'}
                  {Math.abs(r.signed)}
                </span>
              </li>
            );
          })}
        </ol>

        {/* Aggregator divider — labels what's about to happen */}
        <div className={s.divider} aria-hidden="true">
          <span className={s.dividerLine} />
          <span className={s.dividerLabel}>4問を平均</span>
          <span className={s.dividerLine} />
        </div>

        {/* Focal: the real TraitBar shape (pct + win on top, kanji ends + */}
        {/* fat axis track with white dot at the score position).          */}
        <div className={s.trait}>
          <div className={s.traitHeader}>
            <span className={s.traitPct} style={{ color: A.dark }}>
              {PCT}%
            </span>
            <span className={s.traitWin} style={{ color: A.dark }}>
              {WIN_LABEL}
            </span>
          </div>
          <div className={s.traitBarRow}>
            <span className={s.traitEnd} aria-hidden="true">
              {A.kanji_minus}
            </span>
            <div className={s.traitTrack} style={{ background: A.color }}>
              <div
                className={s.traitDot}
                style={{ left: `${DOT_LEFT.toFixed(0)}%`, borderColor: A.dark }}
                aria-hidden="true"
              />
            </div>
            <span className={s.traitEnd} aria-hidden="true">
              {A.kanji_plus}
            </span>
          </div>
        </div>

        <p className={s.foot}>軸は5本 · 同じ計算をA〜Eで繰り返す</p>
      </figure>
    </div>
  );
}
