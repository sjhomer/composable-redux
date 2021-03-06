import {composableRedux} from '@self/lib'
import {AnyAction, PayloadAction} from '@reduxjs/toolkit'
import {fetchCount} from '@self/lib/mockApi'
import type {AppDispatch, RootState} from '@self/app/store'
import {composableAsyncThunkState, composableReduxInitialState} from '@self/lib/composableRedux'

export interface CounterThunks {
  incrementAsync: composableAsyncThunkState
}

export interface CounterThunkDispatches {
  incrementAsync(amount: string | undefined): void
}

export type CounterState = {
  value: number
  thunks?: CounterThunks
}

export interface CounterOwnProps {
  initialValue?: number
}

export interface CounterActions {
  increment(): AnyAction

  decrement(): AnyAction

  incrementByAmount(amount: string | undefined): AnyAction
}

export type CounterProps = {
  state: CounterState & composableReduxInitialState
  dispatches: CounterActions & CounterThunkDispatches
} & CounterOwnProps

const state = composableRedux<RootState, AppDispatch, CounterState>({
  slice: {
    name: 'counter',
    initialState: {
      value: 0,
    },
    reducers: {
      increment: (state) => {
        state.value++
      },
      decrement: (state) => {
        state.value--
      },
      incrementByAmount: (state, action: PayloadAction<string>) => {
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
        trigger: async (amount: number) => {
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
})

export default state
