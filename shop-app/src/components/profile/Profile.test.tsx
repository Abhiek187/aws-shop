import { render } from "@testing-library/react";
import { describe, it } from "vitest";

import Profile from "./Profile";

describe("Profile", () => {
  it("should render", () => {
    render(<Profile />);
  });
});
