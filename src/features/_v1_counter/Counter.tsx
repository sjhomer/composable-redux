import React from 'react'
import styles from './Counter.module.css'
import useCounter from './useCounter'

export default function Counter() {
  const {displayValue, buttons, input} = useCounter()

  return (
    <div>
      <div className={styles.row}>
        {buttons.decrement}
        {displayValue}
        {buttons.increment}
      </div>
      <div className={styles.row}>
        {input.rendered}
        {buttons.incrementByAmount}
        {buttons.incrementAsync}
        {buttons.incrementIfOdd}
      </div>
    </div>
  )
}
