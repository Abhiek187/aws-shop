import { describe, expect, it, vi } from "vitest";
import { openHostedUI, parseJWT } from "./oauth";
import { Constants } from "./constants";
import { AccessTokenPayload, IdTokenPayload } from "../types/TokenPayload";

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
    const mockAccessToken =
      "eyJraWQiOiJqM0xxakdQK01HQkVGRnFcL29WdGhrOERpXC9XV1RGd3hWUyttVnVuQk53TUk9IiwiYWxnIjoiUlMyNTYifQ" +
      ".eyJzdWIiOiJ1c2VybmFtZSIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX3Bvb2wiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiJjbGllbnQiLCJvcmlnaW5fanRpIjoiMzMyOTQzOGUtMzIwYy00ZDg4LTk4YWUtM2M4ZTMxMmY4YzE2IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJwaG9uZSBvcGVuaWQgZW1haWwiLCJhdXRoX3RpbWUiOjEwMDAwMDAwMDAsImV4cCI6MTAwMDAwMDAwMCwiaWF0IjoxMDAwMDAwMDAwLCJqdGkiOiI0ZDcxNjNkYS0wMGQwLTQxOWMtYjBmMS04YmJiNzUzYmY2ZjciLCJ1c2VybmFtZSI6InVzZXJuYW1lIn0" +
      ".naOiG7Hqu5HLmkgHMCRfQaG3L0WkLtbqkxI9sZ6xFcmtzaY7-sRoPzseaT7um838cAGiRPKfq2FxZcHXC-K6BaGwkjOPeXZ3eyrOnlbR6VR8MvmxwW_iHQzya_jZWWLPazeiAkDXRLOI59JXW5sspdAKban-HW7SR3XLwFCHv-E0yJbn8VWhHV3ha000YiE_cS8_70_o40DBSfee9ba1XmPRyHGAq4IormR4bZCh-RewHEHOg37i-6Fu5LlUGSYUrH3DhYDjdKrcHWb7eFf2S1Lf8g4QWQ_K7-eyWtJscgJ-RXuLTr25oo8c8d5tx44Z5dhecHT2ki22WtG-fDpvOQ";
    const mockAccessTokenPayload: AccessTokenPayload = {
      sub: "username",
      iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_pool",
      version: 2,
      client_id: "client",
      origin_jti: "3329438e-320c-4d88-98ae-3c8e312f8c16",
      token_use: "access",
      scope: "phone openid email",
      auth_time: 1000000000,
      exp: 1000000000,
      iat: 1000000000,
      jti: "4d7163da-00d0-419c-b0f1-8bbb753bf6f7",
      username: "username",
    };

    // When decoded
    const jwtPayload = parseJWT<AccessTokenPayload>(mockAccessToken);

    // Then it should return the token's payload
    expect(jwtPayload).toMatchObject(mockAccessTokenPayload);
  });

  it("should decode an ID token", () => {
    // Given an ID token
    const mockIdToken =
      "eyJraWQiOiJQQStWelNOT2p0OXhxR21vRXM5RXZ1U2kwQ0NzbUxlMDVpbmZXU2w5VGo4PSIsImFsZyI6IlJTMjU2In0" +
      ".eyJhdF9oYXNoIjoiMkxRQW0wbnl2ZlhRUnRrLXhuS2ZZZyIsInN1YiI6InVzZXJuYW1lIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX3Bvb2wiLCJjb2duaXRvOnVzZXJuYW1lIjoidXNlcm5hbWUiLCJub25jZSI6IlcwU3BBUkMwRzY3akRaVnFWSkg2U0E5TGhKdzZheWVTQU83cDVzaUQ3amtqN2hSSDVNU0w2aDhvZkUwaEpMaFIiLCJvcmlnaW5fanRpIjoiMzMyOTQzOGUtMzIwYy00ZDg4LTk4YWUtM2M4ZTMxMmY4YzE2IiwiYXVkIjoiY2xpZW50IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjEwMDAwMDAwMDAsImV4cCI6MTAwMDAwMDAwMCwiaWF0IjoxMDAwMDAwMDAwLCJqdGkiOiI5ZjU1Njk2OC1lMzE4LTRiYjYtOWIzYy04MmU0ODViOGFiZGUiLCJlbWFpbCI6InVzZXJAbWFpbC5jb20ifQ" +
      ".vaHTLt0yqxb9YrZGQOGoquVkLQ3_Z3FD6Hg9Nx3qMFnyr4xL7V5Ea5Ure4I3sB2DOnV76IiZbzop3Q1ToMlTK6oYVlW1oEktPjf_MISAzWv7wxsSTG11koX3WLI8PiIqKfZXHyB6qdrI4j7LuGKtTK0lOVc8690Bc0Gq_qVVRW2TSabtHf3NrAANpAShMZGkPaDXkWFVHKoDobdNf-yph3Queclc2I2Eem0o--vO1K054XrM2379woJJySWm4b7fUjZulinfRpIggQaMg-jRYZa3PZKbscjfuPebgmo_FX7C4zZMoVe6p-H6NZRkeJs1suFCgnzv-hCmQCLCoY5j-w";
    const mockIdTokenPayload: IdTokenPayload = {
      at_hash: "2LQAm0nyvfXQRtk-xnKfYg",
      sub: "username",
      email_verified: true,
      iss: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_pool",
      "cognito:username": "username",
      nonce: "W0SpARC0G67jDZVqVJH6SA9LhJw6ayeSAO7p5siD7jkj7hRH5MSL6h8ofE0hJLhR",
      origin_jti: "3329438e-320c-4d88-98ae-3c8e312f8c16",
      aud: "client",
      token_use: "id",
      auth_time: 1000000000,
      exp: 1000000000,
      iat: 1000000000,
      jti: "9f556968-e318-4bb6-9b3c-82e485b8abde",
      email: "user@mail.com",
    };

    // When decoded
    const jwtPayload = parseJWT<IdTokenPayload>(mockIdToken);

    // Then it should return the token's payload
    expect(jwtPayload).toMatchObject(mockIdTokenPayload);
  });
});
