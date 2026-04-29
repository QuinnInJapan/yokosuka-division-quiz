import s from './Slide6Example.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';
const TRAITS: { key: AxisKey; pct: number; win: string; lo: string; hi: string }[] = [
  { key: 'A', pct: 65, win: '市民対話', lo: '機', hi: '人' },
  { key: 'B', pct: 75, win: '現場対応', lo: '策', hi: '動' },
  { key: 'C', pct: 80, win: '市民支援', lo: '律', hi: '援' },
  { key: 'D', pct: 70, win: '安定運営', lo: '革', hi: '守' },
  { key: 'E', pct: 85, win: '幅広対応', lo: '専', hi: '幅' },
];

const RANKING = [
  { pos: 1, name: '教職員課',     pct: '88.8%', top: true },
  { pos: 2, name: '健康総務課',   pct: '87.5%', top: false },
  { pos: 3, name: '子育て支援課', pct: '84.3%', top: false },
  { pos: 4, name: '市民相談課',   pct: '82.0%', top: false },
  { pos: 5, name: '障害福祉課',   pct: '80.7%', top: false },
  { pos: 6, name: '高齢福祉課',   pct: '79.2%', top: false },
  { pos: 7, name: '地域安全課',   pct: '77.5%', top: false },
];

export function Slide6Example() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>受検者の結果（例）</h2>
        <div className={s.stripe} />
        <div className={s.sub}>DASCG 型の受検者が見る画面の構成。</div>
      </header>
      <div className={s.body}>
        <div className={s.archetype}>
          <div className={s.archEyebrow}>あなたのタイプ</div>
          <h3 className={s.archName}>街のよろず屋<small>型</small></h3>
          <div className={s.archCode}>DASCG</div>
          <p className={s.archDesc}>
            市民に寄り添いながら現場を駆け回り、幅広く対応できる万能タイプ。窓口でも地域でも「あの人に聞けば大丈夫」と頼られる存在です。
          </p>
          <div className={s.profile}>
            <div className={s.ph}>5軸プロファイル</div>
            {TRAITS.map((t) => (
              <div key={t.key} className={`${s.trait} ${s[`trait${t.key}`]}`}>
                <div className={s.traitHead}>
                  <span className={s.traitPct}>{t.pct}%</span>
                  <span className={s.traitWin}>{t.win}</span>
                </div>
                <div className={s.traitRow}>
                  <span className={s.traitEnd}>{t.lo}</span>
                  <div className={s.traitTrack}>
                    <span className={s.traitDot} style={{ left: `${t.pct}%` }} />
                  </div>
                  <span className={s.traitEnd}>{t.hi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={s.rankCard}>
          <h3 className={s.rankTitle}>あなたに合う部署</h3>
          <div className={s.rankSub}>適合度ランキング（103部署中）</div>
          <div className={s.rankList}>
            {RANKING.map((r) => (
              <div key={r.pos} className={`${s.rankItem} ${r.top ? s.rankItemTop : ''}`}>
                <span className={s.rankPos}>{r.pos}</span>
                <span className={s.rankName}>{r.name}</span>
                <span className={s.rankPct}>{r.pct}</span>
              </div>
            ))}
          </div>
          <div className={s.rankFoot}>⋯ 全103部署を確認可能 ⋯</div>
        </div>
      </div>
    </div>
  );
}
