import { configureStore } from "@reduxjs/toolkit";
import { storeApi } from "../services/store";

const store = configureStore({
  reducer: {
    [storeApi.reducerPath]: storeApi.reducer,
  },
  // Enable caching, invalidation, polling, and other useful features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(storeApi.middleware),
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
