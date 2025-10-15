import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Profile from "./Profile";
import { createStore } from "../../store";
import { AppSlice, appSlice, getInitialState } from "../../store/appSlice";
import {
  mockAccessToken,
  mockIdToken,
  mockIdTokenPayload,
} from "../../mocks/tokens";

const mockUseNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  )),
  useNavigate: () => mockUseNavigate,
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({ Credentials: [] }),
  })),
  ListWebAuthnCredentialsCommand: vi.fn(),
  DeleteWebAuthnCredentialCommand: vi.fn(),
}));

describe("Profile", () => {
  it("should redirect if the user isn't authenticated", () => {
    // Given no access tokens
    // When the profile page renders
    render(
      <BrowserRouter>
        <Provider store={createStore()}>
          <Profile />
        </Provider>
      </BrowserRouter>
    );

    // Then it should navigate back to the home page
    expect(mockUseNavigate).toHaveBeenCalled();
  });

  it("should render", () => {
    // Given a mock access & ID token
    const initialState: AppSlice = {
      ...getInitialState(),
      oauth: {
        ...getInitialState().oauth,
        accessToken: mockAccessToken,
        idToken: mockIdToken,
      },
    };
    // When the profile page renders
    render(
      <BrowserRouter>
        <Provider
          store={createStore({
            [appSlice.name]: initialState,
          })}
        >
          <Profile />
        </Provider>
      </BrowserRouter>
    );

    // Then the username and email should be shown
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText(/Username/)).toBeInTheDocument();
    expect(
      screen.getByText(mockIdTokenPayload["cognito:username"])
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Email/).length).toBeGreaterThan(0);
    expect(screen.getByText(mockIdTokenPayload.email)).toBeInTheDocument();

    // And the profile can be closed
    fireEvent.click(screen.getByLabelText("close profile"));
    expect(mockUseNavigate).toHaveBeenCalled();
    fireEvent.keyUp(window, { code: "Escape" });
    expect(mockUseNavigate).toHaveBeenCalled();
  });
});
