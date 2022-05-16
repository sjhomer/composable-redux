import React from 'react'
import TextInput from '../form/input/TextInput'
import useCounterState from './state/useCounterState'
import styles from './Counter.module.css'

export default function useCounter() {
  const {counterState, dispatches} = useCounterState()

  const displayValue = <span className={styles.value}>{counterState.value}</span>

  const input = TextInput({initialValue: counterState.value, ariaLabel: 'Set increment amount'})

  const buttons = {
    decrement: <button
      className={styles.button}
      aria-label="Decrement value"
      onClick={() => dispatches.decrement()}
    >
      -
    </button>,
    increment: <button
      className={styles.button}
      aria-label="Increment value"
      onClick={() => dispatches.increment()}
    >
      +
    </button>,
    incrementByAmount: <button
      className={styles.button}
      onClick={() => dispatches.incrementByAmount(input.value)}
    >
      Add Amount
    </button>,
    incrementAsync: <button
      className={styles.asyncButton}
      onClick={() => dispatches.incrementAsync(input.value)}
    >
      Add Async
    </button>,
    incrementIfOdd: <button
      className={styles.button}
      onClick={() => dispatches.incrementIfOdd(input.value)}
    >
      Add If Odd
    </button>,
  }

  return {
    counterState,
    buttons,
    input,
    displayValue,
  }
}
