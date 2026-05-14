import { useDerived } from '../state/hooks';
import { AX } from '../data/types';
import { TraitBar } from './TraitBar';
import s from './TraitsPanel.module.css';

export function TraitsPanel() {
  const { userScores } = useDerived();

  return (
    <div className={s['traits-grid']}>
      <div className={s['bars-panel']}>
        {AX.map((ax) => (
          <TraitBar
            key={ax}
            axis={ax}
            score={userScores[ax]}
          />
        ))}
      </div>
    </div>
  );
}
