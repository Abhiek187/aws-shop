import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import Store from "./Store";
import store from "../../store";

describe("Store", () => {
  it("should render the store component", () => {
    const { container } = render(
      <Provider store={store}>
        <Store />
      </Provider>
    );
    expect(container).toBeInTheDocument();
  });
});
