import { useStore, useDerived } from '../state/hooks';
import { AX } from '../data/types';
import { TraitCarousel } from './TraitCarousel';
import { TraitBar } from './TraitBar';
import s from './TraitsPanel.module.css';

export function TraitsPanel() {
  const { state } = useStore();
  const { userScores } = useDerived();

  return (
    <div className={`${s['traits-grid']} section-gap`}>
      <div className={`card ${s['tc-panel']}`}>
        <TraitCarousel />
      </div>
      <div className={`card ${s['bars-panel']}`}>
        {AX.map((ax, i) => (
          <TraitBar
            key={ax}
            axis={ax}
            score={userScores[ax]}
            active={i === state.traitIdx}
          />
        ))}
      </div>
    </div>
  );
}
