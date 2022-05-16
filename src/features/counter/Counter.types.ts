export const typename = 'counter'

export enum CounterActions {
  increment = 'increment',
  decrement = 'decrement',
  incrementByAmount = 'incrementByAmount',
  incrementAsync = 'incrementAsync',
  incrementIfOdd = 'incrementIfOdd',
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
