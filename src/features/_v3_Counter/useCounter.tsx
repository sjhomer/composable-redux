import React from 'react'
import TextInput from '../form/input/TextInput'
import styles from './Counter.module.css'
import {CounterProps} from './counterState'

export default function useCounter(props: CounterProps) {
  // State from connect
  const {value, initialValue, thunks} = props
  // Dispatches from connect
  const {decrement, increment, incrementAsync, incrementByAmount} = props
  const displayValue = <span className={styles.value}>{value}</span>

  const input = TextInput({initialValue: value || initialValue, ariaLabel: 'Set increment amount'})

  const buttons = {
    decrement: <button
      className={styles.button}
      aria-label="Decrement value"
      onClick={() => decrement()}
      disabled={thunks?.incrementAsync?.isLoading}
    >
      -
    </button>,
    increment: <button
      className={styles.button}
      aria-label="Increment value"
      onClick={() => increment()}
      disabled={thunks?.incrementAsync?.isLoading}
    >
      +
    </button>,
    incrementByAmount: <button
      className={styles.button}
      onClick={() => incrementByAmount(input.value)}
      disabled={thunks?.incrementAsync?.isLoading}
    >
      Add Amount
    </button>,
    incrementAsync: <button
      className={styles.asyncButton}
      onClick={() => incrementAsync(input.value)}
      disabled={thunks?.incrementAsync?.isLoading}
    >
      Add Async
    </button>,
    // incrementIfOdd: <button
    //   className={styles.button}
    //   onClick={() => incrementIfOdd(input.value)}
    //   disabled={thunks?.incrementAsync?.isLoading}
    // >
    //   Add If Odd
    // </button>,
  }

  return {
    buttons,
    input,
    displayValue,
  }
}
