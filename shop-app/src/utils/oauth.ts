import { Constants } from "./constants";

// Convert a string to a base-64 URL-encoded string
// Based on: https://www.oauth.com/oauth2-servers/pkce/authorization-request/
const base64URLEncode = (str: string): string =>
  window
    // Convert the binary string to a base64 string ([a-zA-Z0-9+/])
    .btoa(String.fromCharCode(...new Uint8Array(new TextEncoder().encode(str))))
    // Replace + and / with - and _ for easier URL encoding
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    // Remove padding characters (=)
    .replace(/=+$/, "");

// Create a cryptographically secure random string of a specified length (64 by default)
const generateRandomString = (length: number = 64): string => {
  return base64URLEncode(
    // Convert each number to a character
    String.fromCharCode(
      // Generate random numbers between 0 and 255 (with some padding)
      ...window.crypto.getRandomValues(new Uint8Array(length * 2))
    )
  ).substring(0, length);
};

// Hash a given string using SHA-256
const sha256 = async (message: string): Promise<string> => {
  // Encode the message as an array of unsigned ints (buffer)
  const msgBuffer = new TextEncoder().encode(message);
  // Hash the buffer using SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // Convert the ArrayBuffer to an array of numbers (bytes)
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert bytes to hex string (and ensure each byte is converted to a string of length 2)
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

export const openHostedUI = async () => {
  const queryParams = {
    client_id: Constants.Cognito.CLIENT_ID,
    response_type: "code",
    scope: Constants.Cognito.SCOPES,
    redirect_uri: Constants.Cognito.REDIRECT_URI,
    state: generateRandomString(),
    code_challenge: base64URLEncode(await sha256(generateRandomString())),
    code_challenge_method: "S256",
    nonce: generateRandomString(),
  };

  const queryParamString = new URLSearchParams(queryParams);
  const url = `${
    Constants.Cognito.BASE_URL
  }/oauth2/authorize?${queryParamString.toString()}`;
  window.open(url);
};
