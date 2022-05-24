# composable-redux [Draft]

> A tidy way to compose Redux in React.

## Installation

```bash
npm install --save composable-redux
```

## Usage

```ts
import composableRedux from 'composable-redux';

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
        trigger: async (amount: number) => {
          const response = await fetchCount(amount)
          // The value we return becomes the `fulfilled` action payload
          return response.data
        },
        // onLoad: (state) => {}
        onSuccess: (state, action) => {
          const value = parseInt(action.payload)
          // Only increment if the value is an int
          if (Number.isInteger(value)) {
            state.value += value
          }
        },
        // onError: (state) => {}
      },
    },
  },
})

export default counterState
```

## Breakdown

### Slice (state), and supporting features

```ts
const state = composableRedux({
  slice: {
    name: '...',
    initialState: {
      ...
    },
    reducers: {
      ...
    },
  }
})
```

In the above example, we're creating a slice, passing our initial state and reducers. This is the basis of react-redux's createSlice function, but under the hood more things are taking place to prepare an easy to use state object.

**Safety**
* The name is checked, as, having more than once slice with the same name will cause grievous issues in redux with your state overriding each other, and an error will be thrown.
* The reducers names are checked, as similar to having duplicate named slices, same named reducers will conflict what method becomes the real one, and is misleading. While most IDEs should warn of this, it's a safety check, and an error will be thrown.

**Defaults**
* Some default state is added to the initial state, as well as some default reducers to execute common actions later.
* Reducers automatically are generated into actions, which then are further auto-generated into dispatchable methods, so you never need pass around the dispatcher or generate these yourself.

### Connecting state to components

* A `connect` from react-redux is created, which will help to inject state and dispatches automatically into a component wishing to consume state from the slice. This could be used on a single component, or many depending on how you wish to use it in your application. This performance updates the component based on associated state changes, or custom props passed in. By default this injects `mapStateToProps` and `mapDispatchToProps` methods to support the redux connect control flow.

```ts
const myCounter = ({dispatches, customerProp, otherProps, ...state})=> {
   return (
     <div className={`${customerProp} ${otherProps}`}>
       <h1>Value is: {state.value}</h1>
       <button onClick={()=>dispatches.increment()}>Increment</button>
       <button onClick={()=>dispatches.decrement()}>Decrement</button>
       <button onClick={()=>dispatches.incrementByAmount('5')}>Increment by 5</button>
     </div>
   )
}
export default counterState.connect(myCounter)
```

This can be further customized by passing in a custom `mapStateToProps` function.

```ts
const state = composableRedux({
  ...,
  mapStateToProps: ({state, slice, ownProps}) => {
    return {
      ...slice,
      ...ownProps,
    }
  },
})
```

The advantage here over normal usage, is the composableRedux handler passes along the whole store, just the current slice, and own props, whereas the native mapStateToProps has only the store and ownProps. Whatever you return here both controls what state is sent to your component as props, but also that when that state is updated, your component will then be re-rendered.

### Expanding to leverage Thunks

When you need to make use of async Thunk calls, you can leverage this in a more streamlined way as well to help tap into the mapping and connect methods which composableRedux provides.

```ts
const state = composableRedux({
  ...,
  thunks: {
    incrementAsync: {
      actions: {
        // The action which will be triggered by the dispatch, 
        // taking in expected params as you define
        trigger: async (amount: number) => {
          // Call some API via fetch, and return the response
          const response = await fetchCount(amount)
          // The value we return becomes the `fulfilled` action payload, passed to the `onSuccess` method
          return response.data
        },
        onLoad: (state) => {
          // Do something when the thunk is triggered
        }, // Optional
        onSuccess: (state, action) => {
          // When successful, update state with the action payload as desired
          const value = parseInt(action.payload)
          // Only increment if the value is an int
          if (Number.isInteger(value)) {
            state.value += value
          }
        }, // Required
        onError: (state) => {
          // Do something when the thunk fails
        }, // Optional
      },
    },
  },
})
```

As with the slice reducers, thunks are automatically generated into the common dispatches, and some helper status flags unique to each thunk can help flow when connected to components as such:

```ts
const myCounter = ({dispatches, ...state})=> {
  const input = useInput()
   return (
     <div>
       <h1>Value is: {state.value}</h1>
       Enter an amount to increment: {input.render}
       <button 
         onClick={()=>dispatches.incrementAsync(input.value)}
         disabled={state.thunks.incrementAsync.isLoading}
       >Increment Async</button>
       {state.thunks.incrementAsync.isLoading && <span>Loading...</span>}
       {state.thunks.incrementAsync.hasError && <span>Error...</span>}
     </div>
   )
}
export default counterState.connect(myCounter)
```

* As the thunk dispatch is triggered, the `onLoad` method is called, and the `isLoading` flag is set to true.
* When the thunk is successful, the `onSuccess` method is called, and the `isLoading` flag is set to false, and no error occurred.
* When the thunk fails, the `onError` method is called, and the `hasError` flag is set to true.

These helpers allow you to easily trigger and monitor the status of your thunk calls, while knowing that your thunk is effectively handling state in an ideal manner as you defined.