import {Action, configureStore, ThunkAction} from '@reduxjs/toolkit'
import counterState from '../features/counter/state/counterState'

export const store = configureStore({
  reducer: {
    [counterState.name]: counterState.reducer,
  },
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
  RootState,
  unknown,
  Action<string>>;
