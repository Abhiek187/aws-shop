import { PaletteMode } from "@mui/material";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Constants } from "../utils/constants";

export type AppSlice = {
  mode: PaletteMode;
  isLoggedIn: boolean;
  oauth: {
    state: string;
    codeVerifier: string;
    nonce: string;
    accessToken: string;
    idToken: string;
  };
};

type AppState = {
  [name: string]: AppSlice;
};

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialState = (): AppSlice => ({
  mode: prefersDark ? "dark" : "light",
  isLoggedIn:
    localStorage.getItem(Constants.LocalStorage.REFRESH_TOKEN) !== null,
  oauth: {
    state: "",
    codeVerifier: "",
    nonce: "",
    accessToken: "",
    idToken: "",
  },
});

export const appSlice = createSlice({
  name: "app",
  initialState: getInitialState(),
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
    },
    logIn: (state) => {
      state.isLoggedIn = true;
    },
    logOut: (state) => {
      state.isLoggedIn = false;
      state.oauth = getInitialState().oauth; // reset all OAuth info
    },
    saveOauthParams: (
      state,
      action: PayloadAction<
        Pick<AppSlice["oauth"], "state" | "codeVerifier" | "nonce">
      >
    ) => {
      state.oauth.state = action.payload.state;
      state.oauth.codeVerifier = action.payload.codeVerifier;
      state.oauth.nonce = action.payload.nonce;
    },
    saveTokens: (
      state,
      action: PayloadAction<Pick<AppSlice["oauth"], "accessToken" | "idToken">>
    ) => {
      state.oauth.accessToken = action.payload.accessToken;
      state.oauth.idToken = action.payload.idToken;
    },
  },
});

export const selectApp = (state: AppState) => state[appSlice.name];

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
