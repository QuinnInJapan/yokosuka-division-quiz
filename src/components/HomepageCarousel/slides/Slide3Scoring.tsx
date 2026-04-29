import s from './Slide3Scoring.module.css';
import { AXES } from '../../../data/axes';

/*
  Slide 2 (Scoring)
  Question: "How do my answers turn into a profile?"
  Focal point: ONE axis-score transformation. Four real A-axis questions with their
  signed contributions add up to a single signed mean score plotted on the A axis
  (仕組み ↔ 対話). Eliminated: question detail right panel (the previous slide
  already shows what one question looks like in detail).
*/

// Real A-axis questions from questions.json (A1..A4), trimmed to scannable labels.
// `pick` is the 1..5 likert answer; `signed` is the contribution after the
// forward/reverse map from questions.json scoring.
const A_AXIS = AXES.A;

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

const MEAN = ROWS.reduce((a, r) => a + r.signed, 0) / ROWS.length; // 0.75
// Map mean from [-2, +2] to [0, 100] for marker position on the axis bar.
const MARKER_PCT = ((MEAN + 2) / 4) * 100; // 68.75

// Format the score with an explicit sign, one decimal.
const SCORE_LABEL = (MEAN > 0 ? '+' : MEAN < 0 ? '−' : '±') + Math.abs(MEAN).toFixed(2);

export function Slide3Scoring() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 02 · 採点</h2>
        <div className={s.stripe} style={{ background: A_AXIS.dark }} />
        <p className={s.sub}>同じ軸の4問を平均し、軸スコアを1つ出す。</p>
      </header>

      <figure className={s.card}>
        <figcaption className={s.caption}>
          <span className={s.captionLabel}>軸の例</span>
          <span className={s.captionAxis}>
            <span className={s.axisChip} style={{ background: A_AXIS.tint, color: A_AXIS.dark }}>A</span>
            <span className={s.axisName}>{A_AXIS.label}</span>
          </span>
        </figcaption>

        <ol className={s.rows} aria-label="軸Aに寄与する4問">
          {ROWS.map((r) => (
            <li key={r.id} className={s.row}>
              <span className={s.rowId}>{r.id}</span>
              <span className={s.rowLabel}>{r.label}</span>
              <span className={s.rowScale} aria-label={`回答 ${r.pick} / 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`${s.tick} ${n === r.pick ? s.tickPick : ''}`}
                    aria-hidden="true"
                  />
                ))}
              </span>
              <span
                className={`${s.rowDelta} ${r.signed > 0 ? s.deltaPos : r.signed < 0 ? s.deltaNeg : s.deltaZero}`}
                aria-label={`寄与 ${r.signed >= 0 ? '+' : ''}${r.signed}`}
              >
                {r.signed > 0 ? '+' : r.signed < 0 ? '−' : '±'}{Math.abs(r.signed)}
                {r.reversed ? <span className={s.revFlag} title="逆転項目">R</span> : null}
              </span>
            </li>
          ))}
        </ol>

        <div className={s.totalRow} aria-hidden="true">
          <span className={s.totalLabel}>平均</span>
          <span className={s.totalDots} />
          <span className={s.totalValue}>{SCORE_LABEL}</span>
        </div>

        <div className={s.scoreBlock}>
          <div className={s.scoreNumber} aria-label={`軸Aスコア ${SCORE_LABEL}`}>
            <span className={s.scoreSign} style={{ color: A_AXIS.dark }}>
              {MEAN > 0 ? '+' : MEAN < 0 ? '−' : '±'}
            </span>
            <span className={s.scoreDigits}>{Math.abs(MEAN).toFixed(2)}</span>
          </div>

          <div className={s.axisLine}>
            <span className={s.poleLabel}>{A_AXIS.minus}</span>
            <span className={s.axis}>
              <span className={s.axisRail} aria-hidden="true" />
              <span className={s.axisMid} aria-hidden="true" />
              <span
                className={s.axisMarker}
                style={{ left: `${MARKER_PCT}%`, background: A_AXIS.dark }}
                aria-hidden="true"
              />
            </span>
            <span className={s.poleLabel}>{A_AXIS.plus}</span>
          </div>

          <p className={s.foot}>軸は5本 · 同じ計算をA〜Eで繰り返す</p>
        </div>
      </figure>
    </div>
  );
}
