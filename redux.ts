const combineReducers = (reducers) => {
  const reducersKeys = Object.keys(reducers);
  return function combination(state = {}, action) {
    const nextState = {};
    for (let i = 0; i < reducersKeys.length; ++i) {
      const key = reducersKeys[i];
      const reducer = reducers[key];
      const childState = state[key];
      const newState = reducer(childState, action);
      nextState[key] = newState
    }
    return nextState;
  }
}

const applyMiddleware = (...middleWares) => {
  return function newCreateStore(createStore, reducer, initState) {
    const oldStore = createStore(reducer, initState);
    const chain = middleWares.map(middleWare => middleWare(oldStore));
    let dispatch = oldStore.dispatch;
    chain.reverse().forEach(middleWare => {
      dispatch = middleWare(dispatch)
    })
    oldStore.dispatch = dispatch;
    return oldStore;
  }
}

const createStore = (reducer, initState, newCreateStore) => {
  if (newCreateStore) {
    return newCreateStore(createStore, reducer, initState);
  }
  let state = initState;
  let listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; ++i) {
      listeners[i]();
    }
  }

  function getState() {
    return state;
  }

  return {
    subscribe,
    dispatch,
    getState
  }
}