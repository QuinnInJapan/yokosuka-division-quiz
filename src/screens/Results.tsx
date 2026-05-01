import { SukarinCard } from '../components/SukarinCard';
import { TraitsPanel } from '../components/TraitsPanel';
import { MatchBrowse } from '../components/MatchBrowse';
import { ExportButton } from '../components/ExportButton';
import { RetakeButton } from '../components/RetakeButton';
import { useDerived } from '../state/hooks';
import { sukarinSrc } from '../lib/sukarinImages';
import { archetypePalette } from '../lib/archetypePalette';
import s from './Results.module.css';

export function Results() {
  const { type, userScores } = useDerived();
  const palette = archetypePalette(type.code);

  return (
    <>
      <section
        className={`${s.band} ${s.hero}`}
        style={{ background: palette.baseGradient }}
        data-testid="results-band-hero"
      >
        {palette.blobs.map((b, i) => (
          <span
            key={`${type.code}-blob-${i}`}
            className={s.heroBlob}
            style={{
              background: b.color,
              opacity: b.opacity,
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
            }}
            aria-hidden="true"
          />
        ))}
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>01</span>
            <span>あなたのタイプ</span>
            <span className={s.rule} />
          </div>
          <SukarinCard
            name={type.name}
            desc={type.desc}
            userScores={userScores}
            imageSrc={sukarinSrc(type.code)}
          />
        </div>
      </section>

      <section className={`${s.band} ${s.traits}`} data-testid="results-band-traits">
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>02</span>
            <span>5軸プロファイル</span>
            <span className={s.rule} />
          </div>
          <TraitsPanel />
        </div>
      </section>

      <section className={`${s.band} ${s.match}`} data-testid="results-band-match">
        <div className={s.bandInner}>
          <div className={s.chapterMark}>
            <span className={s.num}>03</span>
            <span>あなたに合う課</span>
            <span className={s.rule} />
          </div>
          <MatchBrowse />
        </div>
      </section>

      <section className={`${s.band} ${s.actions}`} data-testid="results-band-actions">
        <div className={s.bandInner}>
          <ExportButton />
          <RetakeButton />
        </div>
      </section>
    </>
  );
}
