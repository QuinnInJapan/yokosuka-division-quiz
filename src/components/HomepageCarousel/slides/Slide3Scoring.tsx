import s from './Slide3Scoring.module.css';
import { AXES } from '../../../data/axes';
import { TraitBar } from '../../TraitBar';

/*
  STEP 02 · 採点 — "How do my answers turn into a profile?"

  Renders the real <TraitBar> from Results so the focal output matches the
  product 1:1. Feeder rows above are a slide-only pedagogical primitive
  (the live product never shows per-question contributions).
*/

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

const MEAN = ROWS.reduce((acc, r) => acc + r.signed, 0) / ROWS.length;
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

        <div className={s.divider} aria-hidden="true">
          <span className={s.dividerLine} />
          <span className={s.dividerLabel}>4問を平均</span>
          <span className={s.dividerLine} />
        </div>

        {/* Real TraitBar from Results screen */}
        <div className={s.traitMount}>
          <TraitBar axis="A" score={MEAN} active={false} />
        </div>

        <p className={s.foot}>軸は5本 · 同じ計算をA〜Eで繰り返す</p>
      </figure>
    </div>
  );
}
