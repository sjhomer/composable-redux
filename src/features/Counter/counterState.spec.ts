import state, {CounterState} from './counterState'

const {actions, reducer} = state
describe('comp reducer', () => {
  const initialState: CounterState = {
    value: 3,
    thunks: {
      incrementAsync: {
        isLoading: false,
        isIdle: true,
        hasError: false,
      }
    }
  }
  it('should handle initial state', () => {
    expect(reducer(undefined, {type: 'unknown'})).toEqual({
      ...initialState,
      value: 0,
    })
  })

  it('should handle increment', () => {
    const actual = state.reducer(initialState, actions.increment())
    expect(actual.value).toEqual(4)
  })

  it('should handle decrement', () => {
    const actual = state.reducer(initialState, actions.decrement())
    expect(actual.value).toEqual(2)
  })

  it('should handle incrementByAmount', () => {
    const actual = reducer(initialState, actions.incrementByAmount('2'))
    expect(actual.value).toEqual(5)
  })
})
