import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import NotFound from "./NotFound";

describe("NotFound", () => {
  it("should render", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    expect(screen.getByText(/Whoops!/i)).toBeInTheDocument();

    const backButton = screen.getByText(/Back to safety/i);
    fireEvent.click(backButton);
    expect(window.location.pathname).toBe("/");
  });
});
