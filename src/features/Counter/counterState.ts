import {composableRedux} from '@self/lib'
import {AnyAction, PayloadAction} from '@reduxjs/toolkit'
import {fetchCount} from '@self/lib/mockApi'
import {RootState} from '@self/app/store'
import {composableReduxInitialState, composableReduxReturn} from '@self/lib/composableRedux'

export type CounterState = {
  value: number
} & composableReduxInitialState

export interface CounterOwnProps {
  initialValue?: number
}

export interface CounterMapProps {
  state: RootState
  slice: CounterState
  ownProps: CounterOwnProps
}

export interface CounterActions {
  increment(): AnyAction

  decrement(): AnyAction

  incrementByAmount(amount: string | undefined): AnyAction
}

export interface CounterThunks {
  incrementAsync(amount: string | undefined): void
  // incrementIfOdd(): void
}

export type CounterDispatches = CounterActions & CounterThunks

export type CounterProps = CounterState & CounterOwnProps & CounterDispatches

const state = composableRedux({
  slice: {
    name: 'counter',
    initialState: {
      value: 0,
    } as CounterState,
    reducers: {
      increment: (state: CounterState) => {
        state.value++
      },
      decrement: (state: CounterState) => {
        state.value--
      },
      incrementByAmount: (state: CounterState, action: PayloadAction<string>) => {
        const value = parseInt(action.payload)
        // Only increment if the value is an int
        if (Number.isInteger(value)) {
          state.value += value
        }
      },
    },
  },
  thunks: {
    incrementAsync: {
      actions: {
        load: async (amount: number) => {
          const response = await fetchCount(amount)
          // The value we return becomes the `fulfilled` action payload
          return response.data
        },
        onSuccess: (state, action) => {
          const value = parseInt(action.payload)
          // Only increment if the value is an int
          if (Number.isInteger(value)) {
            state.value += value
          }
        },
      },
    },
  },
  // mapStateToProps: ({state, slice, ownProps}: CounterMapProps) => {
  //   return {
  //     ...slice,
  //     ...ownProps,
  //   }
  // },
})

export default state as composableReduxReturn & {
  actions: CounterActions
}
