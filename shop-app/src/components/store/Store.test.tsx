import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import Store from "./Store";
import { errorHandlers, mockStoreResponse } from "../../mocks/handlers";
import { server } from "../../mocks/server";
import { Provider } from "react-redux";
import { createStore } from "../../store";

describe("Store", () => {
  it("should render the store component on success", async () => {
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Store />
        </Provider>
      </BrowserRouter>
    );

    // A circular progress bar should show while the services load
    const progressBar = screen.queryByRole("progressbar");
    expect(progressBar).toBeInTheDocument();

    // Wait until the service cards appear
    await waitFor(() => expect(progressBar).not.toBeInTheDocument());

    // Check that all the service cards have loaded
    for (const service of mockStoreResponse) {
      const serviceCard = screen.queryByText(service.Name.S);
      expect(serviceCard).toBeInTheDocument();
    }
  });

  it("should show an error on failure", async () => {
    // Use the mocked error responses
    server.use(...errorHandlers);
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Store />
        </Provider>
      </BrowserRouter>
    );

    // A circular progress bar should show while the services load
    const progressBar = screen.queryByRole("progressbar");
    expect(progressBar).toBeInTheDocument();

    // Wait until the service cards appear
    await waitFor(() => expect(progressBar).not.toBeInTheDocument());

    // Check that an error message has appeared
    const errorMessage = screen.queryByText(/Unsupported route/);
    expect(errorMessage).toBeInTheDocument();
  });

  it("should show a success alert if a passkey was added", async () => {
    window.history.pushState({}, "", "/?result=success");
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Store />
        </Provider>
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Successfully added a new passkey/)
      ).toBeInTheDocument()
    );
  });

  it("should show an error alert if a passkey couldn't be added", async () => {
    window.history.pushState({}, "", "/?result=invalid_session");
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Store />
        </Provider>
      </BrowserRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to add a new passkey/)
      ).toBeInTheDocument()
    );
  });
});
