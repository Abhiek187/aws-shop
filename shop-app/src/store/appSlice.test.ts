import { describe, expect, it } from "vitest";
import { AppSlice, appActions, appReducer, getInitialState } from "./appSlice";

describe("appSlice", () => {
  it("should return the initial state", () => {
    // Given no initial state
    const initialState = undefined;
    // When no action is called
    const action = { type: "" };
    const reducer = appReducer(initialState, action);

    // Then it should return the initial state
    expect(reducer).toMatchObject({
      mode: "light",
    });
  });

  it("should toggle from light to dark", () => {
    // Given light mode
    const previousState: AppSlice = {
      ...getInitialState(),
      mode: "light",
    };
    // When the mode is toggled
    const action = appActions.toggleMode();
    const reducer = appReducer(previousState, action);

    // Then it should be dark mode
    expect(reducer.mode).toBe("dark");
  });

  it("should toggle from dark to light", () => {
    // Given dark mode
    const previousState: AppSlice = {
      ...getInitialState(),
      mode: "dark",
    };
    // When the mode is toggled
    const action = appActions.toggleMode();
    const reducer = appReducer(previousState, action);

    // Then it should be light mode
    expect(reducer.mode).toBe("light");
  });

  it("should log in", () => {
    // Given a logged out state
    const previousState = getInitialState();

    // When calling logIn
    const action = appActions.logIn();
    const reducer = appReducer(previousState, action);

    // Then the state should be logged in
    expect(reducer.isLoggedIn).toBe(true);
  });

  it("should log out", () => {
    // Given a logged in state
    const previousState: AppSlice = {
      ...getInitialState(),
      isLoggedIn: true,
    };

    // When calling logOut
    const action = appActions.logOut();
    const reducer = appReducer(previousState, action);

    // Then the state should be logged out
    expect(reducer.isLoggedIn).toBe(false);
    expect(reducer.oauth).toMatchObject(previousState.oauth);
  });

  it("should save OAuth parameters", () => {
    // Given a state, code verifier, and nonce
    const oauthPayload = {
      state: "test",
      codeVerifier: "test",
      nonce: "test",
    };
    const previousState = getInitialState();

    // When saveOauthParams is called
    const action = appActions.saveOauthParams(oauthPayload);
    const reducer = appReducer(previousState, action);

    // Then all values should be saved to the state
    expect(reducer.oauth).toMatchObject({
      ...previousState.oauth,
      ...oauthPayload,
    });
  });

  it("should save access & ID tokens", () => {
    // Given an access & ID token
    const tokenPayload = {
      accessToken: "test",
      idToken: "test",
    };
    const previousState = getInitialState();

    // When saveTokens is called
    const action = appActions.saveTokens(tokenPayload);
    const reducer = appReducer(previousState, action);

    // Then all tokens should be saved to the state
    expect(reducer.oauth).toMatchObject({
      ...previousState.oauth,
      ...tokenPayload,
    });
  });
});
