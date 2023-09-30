import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import App from "./App";
import store from "./store";

describe("App", () => {
  it("should render the store page", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const header: HTMLHeadingElement = screen.getByText("AWS Shop");
    expect(header).toBeInTheDocument();
  });
});
