import { useStore } from '../state/hooks';
import { ORDER, QMAP } from '../data/questions';
import { AXES } from '../data/axes';
import { ProgressBar } from '../components/ProgressBar';
import s from './Quiz.module.css';

export function Quiz() {
  const { state, dispatch } = useStore();
  const qid = ORDER[state.step];
  const q = QMAP[qid];
  const ax = AXES[q.axis];

  const prev = state.resp[qid];
  const total = ORDER.length;
  const remaining = total - state.step - 1;
  let flourish = '';
  if (state.step === 0) flourish = 'ゆっくり考えて大丈夫です';
  else if (remaining === 1) flourish = 'あと2問';
  else if (remaining === 0) flourish = 'ラスト1問！';

  return (
    <div className={s['quiz-content']}>
      <ProgressBar step={state.step} />
      <div className={s['quiz-meta']}>
        <span className={s['q-num']}>
          Q.{state.step + 1} <span aria-hidden="true">/</span> {ORDER.length}
          {flourish && <span className={s['q-flourish']}>{flourish}</span>}
        </span>
        <span
          className={s['axis-tag']}
          style={{ background: ax.tint, color: ax.dark }}
        >
          {ax.label}
        </span>
      </div>
      <h1 className={s.scenario} style={{ color: ax.dark }}>
        {q.scenario}
      </h1>
      <p className={s['opts-label']} id={`opts-label-${state.step}`}>
        この場面、あなたにはどのくらい合っていますか？
      </p>
      <div role="group" aria-labelledby={`opts-label-${state.step}`}>
        {q.options.map((o, i) => {
          const value = (i + 1) as 1 | 2 | 3 | 4 | 5;
          const isSelected = prev === value;
          return (
            <button
              key={i}
              className={s.opt}
              style={
                isSelected
                  ? { borderColor: ax.dark, background: ax.tint }
                  : undefined
              }
              onClick={() => dispatch({ type: 'ANSWER', value })}
            >
              <span className={s['opt-num']} style={{ color: ax.dark }}>
                {i + 1}
              </span>
              {o}
            </button>
          );
        })}
      </div>
      {state.step > 0 && (
        <button
          className={s['btn-back']}
          onClick={() => dispatch({ type: 'BACK' })}
        >
          ← 戻る
        </button>
      )}
    </div>
  );
}
