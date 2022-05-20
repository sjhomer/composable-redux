import {CaseReducerActions, CreateSliceOptions, Slice} from '@reduxjs/toolkit/src/createSlice'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator} from '@reduxjs/toolkit/src/createAsyncThunk'
import {AppDispatch, RootState} from '@self/app/store'
import {Reducer} from 'redux'
import {MapDispatchToPropsNonObject, MapStateToPropsParam} from 'react-redux/es/connect/selectorFactory'
import {connect, ConnectedProps} from 'react-redux'
import {ComponentType} from 'react'

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

export interface composableDispatchList {
  [name: `${string}`]: Function
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
  mapStateToProps: MapStateToPropsParam<RootState, Object, Object>
  mapDispatchToProps: MapDispatchToPropsNonObject<any, any>

  connectComponent(component: ComponentType): ConnectedProps<any>
}

interface defaultMapDispatchToProps {
  state: RootState
  slice: Object
  ownProps: Object
}

const defaultMapStateToProps = ({state, slice, ownProps}: defaultMapDispatchToProps) => {
  return {
    ...slice,
    ...ownProps,
  }
}

const slices = [] as Array<string>

export default function composableRedux(props: composableReduxProps): composableReduxReturn {
  const sliceName = props?.slice?.name
  if (!sliceName || !props.slice?.initialState || !props.slice?.reducers) {
    throw new Error('`slice` is a required option for composableRedux')
  }
  if (slices.includes(sliceName)) {
    throw new Error(`slice ${sliceName} already exists! Please choose a different name.`)
  }
  slices.push(sliceName)

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
    const {actions: {load}, options} = thunk
    thunk.async = createAsyncThunk(
      `${sliceName}/${type}`,
      // @ts-ignore
      load,
      options,
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
        const {async: asyncThunk, actions: {onLoad, onSuccess, onError}} = thunk
        // Add cases for this thunk.
        builder
          .addCase(asyncThunk.pending, (state) => {
            state._thunkStatus = composableAsyncThunkStatus.pending
            onLoad?.(state)
          })
          .addCase(asyncThunk.fulfilled, (state, action) => {
            state._thunkStatus = composableAsyncThunkStatus.idle
            onSuccess?.(state, action)
          })
          .addCase(asyncThunk.rejected, (state) => {
            state._thunkStatus = composableAsyncThunkStatus.failure
            onError?.(state)
          })
      })
    },
  })
  const {reducer, actions} = slice
  const getSlicedState = (state: RootState) => state[sliceName]

  // Assign default fallback if not provided.
  const mapStateToProps = (state: RootState, ownProps: any) =>
    (
      props.mapStateToProps || defaultMapStateToProps
    )({state, slice: getSlicedState(state), ownProps})

  let mapDispatchToProps = (dispatch: AppDispatch, ownProps: any) => {
    const dispatches = {} as composableDispatchList
    Object.keys(actions).forEach((key) => {
      if (dispatches[key]) {
        throw new Error(`dispatches ${key} already exists! Please choose a different name for these reducers.`)
      }
      dispatches[key] = (...args: [payload: any]) => dispatch(actions[key]?.apply(null, args))
    })
    forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
      if (dispatches[type]) {
        throw new Error(
          `dispatches ${type} already exists! Please choose a different name for this thunk (and check if a reducer is already using it, as all must be unique).`)
      }
      dispatches[type] = (...args: [arg: any]) => dispatch(thunk.async?.apply(null, args))
    })
    return dispatches
  }
  return {
    slice,
    reducer,
    // @ts-ignore
    actions,
    thunks,
    getSlicedState,
    mapStateToProps,
    mapDispatchToProps,
    connectComponent: (component) => connect(mapStateToProps, mapDispatchToProps)(component),
  }
}
