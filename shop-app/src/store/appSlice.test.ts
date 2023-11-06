import { describe, expect, it } from "vitest";
import { AppSlice, appActions, appReducer, getInitialState } from "./appSlice";

describe("appSlice", () => {
  it("should return the initial state", () => {
    // Given no initial state
    const initialState = undefined;
    // When no action is called
    const action = { type: undefined };
    const reducer = appReducer(initialState, action);

    // Then it should return the intial state
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
});
