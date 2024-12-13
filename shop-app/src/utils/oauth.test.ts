import { MockInstance, afterEach, describe, expect, it, vi } from "vitest";

import * as oauth from "./oauth";
import {
  isValidJWT,
  openHostedUI,
  openRegisterPasskey,
  parseJWT,
} from "./oauth";
import { Constants } from "./constants";
import {
  AccessTokenPayload,
  IdTokenPayload,
  TokenHeader,
} from "../types/TokenPayload";
import store from "../store";
import { AppSlice } from "../store/appSlice";
import {
  mockAccessToken,
  mockAccessTokenHeader,
  mockAccessTokenPayload,
  mockIdToken,
  mockIdTokenHeader,
  mockIdTokenPayload,
} from "../mocks/tokens";

describe("oauth", () => {
  const windowOpenSpy = vi.spyOn(window, "open").mockReturnThis();
  const mockWindowOrigin = "http://localhost:5000";
  Object.defineProperty(window, "location", {
    value: {
      origin: mockWindowOrigin,
    },
  });

  Object.defineProperty(window, "crypto", {
    value: {
      getRandomValues: () => vi.fn(),
      subtle: {
        digest: () => {
          return new Promise((resolve) => resolve(vi.fn()));
        },
      },
    },
  });

  const mockDate = (seconds: number) => {
    // Date.now() is in milliseconds
    vi.spyOn(Date, "now").mockImplementation(() => seconds * 1000);
  };

  const mockToken = (
    header: TokenHeader,
    payload: AccessTokenPayload | IdTokenPayload
  ) => {
    vi.spyOn(oauth, "parseJWT").mockImplementation(
      () =>
        [header, payload] as [TokenHeader, AccessTokenPayload | IdTokenPayload]
    );
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should open the hosted UI with all query parameters", async () => {
    await openHostedUI();
    const mockQueryParams = new URLSearchParams({
      client_id: Constants.Cognito.CLIENT_ID,
      response_type: "code",
      scope: Constants.Cognito.SCOPES,
      redirect_uri: mockWindowOrigin,
      state: "",
      code_challenge: "",
      code_challenge_method: "S256",
      nonce: "",
    });

    expect(windowOpenSpy).toHaveBeenCalledWith(
      `${
        Constants.Cognito.BASE_URL
      }/oauth2/authorize?${mockQueryParams.toString()}`
    );
  });

  it("should open the register passkey site with all query parameters", () => {
    openRegisterPasskey();
    const mockQueryParams = new URLSearchParams({
      client_id: Constants.Cognito.CLIENT_ID,
      redirect_uri: mockWindowOrigin,
    });

    expect(window.location.href).toBe(
      `${Constants.Cognito.BASE_URL}/passkeys/add?${mockQueryParams.toString()}`
    );
  });

  it("should decode an access token", () => {
    // Given an access token
    // When decoded
    const [jwtHeader, jwtPayload] =
      parseJWT<AccessTokenPayload>(mockAccessToken);

    // Then it should return the token's header & payload
    expect(jwtHeader).toMatchObject(mockAccessTokenHeader);
    expect(jwtPayload).toMatchObject(mockAccessTokenPayload);
  });

  it("should decode an ID token", () => {
    // Given an ID token
    // When decoded
    const [jwtHeader, jwtPayload] = parseJWT<IdTokenPayload>(mockIdToken);

    // Then it should return the token's header & payload
    expect(jwtHeader).toMatchObject(mockIdTokenHeader);
    expect(jwtPayload).toMatchObject(mockIdTokenPayload);
  });

  it.each([
    "",
    ".",
    "..",
    "...",
    "asdfjkl;",
    "This is not a JWT",
    "🧑‍💻",
    "eyJdkla;f.eyJla93nee.jalf",
  ])("should return undefined for invalid token: %s", (token) => {
    // Given an invalid JWT
    // When decoded
    const [header, payload] = parseJWT(token);
    // Then it should return undefined
    expect(header).toBeUndefined();
    expect(payload).toBeUndefined();
  });

  it("should accept a valid access token", async () => {
    // Given a valid access token
    mockDate(mockAccessTokenPayload.exp - 1);
    // When validated
    // Then it should return valid
    await expect(isValidJWT(mockAccessToken)).resolves.toBe(true);
  });

  it("should accept a valid ID token", async () => {
    // Given a valid ID token
    mockDate(mockIdTokenPayload.exp - 1);
    // When validated
    // Then it should return valid
    await expect(isValidJWT(mockIdToken)).resolves.toBe(true);
  });

  it("should reject the token if the key ID doesn't match", async () => {
    // Given a token with an invalid kid
    mockDate(mockAccessTokenPayload.exp - 1);
    mockToken(
      {
        ...mockAccessTokenHeader,
        kid: "bad kid",
      },
      mockAccessTokenPayload
    );

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockAccessToken)).resolves.toBe(false);
  });

  it("should reject the token if it's expired", async () => {
    // Given an expired token
    mockDate(mockIdTokenPayload.exp);

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockIdToken)).resolves.toBe(false);
  });

  it("should reject the token if the issuer doesn't match", async () => {
    // Given a token with an invalid iss
    mockDate(mockAccessTokenPayload.exp - 1);
    mockToken(mockAccessTokenHeader, {
      ...mockAccessTokenPayload,
      iss: "https://www.amazon.com",
    });

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockAccessToken)).resolves.toBe(false);
  });

  it("should reject the access token if the client ID doesn't match", async () => {
    // Given an an access token with an invalid client_id
    mockDate(mockAccessTokenPayload.exp - 1);
    mockToken(mockAccessTokenHeader, {
      ...mockAccessTokenPayload,
      client_id: Constants.Cognito.USER_POOL_ID,
    });

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockAccessToken)).resolves.toBe(false);
  });

  it("should reject the access token if the token use isn't access", async () => {
    // Given an access token with an invalid token_use
    mockDate(mockAccessTokenPayload.exp - 1);
    mockToken(mockAccessTokenHeader, {
      ...mockAccessTokenPayload,
      token_use: "id",
    });

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockAccessToken)).resolves.toBe(false);
  });

  it("should reject the ID token if the audience doesn't match", async () => {
    // Given an ID token with an invalid aud
    mockDate(mockIdTokenPayload.exp - 1);
    mockToken(mockIdTokenHeader, {
      ...mockIdTokenPayload,
      aud: Constants.Cognito.USER_POOL_ID,
    });

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockIdToken)).resolves.toBe(false);
  });

  it("should reject the ID token if the token use isn't id", async () => {
    // Given an ID token with an invalid token_use
    mockDate(mockIdTokenPayload.exp - 1);
    mockToken(mockIdTokenHeader, {
      ...mockIdTokenPayload,
      token_use: "access",
    });

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockIdToken)).resolves.toBe(false);
  });

  it("should reject the ID token if the nonce doesn't match", async () => {
    // Given an ID token with an invalid nonce
    mockDate(mockIdTokenPayload.exp - 1);
    const stateSpy = vi.spyOn(store, "getState") as unknown as MockInstance<
      () => {
        app: {
          oauth: Pick<AppSlice["oauth"], "nonce">;
        };
      }
    >;
    stateSpy.mockImplementation(() => ({
      app: {
        oauth: {
          nonce: "bad nonce",
        },
      },
    }));

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(mockIdToken)).resolves.toBe(false);
  });

  it("should reject the token if it's neither an access nor ID token", async () => {
    // Given a non-Cognito token (with "valid" kid & iss)
    mockDate(mockAccessTokenPayload.exp - 1);
    const token =
      "eyJhbGciOiJIUzI1NiIsImtpZCI6ImozTHFqR1ArTUdCRUZGcS9vVnRoazhEaS9XV1RGd3hWUyttVnVuQk53TUk9In0" +
      ".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tL3VzLWVhc3QtMV85VlVraWNSS2kifQ" +
      ".CegTjJ2eXdxNFmu5kCB9qbiFMOraQJEZjucEmEEgjN0";

    // When validated
    // Then it should return invalid
    await expect(isValidJWT(token)).resolves.toBe(false);
  });
});
