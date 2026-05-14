import { useMemo } from 'react';
import s from './Slide5Result.module.css';
import { AX } from '../../../data/types';
import type { AxisKey, RankedDivision } from '../../../data/types';
import { dist, fitPct, determineType } from '../../../lib/scoring';
import { sukarinSrc } from '../../../lib/sukarinImages';
import { archetypePalette } from '../../../lib/archetypePalette';
import { useConfig } from '../../../config/ConfigProvider';
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

export function Slide5Result() {
  const config = useConfig();
  const type = useMemo(() => determineType(PROFILE, config), [config]);
  const palette = archetypePalette(type.code);
  const ranked: RankedDivision[] = useMemo(
    () => config.divisions
      .map((d) => ({ ...d, user: PROFILE, fit: fitPct(dist(PROFILE, d)) }))
      .sort((a, b) => b.fit - a.fit),
    [config.divisions],
  );
  const top4 = ranked.slice(0, 4);

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
          style={{ background: palette.baseGradient }}
        >
          <span className={s.annot} aria-hidden="true">01</span>
          <div className={s.regionBody}>
            <div className={`${s.regionLabel} ${s.regionLabelOnHero}`}>アーキタイプ</div>
            <SukarinCard
              name={type.name}
              desc={type.desc}
              userScores={PROFILE}
              imageSrc={sukarinSrc(type.code)}
              nameBreakAt={type.nameBreakAt}
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
            <MatchList items={top4} />
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
