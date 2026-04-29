import s from './Slide5Result.module.css';

export function Slide5Result() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>結果に含まれる3つの要素</h2>
        <div className={s.stripe} />
        <div className={s.sub}>受検者は、自身のアーキタイプ・適合部署のランキング・5軸プロファイルを得る。</div>
      </header>
      <div className={s.body}>
        {/* Card 1: archetype */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>アーキタイプ</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>32種類</span>
              <span className={s.cardNote}>／ 5軸の組み合わせ</span>
            </div>
          </div>
          <p className={s.cardPara}>
            回答結果から、受検者は<strong>1つのアーキタイプ</strong>に分類される。
            5軸それぞれで2極のうち1つが選ばれ、5文字コードでタイプが決まる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例</div>
            <div className={s.archChips}>
              <span>D</span><span>A</span><span>S</span><span>C</span><span>G</span>
            </div>
            <h4 className={s.archName}>街のよろず屋<small>型</small></h4>
            <div className={s.archDesc}>市民に寄り添いながら現場を駆け回り、幅広く対応できる万能タイプ。</div>
          </div>
        </div>

        {/* Card 2: ranking */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>部署ランキング</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>103部署</span>
              <span className={s.cardNote}>／ 適合度順</span>
            </div>
          </div>
          <p className={s.cardPara}>
            横須賀市役所の<strong>全103部署</strong>が適合度順にランクづけされる。
            上位だけでなく下位も確認でき、「なぜ向かないのか」も含めて自己理解につながる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例：上位</div>
            <div className={s.exRank}>
              <span className={s.rankPos}>1</span>
              <span className={s.rankName}>教職員課</span>
              <span className={s.rankPct}>88.8%</span>
            </div>
            <div className={s.exRankFoot}>
              <span>上位 3 / 103 部署</span>
              <span>下位は 18.4%（監査委員事務局）</span>
            </div>
          </div>
        </div>

        {/* Card 3: profile */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardLabel}>プロファイル</div>
            <div className={s.cardMeta}>
              <span className={s.cardNum}>5軸</span>
              <span className={s.cardNote}>／ あなたの傾向</span>
            </div>
          </div>
          <p className={s.cardPara}>
            <strong>5軸ごとに自分の傾向</strong>が可視化される。
            どの軸が強いか・弱いかを一目で把握でき、軸ごとの伸びしろもわかる。
          </p>
          <div className={s.cardEx}>
            <div className={s.exEyebrow}>例：人との関わり方</div>
            <div className={s.exBar}>
              <div className={s.exBarHead}>
                <span className={s.exBarPct}>65%</span>
                <span className={s.exBarWin}>市民対話</span>
              </div>
              <div className={s.exBarRow}>
                <span className={s.exBarEnd}>機</span>
                <div className={s.exBarTrack}>
                  <span className={s.exBarDot} style={{ left: '65%' }} />
                </div>
                <span className={s.exBarEnd}>人</span>
              </div>
            </div>
            <div className={s.exBarFoot}>
              制度・仕組みより市民との対話を重視する傾向。残り4軸も同様に表示される。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
