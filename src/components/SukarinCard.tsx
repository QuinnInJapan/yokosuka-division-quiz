// src/components/SukarinCard.tsx
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import type { AxisKey } from '../data/types';
import s from './SukarinCard.module.css';

export type SukarinCardProps = {
  code: string;
  name: string;
  desc: string;
  userScores: Record<AxisKey, number>;
  imageSrc?: string;
};

export function SukarinCard({ code, name, desc, userScores, imageSrc }: SukarinCardProps) {
  return (
    <div className={s.card} data-testid="sukarin-card">
      <div className={s.eyebrow}>あなたのスカリン</div>
      {imageSrc && (
        <div className={s.imgWrap}>
          <img className={s.img} src={imageSrc} alt={`${name}型のスカリン`} />
        </div>
      )}
      <div className={s.code}>{code}</div>
      <h1 className={s.name}>「{name}」型</h1>
      <div className={s.chips}>
        {AX.map((ax) => {
          const a = AXES[ax];
          const kanji = userScores[ax] >= 0 ? a.kanji_plus : a.kanji_minus;
          return (
            <div
              key={ax}
              className={s.chip}
              style={{ background: a.tint, color: a.dark }}
            >
              {kanji}
            </div>
          );
        })}
      </div>
      <p className={s.desc}>{desc}</p>
    </div>
  );
}
