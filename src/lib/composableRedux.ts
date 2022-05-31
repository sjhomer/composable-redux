// Libs
import React, {ComponentType} from 'react'
import {connect} from 'react-redux'
import {createAsyncThunk, createSlice, Slice} from '@reduxjs/toolkit'
// Types
import type {CaseReducerActions, CreateSliceOptions, SliceCaseReducers} from '@reduxjs/toolkit/src/createSlice'
import type {AsyncThunk, AsyncThunkOptions, AsyncThunkPayloadCreator} from '@reduxjs/toolkit/src/createAsyncThunk'
import type {MapStateToPropsParam} from 'react-redux/es/connect/selectorFactory'
import type {Reducer} from 'redux'

interface composableAsyncThunkActions {
  trigger: AsyncThunkPayloadCreator<any, any, {}>

  onLoad?(state: any): void

  onSuccess(state: any, action: any): void

  onError?(state: any): void
}

interface composableAsyncThunk {
  actions: composableAsyncThunkActions
  options?: AsyncThunkOptions<any, {}>
}

interface composableAsyncThunkFull extends composableAsyncThunk {
  async: AsyncThunk<any, any, {}>
  sliceName: string
}

interface composableAsyncThunkList {
  [name: `${string}`]: composableAsyncThunk
}

interface composableDispatchList {
  [name: `${string}`]: Function
}

interface composableDispatches {
  dispatches: composableDispatchList
}

export interface composableAsyncThunkState {
  isLoading: boolean
  isIdle: boolean
  hasError: boolean
}

interface composableAsyncThunkStatuses {
  [name: `${string}`]: composableAsyncThunkState,
}

export interface composableReduxInitialState {
  thunks: composableAsyncThunkStatuses
}

interface mapStateToProps<RootState> {
  state: RootState
  slice: any
  ownProps: any
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface composableReduxProps<RootState, AppDispatch, State, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
  slice: CreateSliceOptions<State, CaseReducers, Name>
  thunks?: composableAsyncThunkList

  mapStateToProps?(props: mapStateToProps<RootState>): any
}

interface defaultMapDispatchToProps<RootState, State, OwnProps> {
  state: RootState
  slice: State & composableReduxInitialState
  ownProps: OwnProps
}

interface connectToCompFn<OwnProps> {
  (component: ComponentType): React.FC<OwnProps>
}

interface composableReduxReturn<RootState, AppDispatch, State, OwnProps = any, CaseReducers extends SliceCaseReducers<State & composableReduxInitialState> = SliceCaseReducers<State & composableReduxInitialState>, Name extends string = string> {
  slice: Slice<State & composableReduxInitialState, CaseReducers, Name>
  reducer: Reducer<State & composableReduxInitialState>
  actions: CaseReducerActions<CaseReducers>
  thunks: composableAsyncThunkList
  connect: connectToCompFn<OwnProps>

  mapStateToProps(state: RootState, ownProps: OwnProps): MapStateToPropsParam<RootState, OwnProps, State>

  mapDispatchToProps(dispatch: AppDispatch, ownProps: OwnProps): composableDispatches

  getSlicedState(state: RootState): any
}

const slices = [] as Array<string>

const composableRedux = <RootState, AppDispatch, State>(props: composableReduxProps<RootState, AppDispatch, State>): composableReduxReturn<RootState, AppDispatch, State> => {
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
    thunks: {},
  } as State & composableReduxInitialState

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

  const slice = createSlice<State & composableReduxInitialState, SliceCaseReducers<State & composableReduxInitialState>>(
    {
      name: sliceName,
      initialState,
      reducers: {
        ...props.slice.reducers,
        resetState: (state: any) => {
          state = initialState
        },
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
  const getSlicedState = (state: RootState) => state[sliceName] as State

  // Assign default fallback if not provided.
  const mapStateToProps = <OwnProps>(
    state: RootState, ownProps: OwnProps): MapStateToPropsParam<RootState, OwnProps, State> => {
    const defaultMapStateToProps = <OwnProps>({
      state,
      slice,
      ownProps,
    }: defaultMapDispatchToProps<RootState, State, OwnProps>) => {
      return {
        state: {
          ...slice as State,
          ...ownProps as OwnProps,
        },
      }
    }

    return (
      props.mapStateToProps || defaultMapStateToProps
    )({state, slice: getSlicedState(state), ownProps})
  }

  let mapDispatchToProps = <OwnProps>(dispatch: AppDispatch, ownProps: OwnProps): composableDispatches => {
    const dispatches = {} as composableDispatchList
    Object.keys(actions).forEach((key) => {
      if (dispatches[key]) {
        throw new Error(`dispatches ${key} already exists! Please choose a different name for these reducers.`)
      }
      // @ts-ignore
      dispatches[key] = (...args: [payload: any]) => dispatch(actions[key]?.apply(null, args))
    })
    forEachThunk((thunk: composableAsyncThunkFull, type: string) => {
      if (dispatches[type]) {
        throw new Error(
          `dispatches ${type} already exists! Please choose a different name for this thunk (and check if a reducer is already using it, as all must be unique).`)
      }
      // @ts-ignore
      dispatches[type] = (...args: [arg: any]) => dispatch(thunk.async?.apply(null, args))
    })
    return {
      dispatches,
    }
  }

  const connectToComp = <OwnProps>(component: ComponentType): React.FC<OwnProps> =>
    // @ts-ignore
    connect(
      (state: RootState, ownProps: OwnProps) => mapStateToProps<OwnProps>(state, ownProps),
      // @ts-ignore
      (dispatch: AppDispatch, ownProps: OwnProps) => mapDispatchToProps<OwnProps>(dispatch, ownProps),
    )(
      component)

  return {
    slice,
    reducer,
    actions,
    thunks,
    getSlicedState,
    mapStateToProps,
    mapDispatchToProps,
    connect: connectToComp,
  }
}

export default composableRedux