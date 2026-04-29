import type { AxisKey, Responses, Response } from '../data/types';
import { AX } from '../data/types';
import { ORDER } from '../data/questions';

export type Screen = 'welcome' | 'quiz' | 'results';

export type State = {
  screen: Screen;
  step: number;
  resp: Responses;
  sel: number;
  traitIdx: number;
};

export type Action =
  | { type: 'START' }
  | { type: 'ANSWER'; value: Response }
  | { type: 'BACK' }
  | { type: 'SEL'; idx: number }
  | { type: 'TPREV' }
  | { type: 'TNEXT' }
  | { type: 'TAXS'; axis: AxisKey }
  | { type: 'RETAKE' };

export const initial: State = {
  screen: 'welcome',
  step: 0,
  resp: {},
  sel: 0,
  traitIdx: 0,
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { ...state, screen: 'quiz', step: 0, resp: {} };

    case 'ANSWER': {
      const id = ORDER[state.step];
      const resp: Responses = { ...state.resp, [id]: action.value };
      if (state.step < ORDER.length - 1) {
        return { ...state, resp, step: state.step + 1 };
      }
      return { ...state, resp, screen: 'results', sel: 0, traitIdx: 0 };
    }

    case 'BACK':
      return { ...state, step: Math.max(0, state.step - 1) };

    case 'SEL':
      return { ...state, sel: action.idx };

    case 'TPREV':
      return { ...state, traitIdx: (state.traitIdx + 4) % 5 };

    case 'TNEXT':
      return { ...state, traitIdx: (state.traitIdx + 1) % 5 };

    case 'TAXS':
      return { ...state, traitIdx: AX.indexOf(action.axis) };

    case 'RETAKE':
      return { ...initial };
  }
}
