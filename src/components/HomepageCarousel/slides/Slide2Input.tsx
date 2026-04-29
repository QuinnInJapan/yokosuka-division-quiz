import { useState } from 'react';
import s from './Slide2Input.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';

const AXES: { key: AxisKey; name: string; poles: string }[] = [
  { key: 'A', name: '人との関わり方', poles: '制度・仕組み ⇄ 市民対話' },
  { key: 'B', name: '仕事の進め方',   poles: '政策立案 ⇄ 現場対応' },
  { key: 'C', name: '担う役割',       poles: 'ルール管理 ⇄ 市民支援' },
  { key: 'D', name: '変化への姿勢',   poles: '革新推進 ⇄ 安定運営' },
  { key: 'E', name: '知識のスタイル', poles: '専門追求 ⇄ 幅広対応' },
];

const EXAMPLES: Record<AxisKey, string> = {
  A: '高齢の市民が窓口を訪れ、介護申請の手続きに困っている。じっくり話を聞きながら、一緒に書類を進めていく。',
  B: '新しい補助金制度を設計するため、複数の関連部署と調整しながら、政策骨子をまとめる。',
  C: '建築確認申請の書類を点検し、法令に沿っているか1件ずつ判断していく。',
  D: 'これまでの紙ベースの業務フローを見直し、デジタル化を提案・推進する。',
  E: '都市計画の専門知識を深めながら、長期的な街づくりの方針を組み立てる。',
};

const OPTIONS = [
  '自分には向いていないと思う',
  'あまり気が乗らないが、こなせる',
  'どちらとも言えない',
  'やりがいを感じながら取り組める',
  'まさに自分が輝ける場面',
];

export function Slide2Input() {
  const [active, setActive] = useState<AxisKey>('A');

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>5つの軸 × 20の質問</h2>
        <div className={s.stripe} />
        <div className={s.sub}>職員のタイプを5つの軸で測ります。</div>
      </header>
      <div className={s.grid}>
        <div className={s.axes}>
          {AXES.map((ax) => (
            <button
              type="button"
              key={ax.key}
              data-testid={`axis-row-${ax.key}`}
              data-active={active === ax.key ? 'true' : 'false'}
              className={`${s.row} ${s[`row${ax.key}`]} ${active === ax.key ? s.rowActive : ''}`}
              onClick={() => setActive(ax.key)}
            >
              <span className={`${s.pill} ${s[`pill${ax.key}`]}`}>{ax.key}</span>
              <span className={s.label}>
                <span className={s.name}>{ax.name}</span>
                <span className={s.poles}>{ax.poles}</span>
              </span>
              <span className={s.hint}>例題 ▶</span>
            </button>
          ))}
        </div>
        <div className={s.example}>
          <div className={s.exHead}>
            <div className={`${s.exPill} ${s[`pill${active}`]}`}>{active}</div>
            <div className={s.exLabel}>質問の例</div>
          </div>
          <p className={s.exQ} data-testid="s2-example-q">{EXAMPLES[active]}</p>
          <div className={s.options}>
            {OPTIONS.map((o, i) => <div key={i} className={s.option}>{o}</div>)}
          </div>
          <div className={s.foot}>全20問・約3分</div>
        </div>
      </div>
    </div>
  );
}
