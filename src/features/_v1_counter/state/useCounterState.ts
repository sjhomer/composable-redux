import {useAppDispatch, useAppSelector} from '../../../app/hooks'
import {actions, appState, thunks} from './counterState'
import {CounterActions} from '../Counter.types'

export default function useCounterState() {
  const counterState = useAppSelector(appState)
  const dispatch = useAppDispatch()

  const dispatches = {
    [CounterActions.increment]: () => dispatch(actions.increment()),
    [CounterActions.decrement]: () => dispatch(actions.decrement()),
    [CounterActions.incrementByAmount]: (amount: string | undefined) => dispatch(
      actions.incrementByAmount(parseInt(amount || ''))),
    [CounterActions.incrementAsync]: (amount: string | undefined) => dispatch(
      thunks.incrementAsync(parseInt(amount || ''))),
    [CounterActions.incrementIfOdd]: (amount: string | undefined) => dispatch(
      thunks.incrementIfOdd(parseInt(amount || ''))),
  }

  return {
    counterState,
    dispatches,
  }
}
