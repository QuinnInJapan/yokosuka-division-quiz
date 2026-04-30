import { useState } from 'react';
import { AXES } from '../../../data/axes';
import s from './Slide2Input.module.css';

/*
  Slide 1 (Input)
  Mirrors the actual Quiz.tsx UI exactly: meta row (Q.N / 20 + axis tag pill),
  centered axis-dark scenario, 5 stacked option buttons with numbered prefix.
  Selecting an option highlights the button with axis-dark border + axis-tint bg
  — the same visual contract the real quiz uses.
*/

// Real question C1 from questions.json (axis C: 担う役割).
const Q = {
  axis: 'C' as const,
  num: 1,
  total: 20,
  scenario:
    '生活費に困っている市民が相談に来た。使える制度を複数調べて提案し、申請まで一緒に伴走した。',
  options: [
    '責任が重くて気が重い',
    'あまり気が進まない',
    'どちらでもない',
    '力になれる実感がある',
    'この種の仕事に最もやりがいを感じる',
  ],
};

export function Slide2Input() {
  const [picked, setPicked] = useState<number | null>(null);
  const ax = AXES[Q.axis];

  return (
    <div className={s.slide}>
      <header className={s.head}>
        <h2 className={s.title}>STEP 01 · 入力</h2>
        <div className={s.stripe} />
        <p className={s.sub}>ひとつの場面に、5段階で答える。</p>
      </header>

      <div className={s.meta}>
        <span className={s.qNum}>
          Q.{Q.num} <span aria-hidden="true">/</span> {Q.total}
        </span>
        <span className={s.axisTag} style={{ background: ax.tint, color: ax.dark }}>
          {ax.label}
        </span>
      </div>

      <p className={s.scenario} style={{ color: ax.dark }}>
        {Q.scenario}
      </p>

      <p className={s.optsLabel}>この場面、あなたにはどのくらい合っていますか？</p>

      <div role="radiogroup" aria-label="あなたの答え">
        {Q.options.map((o, i) => {
          const value = i + 1;
          const selected = picked === value;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              className={s.opt}
              style={
                selected
                  ? { borderColor: ax.dark, background: ax.tint }
                  : undefined
              }
              onClick={() => setPicked(value)}
            >
              <span className={s.optNum} style={{ color: ax.dark }}>
                {value}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
