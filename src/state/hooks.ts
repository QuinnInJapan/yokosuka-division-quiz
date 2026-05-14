import { useContext, useMemo } from 'react';
import { StoreContext, type StoreValue } from './storeContext';
import { axisScores, determineType, rankAll } from '../lib/scoring';
import type { AxisKey, RankedDivision, ResolvedArchetype } from '../data/types';
import { useConfig } from '../config/ConfigProvider';

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>');
  return ctx;
}

export type Derived = {
  userScores: Record<AxisKey, number>;
  type: ResolvedArchetype;
  results: RankedDivision[];
};

export function useDerived(): Derived {
  const { state } = useStore();
  const config = useConfig();
  return useMemo(() => {
    const userScores = axisScores(state.resp, config);
    return {
      userScores,
      type: determineType(userScores, config),
      results: rankAll(state.resp, config),
    };
  }, [config, state.resp]);
}
