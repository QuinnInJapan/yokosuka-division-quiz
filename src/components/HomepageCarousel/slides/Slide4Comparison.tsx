import s from './Slide4Comparison.module.css';

type AxisKey = 'A' | 'B' | 'C' | 'D' | 'E';
const MAX = 2.0;

const BARS: { key: AxisKey; lo: string; hi: string; user: number; dept: number; delta: string }[] = [
  { key: 'A', lo: '制度・仕組み', hi: '市民対話', user: 0.6,  dept: 2.0, delta: 'Δ 1.4' },
  { key: 'B', lo: '政策立案',     hi: '現場対応', user: -1.0, dept: 0.5, delta: 'Δ 1.5' },
  { key: 'C', lo: 'ルール管理',   hi: '市民支援', user: 1.2,  dept: 2.0, delta: 'Δ 0.8' },
  { key: 'D', lo: '革新推進',     hi: '安定運営', user: 0.2,  dept: 0.5, delta: 'Δ 0.3' },
  { key: 'E', lo: '専門追求',     hi: '幅広対応', user: 0.4,  dept: 0.5, delta: 'Δ 0.1' },
];

function fillStyle(val: number) {
  const pct = (Math.abs(val) / MAX) * 50;
  return val >= 0
    ? { left: '50%', width: `${pct}%` }
    : { left: `${50 - pct}%`, width: `${pct}%` };
}

export function Slide4Comparison() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 03 · 比較</h2>
        <div className={s.stripe} />
        <div className={s.sub}>5軸のパターンを部署ごとに比較し、最も近い部署を見つけます。</div>
      </header>
      <div className={s.body}>
        <div className={s.card}>
          <div className={s.cardHead}>
            <h3>受検者 vs <strong>地域福祉課</strong>（理想パターン）</h3>
            <div className={s.legend}>
              <span><span className={s.swatch} />受検者</span>
              <span><span className={`${s.swatch} ${s.swatchDept}`} />部署理想</span>
            </div>
          </div>
          <div className={s.bars}>
            {BARS.map((b) => (
              <div
                key={b.key}
                data-testid={`s4-bar-${b.key}`}
                className={`${s.bar} ${s[`bar${b.key}`]}`}
              >
                <span className={`${s.pole} ${s.poleLo}`}>{b.lo}</span>
                <span className={s.track}>
                  <span className={s.fillDept} style={fillStyle(b.dept)} />
                  <span className={s.fillUser} style={fillStyle(b.user)} />
                </span>
                <span className={`${s.pole} ${s.poleHi}`}>{b.hi}</span>
                <span className={s.delta}>{b.delta}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={s.match}>
          <span className={s.matchLabel}>適合度</span>
          <div className={s.meterWrap}>
            <div className={s.meter}><span className={s.meterFill} style={{ width: '73%' }} /></div>
            <div className={s.ticks}><span>0%</span><span>50%</span><span>100%</span></div>
          </div>
          <span className={s.pct} data-testid="s4-pct">73%</span>
        </div>
      </div>
    </div>
  );
}
