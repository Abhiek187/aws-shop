import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import ProfileMenu from "./ProfileMenu";
import { createStore } from "../../store";
import { AppSlice, appSlice, getInitialState } from "../../store/appSlice";

describe("ProfileMenu", () => {
  it("should show a Log In button when signed out", () => {
    const initialState: AppSlice = {
      ...getInitialState(),
      isLoggedIn: false,
    };

    render(
      <BrowserRouter>
        <Provider
          store={createStore({
            [appSlice.name]: initialState,
          })}
        >
          <ProfileMenu
            id=""
            anchorEl={null}
            onClose={vi.fn()}
            onClickProfile={vi.fn()}
            onClickLogIn={vi.fn()}
            onClickLogOut={vi.fn()}
            onClickDeleteAccount={vi.fn()}
          />
        </Provider>
      </BrowserRouter>
    );

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Log Out")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete Account")).not.toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });
  it("should show a Log Out button when signed in", () => {
    const initialState: AppSlice = {
      ...getInitialState(),
      isLoggedIn: true,
    };

    render(
      <BrowserRouter>
        <Provider
          store={createStore({
            [appSlice.name]: initialState,
          })}
        >
          <ProfileMenu
            id=""
            anchorEl={null}
            onClose={vi.fn()}
            onClickProfile={vi.fn()}
            onClickLogIn={vi.fn()}
            onClickLogOut={vi.fn()}
            onClickDeleteAccount={vi.fn()}
          />
        </Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Log Out")).toBeInTheDocument();
    expect(screen.getByText("Delete Account")).toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
  });
});
