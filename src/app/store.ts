import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit'
import {Counter} from '@self/features'

export const store = configureStore({
  reducer: {
    [Counter.slice.name]: Counter.slice.reducer,
  },
})

// @ts-ignore
export type AppDispatch = typeof store.dispatch;
// @ts-ignore
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
