import { fireEvent, render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import {
  SpyInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import TopBar from "./TopBar";

describe("TopBar", () => {
  let setParamsSpy: SpyInstance<[name: string, value: string], void>;
  let deleteParamsSpy: SpyInstance<
    [name: string, value?: string | undefined],
    void
  >;

  beforeEach(() => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>
    );

    setParamsSpy = vi.spyOn(URLSearchParams.prototype, "set");
    deleteParamsSpy = vi.spyOn(URLSearchParams.prototype, "delete");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should render", () => {
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
    // When searching, the "query" query param should be updated
    const searchBar = screen.getByPlaceholderText<HTMLInputElement>("Search…");
    const searchParam = "query";
    const searchQuery = "code";
    fireEvent.change(searchBar, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(searchBar, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
  });

  it("should update search params with category", () => {
    // When changing the category, the "category" query param should be updated
    const categoryDropDown = screen.getByRole<HTMLDivElement>("combobox");
    const searchParam = "category";
    const searchQuery = "free";
    // Click the dropdown, then select the option in the list
    fireEvent.mouseDown(categoryDropDown);
    const optionList = within(screen.getByRole("listbox"));
    fireEvent.click(optionList.getByText("Free"));
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.mouseDown(categoryDropDown);
    fireEvent.click(optionList.getByText("Any"));
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
  });

  it("should update search params with min-price", () => {
    // When changing the minimum price, the "min-price" query param should be updated
    const minPriceField = screen.getByLabelText<HTMLInputElement>("Min");
    const searchParam = "min-price";
    const searchQuery = "0";
    fireEvent.change(minPriceField, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(minPriceField, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
  });

  it("should update search params with max-price", () => {
    // When changing the minimum price, the "max-price" query param should be updated
    const maxPriceField = screen.getByLabelText<HTMLInputElement>("Max");
    const searchParam = "max-price";
    const searchQuery = "1";
    fireEvent.change(maxPriceField, { target: { value: searchQuery } });
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, searchQuery);

    fireEvent.change(maxPriceField, { target: { value: "" } });
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
  });

  it("should update search params with free-tier", () => {
    // When toggling the free tier checkbox, the "free-tier" query param should be updated
    const freeTierCheckbox =
      screen.getByLabelText<HTMLInputElement>("Free Tier");
    const searchParam = "free-tier";
    fireEvent.click(freeTierCheckbox);
    expect(setParamsSpy).toHaveBeenCalledWith(searchParam, "");

    fireEvent.click(freeTierCheckbox);
    expect(deleteParamsSpy).toHaveBeenCalledWith(searchParam);
  });
});
