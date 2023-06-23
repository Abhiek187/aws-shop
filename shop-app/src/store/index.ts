import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers";

const store = configureStore({
  reducer: rootReducer,
});

let currentState = store.getState();

store.subscribe(() => {
  // Keep track of the previous and current state to compare changes
  const previousState = currentState;
  currentState = store.getState();
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
