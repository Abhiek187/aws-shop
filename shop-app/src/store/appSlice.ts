import { PaletteMode } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";

type AppSlice = {
  mode: PaletteMode;
};

type AppState = {
  [name: string]: AppSlice;
};

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialState = (): AppSlice => ({
  mode: prefersDark ? "dark" : "light",
});

export const appSlice = createSlice({
  name: "app",
  initialState: getInitialState(),
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
  },
});

export const selectApp = (state: AppState) => state[appSlice.name];

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
