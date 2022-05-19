import {actions, thunks} from './counterSlice'
import {CounterActions, CounterProps} from '../Counter.types'
import {AppDispatch} from '@self/app/store'

export default function counterDispatches(dispatch: AppDispatch, ownProps: CounterProps) {
  return {
    [CounterActions.increment]: () => dispatch(actions.increment()),
    [CounterActions.decrement]: () => dispatch(actions.decrement()),
    [CounterActions.incrementByAmount]: (amount: string | undefined) => dispatch(
      actions.incrementByAmount(parseInt(amount || ''))),
    [CounterActions.incrementAsync]: (amount: string | undefined) => dispatch(
      thunks.incrementAsync(parseInt(amount || ''))),
    [CounterActions.incrementIfOdd]: (amount: string | undefined) => dispatch(
      thunks.incrementIfOdd(parseInt(amount || ''))),
  }
}
