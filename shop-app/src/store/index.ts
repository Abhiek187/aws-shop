import {
  PreloadedState,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";

import { storeApi } from "../services/store";
import { appReducer, appSlice } from "./appSlice";
import { authApi } from "../services/auth";

const rootReducer = combineReducers({
  [appSlice.name]: appReducer,
  [authApi.reducerPath]: authApi.reducer,
  [storeApi.reducerPath]: storeApi.reducer,
});

// Allow tests to start fresh with a Redux store to avoid caching data
export const createStore = (preloadedState: PreloadedState<RootState> = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    // Enable caching, invalidation, polling, and other useful features
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([authApi.middleware, storeApi.middleware]),
    devTools: import.meta.env.DEV,
  });

const store = createStore();

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
