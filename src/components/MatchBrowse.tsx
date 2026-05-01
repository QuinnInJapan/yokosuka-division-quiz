import { useStore, useDerived } from '../state/hooks';
import { MatchList } from './MatchList';
import { MatchDetail } from './MatchDetail';
import s from './MatchBrowse.module.css';

export function MatchBrowse() {
  const { state } = useStore();
  const { results } = useDerived();
  const selected = results[state.sel];

  return (
    <div className={s['match-section']}>
      <p className={s['match-section-sub']}>
        5つの軸のプロファイルを比較して相性を算出しています
      </p>
      <div className={s['match-browse']}>
        <div className={s['list-col']}>
          <MatchList items={results} />
        </div>
        <div className={s['detail-col']}>
          <MatchDetail division={selected} />
        </div>
      </div>
    </div>
  );
}
