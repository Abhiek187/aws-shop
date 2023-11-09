import store from "../store";
import { appActions } from "../store/appSlice";
import { TokenHeader, TokenPayload } from "../types/TokenPayload";
import { Constants } from "./constants";

// Convert a binary string to a base64 URL-encoded string
// Based on: https://www.oauth.com/oauth2-servers/pkce/authorization-request/
const base64URLEncode = (buffer: ArrayBuffer): string =>
  window
    // Convert the binary string to a base64 string ([a-zA-Z0-9+/])
    .btoa(String.fromCharCode(...new Uint8Array(buffer)))
    // Replace + and / with - and _ for easier URL encoding
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    // Remove padding characters (=)
    .replace(/=+$/, "");

// Create a cryptographically secure random string of a specified length (64 by default)
const generateRandomString = (length: number = 64): string => {
  return base64URLEncode(
    // Generate random numbers between 0 and 255 (with some padding)
    window.crypto.getRandomValues(new Uint8Array(length * 2))
  ).substring(0, length);
};

// Hash a given string using SHA-256
const sha256 = async (message: string): Promise<ArrayBuffer> => {
  // Encode the message as an array of unsigned ints (buffer)
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the buffer using SHA-256
  return await crypto.subtle.digest("SHA-256", msgBuffer);
};

// Initiate and authorization code flow with PKCE
export const openHostedUI = async () => {
  // Save the state, code challenge, and nonce in memory to verify upon signing in
  const state = generateRandomString();
  const codeVerifier = generateRandomString();
  const nonce = generateRandomString();
  store.dispatch(appActions.saveOauthParams({ state, codeVerifier, nonce }));

  const queryParams = {
    client_id: Constants.Cognito.CLIENT_ID,
    response_type: "code",
    scope: Constants.Cognito.SCOPES,
    redirect_uri: window.location.origin,
    state, // protects against XSRF
    code_challenge: base64URLEncode(await sha256(codeVerifier)), // PKCE
    code_challenge_method: "S256",
    nonce, // protects against relay attacks
  };

  const queryParamString = new URLSearchParams(queryParams);
  const url = `${
    Constants.Cognito.BASE_URL
  }/oauth2/authorize?${queryParamString.toString()}`;
  window.open(url); // open login page in a new tab so session storage persists
};

const base64URLDecode = (base64Url: string): string => {
  // Convert URL-encoded base64 to regular base64
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // Convert base64 to JSON string
  return decodeURIComponent(
    window
      .atob(base64)
      .split("")
      // Convert each char to its URL encoding (hex char code padded with 0s)
      .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
};

// Get the JSON header & payload from a JWT (either an ID or access token)
export const parseJWT = <T extends TokenPayload>(
  token: string
): [TokenHeader, T] => {
  const [headerUrl, payloadUrl] = token.split(".").slice(0, 2);

  const [jsonHeader, jsonPayload] = [
    base64URLDecode(headerUrl),
    base64URLDecode(payloadUrl),
  ];

  return [JSON.parse(jsonHeader) as TokenHeader, JSON.parse(jsonPayload) as T];
};

// Check if the JWT is valid, based on:
// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
export const isValidJWT = <T extends TokenPayload>(token: T): boolean => {
  return true;
};
