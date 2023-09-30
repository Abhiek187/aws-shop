import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { expect, test } from "vitest";

import App from "../App";
import store from "../store";

test("Renders store page", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  const header: HTMLHeadingElement = screen.getByText("AWS Shop");
  expect(header).toBeInTheDocument();
});
