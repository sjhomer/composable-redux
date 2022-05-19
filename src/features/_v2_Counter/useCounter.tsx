import React from 'react'
import TextInput from '../form/input/TextInput'
import styles from './Counter.module.css'
import {CounterProps} from './Counter.types'

export default function useCounter(props: CounterProps) {
  // State from connect
  const {value, initialValue} = props
  // Dispatches from connect
  const {decrement, increment, incrementAsync, incrementByAmount, incrementIfOdd} = props
  const displayValue = <span className={styles.value}>{value}</span>

  const input = TextInput({initialValue: value || initialValue, ariaLabel: 'Set increment amount'})

  const buttons = {
    decrement: <button
      className={styles.button}
      aria-label="Decrement value"
      onClick={() => decrement()}
    >
      -
    </button>,
    increment: <button
      className={styles.button}
      aria-label="Increment value"
      onClick={() => increment()}
    >
      +
    </button>,
    incrementByAmount: <button
      className={styles.button}
      onClick={() => incrementByAmount(input.value)}
    >
      Add Amount
    </button>,
    incrementAsync: <button
      className={styles.asyncButton}
      onClick={() => incrementAsync(input.value)}
    >
      Add Async
    </button>,
    incrementIfOdd: <button
      className={styles.button}
      onClick={() => incrementIfOdd(input.value)}
    >
      Add If Odd
    </button>,
  }

  return {
    buttons,
    input,
    displayValue,
  }
}
