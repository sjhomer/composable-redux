import {CaseReducerActions, CreateSliceOptions, Slice} from '@reduxjs/toolkit/src/createSlice'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import {AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator} from '@reduxjs/toolkit/src/createAsyncThunk'
import {AppDispatch, RootState} from '@self/app/store'
import {Reducer} from 'redux'
import {MapDispatchToPropsNonObject, MapStateToPropsParam} from 'react-redux/es/connect/selectorFactory'
import {connect, ConnectedProps} from 'react-redux'
import {ComponentType} from 'react'

export interface composableAsyncThunkActions {
  trigger: AsyncThunkPayloadCreator<any, any, {}>

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
  sliceName: string
}

export interface composableAsyncThunkList {
  [name: `${string}`]: composableAsyncThunk
}

export interface composableDispatchList {
  [name: `${string}`]: Function
}

export interface composableAsyncThunkState {
  isLoading: boolean
  isIdle: boolean
  hasError: boolean
}

export interface composableAsyncThunkStatuses {
  [name: `${string}`]: composableAsyncThunkState,
}

export interface composableReduxInitialState {
  thunks?: composableAsyncThunkStatuses
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
  getSlicedState(state: RootState): any
  connect(component: ComponentType): ConnectedProps<any>
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
  // Store slice name for validation checks later.
  slices.push(sliceName)

  // Abstract out initial state, so we can add possible thunk status states.
  const initialState = {
    ...props.slice.initialState,
    thunks: {}
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
    const {actions: {trigger}, options} = thunk
    thunk.async = createAsyncThunk(
      `${sliceName}/${type}`,
      // @ts-ignore
      trigger,
      options,
    )

    // Also, build initial status state for this thunk.
    initialState.thunks[type] = {
      isLoading: false,
      isIdle: true,
      hasError: false,
    }
  })

  const slice = createSlice({
    name: sliceName,
    initialState,
    reducers: {
      ...props.slice.reducers,
      resetState: (state: any) => {
        state = initialState
      }
    },
    extraReducers: (builder) => {
      // @ts-ignore
      props.slice?.extraReducers?.(builder)

      forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
        const {async: asyncThunk, actions: {onLoad, onSuccess, onError}} = thunk
        // Add cases for this thunk.
        builder
          .addCase(asyncThunk.pending, (state) => {
            state.thunks[type].isLoading = true
            state.thunks[type].isIdle = false
            state.thunks[type].hasError = false
            onLoad?.(state)
          })
          .addCase(asyncThunk.fulfilled, (state, action) => {
            state.thunks[type].isLoading = false
            state.thunks[type].isIdle = true
            state.thunks[type].hasError = false
            onSuccess?.(state, action)
          })
          .addCase(asyncThunk.rejected, (state) => {
            state.thunks[type].isLoading = false
            state.thunks[type].isIdle = false
            state.thunks[type].hasError = true
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
    connect: (component) => connect(mapStateToProps, mapDispatchToProps)(component),
  }
}
