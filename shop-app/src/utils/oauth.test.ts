import { SpyInstance, afterEach, describe, expect, it, vi } from "vitest";

import * as oauth from "./oauth";
import { isValidJWT, openHostedUI, parseJWT } from "./oauth";
import { Constants } from "./constants";
import {
  AccessTokenPayload,
  IdTokenPayload,
  TokenHeader,
} from "../types/TokenPayload";
import store from "../store";
import { AppSlice } from "../store/appSlice";

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

  const mockAccessToken =
    "eyJraWQiOiJqM0xxakdQK01HQkVGRnFcL29WdGhrOERpXC9XV1RGd3hWUyttVnVuQk53TUk9IiwiYWxnIjoiUlMyNTYifQ" +
    ".eyJzdWIiOiJ1c2VybmFtZSIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzlWVWtpY1JLaSIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjdtcXZobnJtYzhra2c0aGE1NzJzdGd2MTRrIiwib3JpZ2luX2p0aSI6IjMzMjk0MzhlLTMyMGMtNGQ4OC05OGFlLTNjOGUzMTJmOGMxNiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoicGhvbmUgb3BlbmlkIGVtYWlsIiwiYXV0aF90aW1lIjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAwMDAsImlhdCI6MTAwMDAwMDAwMCwianRpIjoiNGQ3MTYzZGEtMDBkMC00MTljLWIwZjEtOGJiYjc1M2JmNmY3IiwidXNlcm5hbWUiOiJ1c2VybmFtZSJ9" +
    ".naOiG7Hqu5HLmkgHMCRfQaG3L0WkLtbqkxI9sZ6xFcmtzaY7-sRoPzseaT7um838cAGiRPKfq2FxZcHXC-K6BaGwkjOPeXZ3eyrOnlbR6VR8MvmxwW_iHQzya_jZWWLPazeiAkDXRLOI59JXW5sspdAKban-HW7SR3XLwFCHv-E0yJbn8VWhHV3ha000YiE_cS8_70_o40DBSfee9ba1XmPRyHGAq4IormR4bZCh-RewHEHOg37i-6Fu5LlUGSYUrH3DhYDjdKrcHWb7eFf2S1Lf8g4QWQ_K7-eyWtJscgJ-RXuLTr25oo8c8d5tx44Z5dhecHT2ki22WtG-fDpvOQ";
  const mockAccessTokenHeader: TokenHeader = {
    kid: "j3LqjGP+MGBEFFq/oVthk8Di/WWTFwxVS+mVunBNwMI=",
    alg: "RS256",
  };
  const mockAccessTokenPayload: AccessTokenPayload = {
    sub: "username",
    iss: Constants.Cognito.IDP_BASE_URL,
    version: 2,
    client_id: Constants.Cognito.CLIENT_ID,
    origin_jti: "3329438e-320c-4d88-98ae-3c8e312f8c16",
    token_use: "access",
    scope: "phone openid email",
    auth_time: 1_000_000_000,
    exp: 1_000_000_000,
    iat: 1_000_000_000,
    jti: "4d7163da-00d0-419c-b0f1-8bbb753bf6f7",
    username: "username",
  };

  const mockIdToken =
    "eyJraWQiOiJQQStWelNOT2p0OXhxR21vRXM5RXZ1U2kwQ0NzbUxlMDVpbmZXU2w5VGo4PSIsImFsZyI6IlJTMjU2In0" +
    ".eyJhdF9oYXNoIjoiMkxRQW0wbnl2ZlhRUnRrLXhuS2ZZZyIsInN1YiI6InVzZXJuYW1lIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzlWVWtpY1JLaSIsImNvZ25pdG86dXNlcm5hbWUiOiJ1c2VybmFtZSIsIm5vbmNlIjoiVzBTcEFSQzBHNjdqRFpWcVZKSDZTQTlMaEp3NmF5ZVNBTzdwNXNpRDdqa2o3aFJINU1TTDZoOG9mRTBoSkxoUiIsIm9yaWdpbl9qdGkiOiIzMzI5NDM4ZS0zMjBjLTRkODgtOThhZS0zYzhlMzEyZjhjMTYiLCJhdWQiOiI3bXF2aG5ybWM4a2tnNGhhNTcyc3RndjE0ayIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAwMDAsImlhdCI6MTAwMDAwMDAwMCwianRpIjoiOWY1NTY5NjgtZTMxOC00YmI2LTliM2MtODJlNDg1YjhhYmRlIiwiZW1haWwiOiJ1c2VyQG1haWwuY29tIn0" +
    ".vaHTLt0yqxb9YrZGQOGoquVkLQ3_Z3FD6Hg9Nx3qMFnyr4xL7V5Ea5Ure4I3sB2DOnV76IiZbzop3Q1ToMlTK6oYVlW1oEktPjf_MISAzWv7wxsSTG11koX3WLI8PiIqKfZXHyB6qdrI4j7LuGKtTK0lOVc8690Bc0Gq_qVVRW2TSabtHf3NrAANpAShMZGkPaDXkWFVHKoDobdNf-yph3Queclc2I2Eem0o--vO1K054XrM2379woJJySWm4b7fUjZulinfRpIggQaMg-jRYZa3PZKbscjfuPebgmo_FX7C4zZMoVe6p-H6NZRkeJs1suFCgnzv-hCmQCLCoY5j-w";
  const mockIdTokenHeader: TokenHeader = {
    kid: "PA+VzSNOjt9xqGmoEs9EvuSi0CCsmLe05infWSl9Tj8=",
    alg: "RS256",
  };
  const mockIdTokenPayload: IdTokenPayload = {
    at_hash: "2LQAm0nyvfXQRtk-xnKfYg",
    sub: "username",
    email_verified: true,
    iss: Constants.Cognito.IDP_BASE_URL,
    "cognito:username": "username",
    nonce: "W0SpARC0G67jDZVqVJH6SA9LhJw6ayeSAO7p5siD7jkj7hRH5MSL6h8ofE0hJLhR",
    origin_jti: "3329438e-320c-4d88-98ae-3c8e312f8c16",
    aud: Constants.Cognito.CLIENT_ID,
    token_use: "id",
    auth_time: 1_000_000_000,
    exp: 1_000_000_000,
    iat: 1_000_000_000,
    jti: "9f556968-e318-4bb6-9b3c-82e485b8abde",
    email: "user@mail.com",
  };

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
  ])("should throw an exception for invalid tokens", (token) => {
    // Given an invalid JWT
    // When decoded
    // Then it should throw an error
    expect(() => parseJWT(token)).toThrow();
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
    const stateSpy = vi.spyOn(store, "getState") as SpyInstance<
      [],
      {
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
