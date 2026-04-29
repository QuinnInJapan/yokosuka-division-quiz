import { useStore } from '../state/hooks';
import { AXES } from '../data/axes';
import { AX } from '../data/types';
import s from './Welcome.module.css';

export function Welcome() {
  const { dispatch } = useStore();

  const pills = AX.map(ax => {
    const a = AXES[ax];
    return (
      <span
        key={ax}
        className={s.apill}
        style={{ background: a.tint, color: a.dark }}
      >
        {a.label}
      </span>
    );
  });

  return (
    <>
      <div className={s['w-header']}>
        <div className={s['w-city']}>Yokosuka City Hall</div>
        <h1 className={s['w-title']}>
          横須賀市役所
          <br />
          部署タイプ診断
        </h1>
        <p className={s['w-sub']}>
          20の質問に答えるだけで、
          <br />
          あなたにぴったりの課が見つかります
        </p>
      </div>
      <div className="card">
        <div className={s['axis-pills']}>{pills}</div>
        <p className={s['w-intro']}>
          5つの視点からあなたの「働き方タイプ」を診断し、全102課の中から相性の高い部署をランキングでご紹介します。
        </p>
        <div className={s['w-steps']}>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>1</span>
            <span>20の仕事場面に、あなたがどう感じるか回答</span>
          </div>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>2</span>
            <span>5つの軸であなたの「働き方タイプ」を診断</span>
          </div>
          <div className={s['w-step']}>
            <span className={s['w-step-num']}>3</span>
            <span>全102課との相性をランキングで発表！</span>
          </div>
        </div>
        <div className={s['w-stats']}>
          <div className={s.stat}>
            <div className={s['stat-n']}>20</div>
            <div className={s['stat-l']}>質問数</div>
          </div>
          <div className={s.stat}>
            <div className={s['stat-n']}>5</div>
            <div className={s['stat-l']}>診断軸</div>
          </div>
          <div className={s.stat}>
            <div className={s['stat-n']}>102</div>
            <div className={s['stat-l']}>対象の課</div>
          </div>
        </div>
        <button
          className={s['btn-start']}
          onClick={() => dispatch({ type: 'START' })}
        >
          診断をはじめる →
        </button>
      </div>
    </>
  );
}
