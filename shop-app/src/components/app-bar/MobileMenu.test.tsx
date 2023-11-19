import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import MobileMenu from "./MobileMenu";
import { createStore } from "../../store";
import { AppSlice, appSlice, getInitialState } from "../../store/appSlice";

describe("MobileMenu", () => {
  it("should show a Dark Mode button in light mode", () => {
    const initialState: AppSlice = {
      ...getInitialState(),
      mode: "light",
    };

    render(
      <BrowserRouter>
        <Provider
          store={createStore({
            [appSlice.name]: initialState,
          })}
        >
          <MobileMenu
            id=""
            anchorEl={null}
            onClose={vi.fn()}
            onToggleMode={vi.fn()}
            onClickProfile={vi.fn()}
          />
        </Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
  });
  it("should show a Light Mode button in dark mode", () => {
    const initialState: AppSlice = {
      ...getInitialState(),
      mode: "dark",
    };

    render(
      <BrowserRouter>
        <Provider
          store={createStore({
            [appSlice.name]: initialState,
          })}
        >
          <MobileMenu
            id=""
            anchorEl={null}
            onClose={vi.fn()}
            onToggleMode={vi.fn()}
            onClickProfile={vi.fn()}
          />
        </Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Light Mode")).toBeInTheDocument();
  });
});
