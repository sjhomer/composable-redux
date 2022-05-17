import {CounterOwnProps} from '../Counter.types'
import {appState} from './counterSlice'
import {RootState} from '@self/app/store'

export default function counterState(state: RootState, ownProps: CounterOwnProps) {
  const { value, status } = appState(state)
  const { initialValue } = ownProps
  return {
    value,
    status,
    initialValue,
  }
}