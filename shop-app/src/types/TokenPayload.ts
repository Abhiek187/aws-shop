export interface TokenPayload {
  sub: string; // subject (whom the token refers to)
  iss: string; // issuer (who created and signed the token)
  origin_jti: string; // refresh token identifier (checks if the token is revoked)
  token_use: string; // access or id
  auth_time: number; // Unix time when authentication occurred
  exp: number; // expiration time (Unix)
  iat: number; // issued at (Unix)
  jti: string; // JWT ID (unique identifier for this token)
}

export interface AccessTokenPayload extends TokenPayload {
  version: number;
  client_id: string;
  scope: string;
  username: string;
}

export interface IdTokenPayload extends TokenPayload {
  at_hash: string; // access token hash value
  email_verified: boolean;
  "cognito:username": string;
  nonce: string; // unique value associating request to token
  aud: string; // audience (who or what the token is intended for)
  email: string;
}
