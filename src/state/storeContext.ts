import { createContext, type Dispatch } from 'react';
import type { State, Action } from './reducer';

export type StoreValue = { state: State; dispatch: Dispatch<Action> };

export const StoreContext = createContext<StoreValue | null>(null);
