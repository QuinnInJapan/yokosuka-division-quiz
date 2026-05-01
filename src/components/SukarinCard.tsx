import type { AxisKey } from '../data/types';
import s from './SukarinCard.module.css';

export type SukarinCardProps = {
  name: string;
  desc: string;
  userScores: Record<AxisKey, number>;
  imageSrc?: string;
  /**
   * Optional character index where the name should wrap onto a second line.
   * `name.slice(0, nameBreakAt)` is line 1, the rest is line 2 + suffix.
   * Hand-tuned per archetype in `src/data/archetypes.ts`.
   */
  nameBreakAt?: number;
};

export function SukarinCard({
  name,
  desc,
  imageSrc,
  nameBreakAt,
}: SukarinCardProps) {
  const hasBreak = nameBreakAt != null && nameBreakAt > 0 && nameBreakAt < name.length;
  const line1 = hasBreak ? name.slice(0, nameBreakAt) : name;
  const line2 = hasBreak ? name.slice(nameBreakAt) : '';

  return (
    <div className={s.card} data-testid="sukarin-card">
      {imageSrc && (
        <div className={s.imgWrap}>
          <img className={s.img} src={imageSrc} alt={`${name}型のスカリン`} />
        </div>
      )}
      <div className={s.body}>
        <h1 className={s.name}>
          {hasBreak ? (
            <>
              <span className={s.nameLine}>{line1}</span>
              <span className={s.nameLine}>
                {line2}
                <span className={s.suffix}>型</span>
              </span>
            </>
          ) : (
            <>
              <span className={s.nameLine}>
                {name}
                <span className={s.suffix}>型</span>
              </span>
            </>
          )}
        </h1>
        <p className={s.desc}>{desc}</p>
      </div>
    </div>
  );
}
