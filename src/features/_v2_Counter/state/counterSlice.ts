import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {fetchCount} from './counterAPI'
import {CounterActions, CounterState, CounterStatus, sliceName} from '../Counter.types'
import {AppThunk, RootState} from '@self/app/store'

const initialState: CounterState = {
  value: 0,
  status: CounterStatus.idle,
}

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
const incrementAsync = createAsyncThunk(
  `${sliceName}/fetchCount`,
  async (amount: number) => {
    const response = await fetchCount(amount)
    // The value we return becomes the `fulfilled` action payload
    return response.data
  },
)

export const counterSlice = createSlice({
  name: sliceName,
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    [CounterActions.increment]: (state) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    [CounterActions.decrement]: (state) => {
      state.value -= 1
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    [CounterActions.incrementByAmount]: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = CounterStatus.loading
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = CounterStatus.idle
        state.value += action.payload
      })
      .addCase(incrementAsync.rejected, (state) => {
        state.status = CounterStatus.failure
      })
  },
})
export const {reducer, actions} = counterSlice
export const appState = (state: RootState) => state[sliceName]

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const incrementIfOdd = (amount: number): AppThunk => (dispatch, getState) => {
  const {value} = appState(getState())
  if (value % 2 === 1) {
    dispatch(actions.incrementByAmount(amount))
  }
}

export const thunks = {
  incrementAsync,
  incrementIfOdd,
}

export default counterSlice