import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "../services/store";

// Allow tests to start fresh with a Redux store to avoid caching data
export const createStore = () =>
  configureStore({
    reducer: {
      [storeApi.reducerPath]: storeApi.reducer,
    },
    // Enable caching, invalidation, polling, and other useful features
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(storeApi.middleware),
  });

const store = createStore();

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
