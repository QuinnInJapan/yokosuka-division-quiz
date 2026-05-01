import s from './Slide5Result.module.css';
import { AX } from '../../../data/types';
import type { AxisKey, RankedDivision } from '../../../data/types';
import { DIVISIONS } from '../../../data/divisions';
import { dist, fitPct, determineType } from '../../../lib/scoring';
import { sukarinSrc } from '../../../lib/sukarinImages';
import { archetypePalette } from '../../../lib/archetypePalette';
import { SukarinCard } from '../../SukarinCard';
import { TraitBar } from '../../TraitBar';
import { MatchList } from '../../MatchList';

/*
  STEP 04 · 結果 — "What do I see at the end?"

  This slide IS the result page, scaled down: real <SukarinCard>, real
  <TraitBar>×5, real <MatchList>. Mounted under pointer-events:none so
  clicks fall through to the carousel right-panel advance handler.
*/

const PROFILE: Record<AxisKey, number> = { A: 2, B: 1, C: 2, D: 1, E: 0 };
const TYPE = determineType(PROFILE);
const PALETTE = archetypePalette(TYPE.code);

const RANKED: RankedDivision[] = DIVISIONS
  .map((d) => ({ ...d, user: PROFILE, fit: fitPct(dist(PROFILE, d)) }))
  .sort((a, b) => b.fit - a.fit);

const TOP4 = RANKED.slice(0, 4);

export function Slide5Result() {
  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 04 · 結果</h2>
        <div className={s.stripe} />
        <p className={s.sub}>1ページに、3つの答えが並ぶ。</p>
      </header>

      <div className={s.preview} aria-label="結果ページのプレビュー">
        <section
          className={`${s.region} ${s.regionHero}`}
          style={{ background: PALETTE.baseGradient }}
        >
          <span className={s.annot} aria-hidden="true">01</span>
          <div className={s.regionBody}>
            <div className={`${s.regionLabel} ${s.regionLabelOnHero}`}>アーキタイプ</div>
            <SukarinCard
              name={TYPE.name}
              desc={TYPE.desc}
              userScores={PROFILE}
              imageSrc={sukarinSrc(TYPE.code)}
              nameBreakAt={TYPE.nameBreakAt}
            />
          </div>
        </section>

        <section className={s.region}>
          <span className={s.annot} aria-hidden="true">02</span>
          <div className={s.regionBody}>
            <div className={s.regionLabel}>5軸プロファイル</div>
            <div className={s.bars}>
              {AX.map((ax) => (
                <TraitBar
                  key={ax}
                  axis={ax}
                  score={PROFILE[ax]}
                  active={false}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={s.region}>
          <span className={s.annot} aria-hidden="true">03</span>
          <div className={s.regionBody}>
            <div className={s.regionLabel}>部署ランキング（103課中）</div>
            <MatchList items={TOP4} />
            <div className={s.allMore} aria-hidden="true">
              … 5位 〜 103位 まで続く
            </div>
          </div>
        </section>
      </div>

      <p className={s.foot}>
        スクロール1枚に、アーキタイプ・プロファイル・ランキングが並ぶ。
      </p>
    </div>
  );
}
