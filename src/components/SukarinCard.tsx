import type { AxisKey } from '../data/types';
import s from './SukarinCard.module.css';

export type SukarinCardProps = {
  name: string;
  desc: string;
  userScores: Record<AxisKey, number>;
  imageSrc?: string;
};

export function SukarinCard({ name, desc, imageSrc }: SukarinCardProps) {
  return (
    <div className={s.card} data-testid="sukarin-card">
      {imageSrc && (
        <div className={s.imgWrap}>
          <img className={s.img} src={imageSrc} alt={`${name}型のスカリン`} />
        </div>
      )}
      <div className={s.body}>
        <h1 className={s.name}>{name}<span className={s.suffix}>型</span></h1>
        <p className={s.desc}>{desc}</p>
      </div>
    </div>
  );
}
