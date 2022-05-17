import React from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {CounterOwnProps, CounterProps} from './Counter.types'
import {counterDispatches, counterState} from './state'
import useCounter from './useCounter'
import styles from './Counter.module.css'

const Counter = (props: CounterProps) => {
  const {displayValue, buttons, input} = useCounter(props)

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

export default connect(counterState, counterDispatches)(Counter) as ConnectedProps<any> as React.FC<CounterOwnProps>