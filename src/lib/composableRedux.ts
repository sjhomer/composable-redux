import {CaseReducerActions, CreateSliceOptions, Slice} from '@reduxjs/toolkit/src/createSlice'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator} from '@reduxjs/toolkit/src/createAsyncThunk'
import {AppDispatch, RootState} from '@self/app/store'
import {Reducer} from 'redux'
import {CaseReducers} from '@reduxjs/toolkit/src/createReducer'
import {MapDispatchToPropsNonObject, MapStateToPropsParam} from 'react-redux/es/connect/selectorFactory'

export interface composableAsyncThunkActions {
  load: AsyncThunkPayloadCreator<any, any, {}>

  onLoad?(state: any): void

  onSuccess(state: any, action: any): void

  onError?(state: any): void
}

export interface composableAsyncThunk {
  actions: composableAsyncThunkActions
  options?: AsyncThunkOptions<any, {}>
}

export interface composableAsyncThunkFull extends composableAsyncThunk {
  async: AsyncThunk<any, any, {}>
}

export interface composableAsyncThunkList {
  [name: `${string}`]: composableAsyncThunk
}

export enum composableAsyncThunkStatus {
  idle = 'idle',
  pending = 'pending',
  failure = 'failure',
}

export interface mapStateToProps {
  state: RootState
  slice: any
  ownProps: any
}

export interface composableReduxProps {
  slice: CreateSliceOptions
  thunks?: composableAsyncThunkList
  mapStateToProps?(props: mapStateToProps): any
}

export interface composableReduxReturn {
  slice: Slice
  reducer: Reducer
  actions: CaseReducerActions<any>
  thunks: composableAsyncThunkList
  mapStateToProps: MapStateToPropsParam<any, any, any>
  mapActionToDispatches: MapDispatchToPropsNonObject<any, any>
}

export default function composableRedux(props: composableReduxProps): composableReduxReturn {
  const sliceName = props?.slice?.name
  if (!sliceName || !props.slice?.initialState || !props.slice?.reducers) {
    throw new Error('`slice` is a required option for composableRedux')
  }

  // Ready helpers for thunk building
  const thunks = props.thunks || {}
  /**
   * This allows us to loop through thunks.
   * @param {Function} action
   */
  const forEachThunk = (action: Function) => {
    Object.keys(thunks).forEach((type) => {
      const thunk = thunks[type] as composableAsyncThunkFull

      action(thunk, type)
    })
  }

  // Firstly, we need to create thunks. This will be needed to generate status checks in the extraReducers callback.
  forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
    thunk.async = createAsyncThunk(
      `${sliceName}/${type}`,
      // @ts-ignore
      thunk.actions.load,
      thunk.options,
    )
  })

  const slice = createSlice({
    ...props.slice,
    initialState: {
      ...props.slice.initialState,
      _thunkStatus: composableAsyncThunkStatus.idle,
    },
    extraReducers: (builder) => {
      // @ts-ignore
      props.slice?.extraReducers?.(builder)

      forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
        // Add cases for this thunk.
        builder
          .addCase(thunk.async.pending, (state) => {
            state._thunkStatus = composableAsyncThunkStatus.pending
            thunk.actions?.onLoad?.(state)
          })
          .addCase(thunk.async.fulfilled, (state, action) => {
            state._thunkStatus = composableAsyncThunkStatus.idle
            thunk.actions.onSuccess?.(state, action)
          })
          .addCase(thunk.async.rejected, (state) => {
            state._thunkStatus = composableAsyncThunkStatus.failure
            thunk.actions?.onError?.(state)
          })
      })
    },
  })
  const {reducer, actions} = slice
  const getSlicedState = (state: RootState) => state[sliceName]

  // Assign default fallback if not provided.
  if (!props.mapStateToProps) {
    props.mapStateToProps = ({state, slice, ownProps}) => {
      return {
        ...slice,
        ...ownProps,
      }
    }
  }

  return {
    slice,
    reducer,
    // @ts-ignore
    actions,
    thunks,
    getSlicedState,
    mapStateToProps: (state: RootState, ownProps: any) =>
      // @ts-ignore
      props.mapStateToProps({state, slice: getSlicedState(state), ownProps}),
    mapActionToDispatches: (dispatch: AppDispatch, ownProps: any) => {
      const dispatches = {}
      Object.keys(actions).forEach((key) => {
        // @ts-ignore
        dispatches[key] = (...args) => dispatch(actions[key](...args))
      })
      forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
        // @ts-ignore
        dispatches[type] = (...args) => dispatch(thunks[type].async(...args))
      })
      return dispatches
    },
  }
}
