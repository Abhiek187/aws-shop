import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { describe, it } from "vitest";

import Profile from "./Profile";
import { createStore } from "../../store";

describe("Profile", () => {
  it("should render", () => {
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Profile />
        </Provider>
      </BrowserRouter>
    );
  });
});
