import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import App from "./App";
import { createStore } from "./store";

describe("App", () => {
  it("should render the store page", () => {
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <App />
        </Provider>
      </BrowserRouter>
    );

    const header: HTMLHeadingElement = screen.getByText("AWS Shop");
    expect(header).toBeInTheDocument();
  });
});
