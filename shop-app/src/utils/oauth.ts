import store from "../store";
import { appActions } from "../store/appSlice";
import JWK from "../types/JWK";
import {
  AccessTokenPayload,
  IdTokenPayload,
  TokenHeader,
  TokenPayload,
} from "../types/TokenPayload";
import { Constants } from "./constants";
import * as oauth from "./oauth";

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
    state, // protects against CSRF attacks
    code_challenge: base64URLEncode(await sha256(codeVerifier)), // PKCE
    code_challenge_method: "S256",
    nonce, // protects against replay attacks
  };

  const queryParamString = new URLSearchParams(queryParams);
  const url = `${
    Constants.Cognito.BASE_URL
  }/oauth2/authorize?${queryParamString.toString()}`;
  const newWindow = window.open(url); // open login page in a new tab so session storage persists

  if (newWindow === null || newWindow.closed) {
    alert(
      "Pop-ups are required to sign in a new tab. Please enable them to continue."
    );
  }
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
): [TokenHeader?, T?] => {
  try {
    const [headerUrl, payloadUrl] = token.split(".").slice(0, 2);

    const [jsonHeader, jsonPayload] = [
      base64URLDecode(headerUrl),
      base64URLDecode(payloadUrl),
    ];

    return [
      JSON.parse(jsonHeader) as TokenHeader,
      JSON.parse(jsonPayload) as T,
    ];
  } catch (error) {
    console.error("JWT parsing error:", error);
    return [undefined, undefined];
  }
};

const isAccessToken = (token: TokenPayload): token is AccessTokenPayload =>
  Object.hasOwn(token, "client_id");

const isIdToken = (token: TokenPayload): token is IdTokenPayload =>
  Object.hasOwn(token, "aud");

// Check if the JWT is valid, based on:
// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
export const isValidJWT = async (token: string): Promise<boolean> => {
  try {
    // Check if the JWT is in the format [header].[payload].[signature]
    // (Can't validate the signature on the client side)
    // Can ony mock functions referenced by the module export
    const [header, payload] = oauth.parseJWT(token);

    if (header === undefined || payload === undefined) {
      throw new Error(`JWT is missing or malformed (received: ${token})`);
    }

    // Check if the key ID comes from Cognito's JWKs
    const tokenKid = header.kid;
    const resp = await fetch(
      `${Constants.Cognito.IDP_BASE_URL}/.well-known/jwks.json`,
      {
        signal: new AbortController().signal, // required for msw
      }
    );
    const jwks = (await resp.json()) as JWK;

    // Cognito uses more than one key pair
    const publicKids = jwks.keys.map((jwk) => jwk.kid);

    if (!publicKids.includes(tokenKid)) {
      throw new Error(
        `kid doesn't match Cognito's JWKs (expected: [${publicKids.toString()}], received: ${tokenKid})`
      );
    }

    // Check if the token is expired
    const expireTimeMilli = payload.exp * 1000;

    // Date.now() is in milliseconds, but JWT numbers are in seconds
    if (Date.now() >= expireTimeMilli) {
      throw new Error(
        `Token has expired on ${new Date(expireTimeMilli).toDateString()}`
      );
    }

    // Check if the issuer is Cognito
    if (payload.iss !== Constants.Cognito.IDP_BASE_URL) {
      throw new Error(
        `Issuer doesn't match (expected: ${Constants.Cognito.IDP_BASE_URL}, received: ${payload.iss})`
      );
    }

    // Check if the token contains the client ID & token_use matches the token type
    if (isAccessToken(payload)) {
      if (payload.client_id !== Constants.Cognito.CLIENT_ID) {
        throw new Error(
          `Client ID doesn't match (expected: ${Constants.Cognito.CLIENT_ID}, received: ${payload.client_id})`
        );
      }

      if (payload.token_use !== "access") {
        throw new Error(
          `Token use is invalid (expected: access, received: ${payload.token_use})`
        );
      }
    } else if (isIdToken(payload)) {
      if (payload.aud !== Constants.Cognito.CLIENT_ID) {
        throw new Error(
          `Audience doesn't match (expected: ${Constants.Cognito.CLIENT_ID}, received: ${payload.aud})`
        );
      }

      if (payload.token_use !== "id") {
        throw new Error(
          `Token use is invalid (expected: id, received: ${payload.token_use})`
        );
      }

      // If the nonce is saved in Redux, check if it's present in the ID token
      const savedNonce = store.getState().app.oauth.nonce;
      if (savedNonce.length > 0 && payload.nonce !== savedNonce) {
        throw new Error(
          `Nonce doesn't match (expected: ${savedNonce}, received: ${payload.nonce})`
        );
      }
    } else {
      throw new Error(
        `Token is neither an access token nor an ID token (received: ${token})`
      );
    }

    return true;
  } catch (error) {
    console.error("Invalid JWT:", error);
    return false;
  }
};
