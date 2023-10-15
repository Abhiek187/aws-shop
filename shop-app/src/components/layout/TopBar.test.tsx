import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import TopBar from "./TopBar";

describe("TopBar", () => {
  it("should render", () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>
    );

    expect(screen.getByText("AWS Shop")).toBeInTheDocument();
  });
});
