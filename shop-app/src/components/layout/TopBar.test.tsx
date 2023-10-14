import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopBar from "./TopBar";

describe("TopBar", () => {
  it("should render", () => {
    render(<TopBar />);

    expect(screen.getByText("AWS Shop")).toBeInTheDocument();
  });
});
