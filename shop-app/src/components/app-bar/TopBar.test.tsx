import { fireEvent, render, screen, within } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import TopBar from "./TopBar";
import { createStore, RootState } from "../../store";
import * as analytics from "../../utils/analytics";
import { appSlice, getInitialState } from "../../store/appSlice";
import * as oauth from "../../utils/oauth";

const setParamsSpy = vi.spyOn(URLSearchParams.prototype, "set");
const deleteParamsSpy = vi.spyOn(URLSearchParams.prototype, "delete");
const appBarEventSpy = vi.spyOn(analytics, "appBarEvent");
const profileEventSpy = vi.spyOn(analytics, "profileEvent");
const openHostedUISpy = vi
  .spyOn(oauth, "openHostedUI")
  .mockImplementation(vi.fn());

vi.spyOn(oauth, "isValidJWT").mockResolvedValue(true);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

describe("TopBar", () => {
  const renderTopBar = (state?: Partial<RootState>) => {
    render(
      <BrowserRouter>
        <Provider store={createStore(state)}>
          <TopBar />
        </Provider>
      </BrowserRouter>
    );
  };

  afterEach(() => {
    // clear vs. reset vs. restore all mocks: https://stackoverflow.com/a/59792748
    vi.clearAllMocks();
  });

  it("should render", () => {
    renderTopBar();
    // Check that all the UI elements in the top bar are present
    expect(screen.getByText("AWS Shop")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
    expect(screen.getByLabelText("open cart")).toBeInTheDocument();
    expect(screen.getByLabelText(/account/)).toBeInTheDocument();
    // Ignore breakpoints
    expect(screen.getByLabelText("filter search")).toBeInTheDocument();
    expect(screen.getByLabelText("show more")).toBeInTheDocument();

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Min")).toBeInTheDocument();
    expect(screen.getByText(/≤ Price ≤/)).toBeInTheDocument();
    expect(screen.getByLabelText("Max")).toBeInTheDocument();
    expect(screen.getByText("Free Tier")).toBeInTheDocument();
  });

  it("should update search params with query", () => {
    renderTopBar();
    // When searching, the "query" query param should be updated
    const searchBar = screen.getByPlaceholderText<HTMLInputElement>("Search…");
    const searchParam = "query";
    const searchQuery = "code";
    fireEvent.change(searchBar, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(searchBar, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
    expect(appBarEventSpy).not.toHaveBeenCalled();
  });

  it("should update search params with category", () => {
    renderTopBar();
    // When changing the category, the "category" query param should be updated
    const categoryDropDown = screen.getByRole<HTMLDivElement>("combobox");
    const searchParam = "category";
    const searchQuery = "free";
    // Click the dropdown, then select the option in the list
    fireEvent.mouseDown(categoryDropDown);
    const optionList = within(screen.getByRole("listbox"));
    fireEvent.click(optionList.getByText("Free"));
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);
    expect(appBarEventSpy).toHaveBeenCalledWith({
      category: searchQuery,
    });

    fireEvent.mouseDown(categoryDropDown);
    fireEvent.click(optionList.getByText("Any"));
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
    expect(appBarEventSpy).toHaveBeenCalledTimes(1);
  });

  it("should update search params with min-price", () => {
    renderTopBar();
    // When changing the minimum price, the "min-price" query param should be updated
    const minPriceField = screen.getByLabelText<HTMLInputElement>("Min");
    const searchParam = "min-price";
    const searchQuery = "0";
    fireEvent.change(minPriceField, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(minPriceField, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
    expect(appBarEventSpy).not.toHaveBeenCalled();
  });

  it("should update search params with max-price", () => {
    renderTopBar();
    // When changing the minimum price, the "max-price" query param should be updated
    const maxPriceField = screen.getByLabelText<HTMLInputElement>("Max");
    const searchParam = "max-price";
    const searchQuery = "1";
    fireEvent.change(maxPriceField, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(maxPriceField, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
    expect(appBarEventSpy).not.toHaveBeenCalled();
  });

  it("should update search params with free-tier", () => {
    renderTopBar();
    // When toggling the free tier checkbox, the "free-tier" query param should be updated
    const freeTierCheckbox =
      screen.getByLabelText<HTMLInputElement>("Free Tier");
    const searchParam = "free-tier";
    fireEvent.click(freeTierCheckbox);
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, "");
    expect(appBarEventSpy).toHaveBeenCalledWith({
      freeTier: true,
    });

    fireEvent.click(freeTierCheckbox);
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
    expect(appBarEventSpy).toHaveBeenCalledTimes(1);
  });

  it("should toggle between light & dark mode", () => {
    renderTopBar({
      [appSlice.name]: {
        ...getInitialState(),
        mode: "light",
      },
    });

    const darkModeButton = screen.getByLabelText("switch to dark mode");
    expect(darkModeButton).toBeInTheDocument();
    fireEvent.click(darkModeButton);
    expect(appBarEventSpy).toHaveBeenCalledWith({
      darkMode: true,
    });

    const lightModeButton = screen.getByLabelText("switch to light mode");
    expect(lightModeButton).toBeInTheDocument();
    fireEvent.click(lightModeButton);
    expect(appBarEventSpy).toHaveBeenCalledWith({
      darkMode: false,
    });
    expect(darkModeButton).toBeInTheDocument();
    expect(appBarEventSpy).toHaveBeenCalledTimes(2);
  });

  it("should show the login button when logged out", () => {
    renderTopBar({
      [appSlice.name]: {
        ...getInitialState(),
        isLoggedIn: false,
      },
    });
    const profileButton = screen.getByLabelText("account of current user");
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    const loginButton = screen.getByText("Log In");
    expect(loginButton).toBeInTheDocument();
    fireEvent.click(loginButton);
    expect(profileEventSpy).toHaveBeenCalledWith({
      loggedIn: true,
    });
    expect(openHostedUISpy).toHaveBeenCalled();
  });

  it("should show the profile & logout buttons when logged in", () => {
    renderTopBar({
      [appSlice.name]: {
        ...getInitialState(),
        isLoggedIn: true,
      },
    });
    const profileButton = screen.getByLabelText("account of current user");
    expect(profileButton).toBeInTheDocument();
    fireEvent.click(profileButton);

    // Ignore the profile button on the MobileMenu
    const viewProfileButton = screen.getByRole("menuitem", {
      name: "Profile",
    });
    expect(viewProfileButton).toBeInTheDocument();

    const deleteAccountButton = screen.getByText("Delete Account");
    expect(deleteAccountButton).toBeInTheDocument();

    const logoutButton = screen.getByText("Log Out");
    expect(logoutButton).toBeInTheDocument();
  });
});
