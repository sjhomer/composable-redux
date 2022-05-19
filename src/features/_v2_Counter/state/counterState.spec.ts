import {actions, reducer} from './counterSlice'
import {CounterState, CounterStatus} from '../Counter.types'

describe('comp reducer', () => {
  const initialState: CounterState = {
    value: 3,
    status: CounterStatus.idle,
  };
  it('should handle initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual({
      value: 0,
      status: CounterStatus.idle,
    });
  });

  it('should handle increment', () => {
    const actual = reducer(initialState, actions.increment());
    expect(actual.value).toEqual(4);
  });

  it('should handle decrement', () => {
    const actual = reducer(initialState, actions.decrement());
    expect(actual.value).toEqual(2);
  });

  it('should handle incrementByAmount', () => {
    const actual = reducer(initialState, actions.incrementByAmount(2));
    expect(actual.value).toEqual(5);
  });
});
