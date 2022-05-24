import React, {ComponentType} from 'react'
import state, {CounterOwnProps, CounterProps} from './counterState'
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
        {/*{buttons.incrementIfOdd}*/}
      </div>
    </div>
  )
}

export default state.connect(Counter as ComponentType) as React.FC<CounterOwnProps>