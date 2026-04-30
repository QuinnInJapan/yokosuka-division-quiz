import { SukarinCard } from '../components/SukarinCard';
import { TraitsPanel } from '../components/TraitsPanel';
import { MatchBrowse } from '../components/MatchBrowse';
import { useDerived } from '../state/hooks';
import { sukarinSrc } from '../lib/sukarinImages';

export function Results() {
  const { type, userScores } = useDerived();
  return (
    <>
      <SukarinCard
        code={type.code}
        name={type.name}
        desc={type.desc}
        userScores={userScores}
        imageSrc={sukarinSrc(type.code)}
      />
      <TraitsPanel />
      <MatchBrowse />
    </>
  );
}
