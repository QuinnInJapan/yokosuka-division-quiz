import { useMemo, useReducer, type ReactNode } from 'react';
import { reducer, initial } from './reducer';
import { StoreContext } from './storeContext';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
