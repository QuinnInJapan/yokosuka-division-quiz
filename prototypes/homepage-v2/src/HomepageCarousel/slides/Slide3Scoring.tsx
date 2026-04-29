import { useState } from 'react';
import s from './Slide3Scoring.module.css';

const QUESTIONS = [
  { q: '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。', chosen: 4, label: '窓口で介護申請を支援' },
  { q: '地域のサークル活動の場で、参加者の声を直接聞きながら新しい企画を一緒に考える。',                  chosen: 3, label: '地域サークルで対話' },
  { q: '部署の業務フローを設計し、誰がいつ何をするかを文書化して整える。',                          chosen: 1, label: '業務フローを設計' },
  { q: '財政データを分析し、長期的な収支のトレンドからリスクを洗い出す。',                          chosen: 2, label: '財政データを分析' },
];

const OPTIONS = [
  '自分には向いていないと思う',
  'あまり気が乗らないが、こなせる',
  'どちらとも言えない',
  'やりがいを感じながら取り組める',
  'まさに自分が輝ける場面',
];

const AVG_PCT = (QUESTIONS.reduce((a, b) => a + b.chosen, 0) / QUESTIONS.length / 4) * 100; // 62.5

export function Slide3Scoring() {
  const [active, setActive] = useState(0);
  const fillLeft = AVG_PCT >= 50 ? 50 : AVG_PCT;
  const fillWidth = Math.abs(AVG_PCT - 50);

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>回答が軸スコアに変わる</h2>
        <div className={s.stripe} />
        <div className={s.sub}>各軸に寄与する質問の回答をまとめて、軸スコアを算出します。</div>
      </header>
      <div className={s.body}>
        <div className={s.left}>
          {QUESTIONS.map((q, i) => (
            <button
              type="button"
              key={i}
              data-testid={`s3-q-${i}`}
              className={`${s.q} ${active === i ? s.qActive : ''}`}
              onClick={() => setActive(i)}
            >
              <span className={s.qLabel}>A{i + 1}</span>
              <span className={s.qText}>{q.label}</span>
              <span className={s.qPos}>
                {[0, 1, 2, 3, 4].map((p) => (
                  <span key={p} className={`${s.dot} ${p === q.chosen ? s.dotFill : ''}`} />
                ))}
              </span>
            </button>
          ))}
          <div className={s.arrow}>▼ 集計</div>
          <div className={s.result}>
            <span className={s.resPill}>人との関わり方</span>
            <div className={s.needle}>
              <span className={s.needleEnd}>仕組み</span>
              <span className={s.scale}>
                <span
                  className={s.scaleFill}
                  style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
                />
              </span>
              <span className={s.needleEnd}>対話</span>
            </div>
          </div>
        </div>
        <div className={s.right}>
          <div className={s.rightHead}>
            <div className={s.rightPill}>A{active + 1}</div>
            <div className={s.rightLabel}>回答内容</div>
          </div>
          <p className={s.rightQ} data-testid="s3-right-q">{QUESTIONS[active].q}</p>
          <div className={s.rightOptions}>
            {OPTIONS.map((o, i) => (
              <div key={i} className={`${s.rightOption} ${i === QUESTIONS[active].chosen ? s.rightOptionChosen : ''}`}>
                <span>{o}</span>
                <span className={s.check} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
