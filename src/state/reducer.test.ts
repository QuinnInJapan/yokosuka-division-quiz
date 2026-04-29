import { describe, it, expect } from 'vitest';
import { reducer, initial, type State } from './reducer';
import { ORDER } from '../data/questions';

describe('reducer', () => {
  it('initial state is welcome', () => {
    expect(initial.screen).toBe('welcome');
    expect(initial.step).toBe(0);
    expect(initial.resp).toEqual({});
  });

  it('START moves to quiz and clears resp', () => {
    const after = reducer({ ...initial, resp: { A1: 5 } }, { type: 'START' });
    expect(after.screen).toBe('quiz');
    expect(after.step).toBe(0);
    expect(after.resp).toEqual({});
  });

  it('ANSWER records the response and advances step', () => {
    const s1 = reducer({ ...initial, screen: 'quiz' }, { type: 'ANSWER', value: 5 });
    expect(s1.resp[ORDER[0]]).toBe(5);
    expect(s1.step).toBe(1);
  });

  it('final ANSWER transitions to results screen', () => {
    const s: State = { ...initial, screen: 'quiz', step: ORDER.length - 1 };
    const last = reducer(s, { type: 'ANSWER', value: 4 });
    expect(last.screen).toBe('results');
    expect(last.sel).toBe(0);
    expect(last.traitIdx).toBe(0);
  });

  it('BACK respects step floor at 0', () => {
    const s = reducer({ ...initial, screen: 'quiz', step: 0 }, { type: 'BACK' });
    expect(s.step).toBe(0);
  });

  it('BACK decrements step', () => {
    const s = reducer({ ...initial, screen: 'quiz', step: 5 }, { type: 'BACK' });
    expect(s.step).toBe(4);
  });

  it('SEL sets the selected division index', () => {
    const s = reducer({ ...initial, screen: 'results' }, { type: 'SEL', idx: 7 });
    expect(s.sel).toBe(7);
  });

  it('TPREV wraps from 0 to 4', () => {
    const s = reducer({ ...initial, traitIdx: 0 }, { type: 'TPREV' });
    expect(s.traitIdx).toBe(4);
  });

  it('TNEXT wraps from 4 to 0', () => {
    const s = reducer({ ...initial, traitIdx: 4 }, { type: 'TNEXT' });
    expect(s.traitIdx).toBe(0);
  });

  it('TAXS maps an axis key to its index', () => {
    const s = reducer(initial, { type: 'TAXS', axis: 'C' });
    expect(s.traitIdx).toBe(2);
  });

  it('RETAKE resets to welcome and clears resp', () => {
    const s = reducer(
      { screen: 'results', step: 19, resp: { A1: 5 }, sel: 3, traitIdx: 2 },
      { type: 'RETAKE' },
    );
    expect(s.screen).toBe('welcome');
    expect(s.resp).toEqual({});
    expect(s.step).toBe(0);
  });
});
