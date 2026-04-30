import type { AxisKey } from '../data/types';
import s from './SukarinCard.module.css';

export type SukarinCardProps = {
  code: string;
  name: string;
  desc: string;
  userScores: Record<AxisKey, number>;
  imageSrc?: string;
};

export function SukarinCard({ code, name, desc, imageSrc }: SukarinCardProps) {
  return (
    <div className={s.card} data-testid="sukarin-card">
      {imageSrc && (
        <div className={s.imgWrap}>
          <img className={s.img} src={imageSrc} alt={`${name}型のスカリン`} />
        </div>
      )}
      <div className={s.code}>{code}</div>
      <h1 className={s.name}>「{name}」型</h1>
      <p className={s.desc}>{desc}</p>
    </div>
  );
}
