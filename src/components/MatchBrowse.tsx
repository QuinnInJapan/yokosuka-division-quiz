import { useStore, useDerived } from '../state/hooks';
import { MatchList } from './MatchList';
import { MatchDetail } from './MatchDetail';
import { RetakeButton } from './RetakeButton';
import { ExportButton } from './ExportButton';
import s from './MatchBrowse.module.css';

export function MatchBrowse() {
  const { state } = useStore();
  const { results } = useDerived();
  const selected = results[state.sel];

  return (
    <div className={`${s['match-section']} section-gap`}>
      <div className={s['match-section-title']}>あなたに合う課</div>
      <div className={s['match-section-sub']}>
        5つの軸のプロファイルを比較して相性を算出しています
      </div>
      <div className={s['match-browse']}>
        <MatchList items={results} />
        <div className={s['detail-col']}>
          <MatchDetail division={selected} />
        </div>
      </div>
      <div className={s['bottom-actions']}>
        <ExportButton />
        <RetakeButton />
      </div>
    </div>
  );
}
