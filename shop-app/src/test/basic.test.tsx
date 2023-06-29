import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { expect, test } from "vitest";

import App from "../App";

test("Renders store page", () => {
  render(<App />);

  const header: HTMLHeadingElement = screen.getByText("AWS Shop");
  expect(header).toBeInTheDocument();
});
