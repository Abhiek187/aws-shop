import { render, screen } from "@testing-library/react";
import React from "react";
import { expect, test } from "vitest";

import App from "../App";

test("Renders Vite default page", () => {
  render(<App />);

  const header: HTMLHeadingElement = screen.getByText("Vite + React");
  expect(header).toBeInTheDocument();
});
