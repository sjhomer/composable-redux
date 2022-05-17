export const sliceName = 'counter'

export enum CounterActions {
  increment = 'increment',
  decrement = 'decrement',
  incrementByAmount = 'incrementByAmount',
  incrementAsync = 'incrementAsync',
  incrementIfOdd = 'incrementIfOdd',
}

export interface CounterDispatches {
  increment: Function
  decrement: Function
  incrementByAmount: Function
  incrementAsync: Function
  incrementIfOdd: Function
}

export enum CounterStatus {
  idle = 'idle',
  pending = 'pending',
  success = 'success',
  failure = 'failure',
  loading = 'loading',
}

export interface CounterState {
  value: number;
  status: CounterStatus;
}

export interface CounterOwnProps {
  initialValue?: number
}

export type CounterProps = CounterState & CounterOwnProps & CounterDispatches