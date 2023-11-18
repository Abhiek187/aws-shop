import {
  TokenHeader,
  AccessTokenPayload,
  IdTokenPayload,
} from "../types/TokenPayload";
import { Constants } from "../utils/constants";

export const mockAccessToken =
  "eyJraWQiOiJqM0xxakdQK01HQkVGRnFcL29WdGhrOERpXC9XV1RGd3hWUyttVnVuQk53TUk9IiwiYWxnIjoiUlMyNTYifQ" +
  ".eyJzdWIiOiJ1c2VybmFtZSIsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzlWVWtpY1JLaSIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjdtcXZobnJtYzhra2c0aGE1NzJzdGd2MTRrIiwib3JpZ2luX2p0aSI6IjMzMjk0MzhlLTMyMGMtNGQ4OC05OGFlLTNjOGUzMTJmOGMxNiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoicGhvbmUgb3BlbmlkIGVtYWlsIiwiYXV0aF90aW1lIjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAwMDAsImlhdCI6MTAwMDAwMDAwMCwianRpIjoiNGQ3MTYzZGEtMDBkMC00MTljLWIwZjEtOGJiYjc1M2JmNmY3IiwidXNlcm5hbWUiOiJ1c2VybmFtZSJ9" +
  ".naOiG7Hqu5HLmkgHMCRfQaG3L0WkLtbqkxI9sZ6xFcmtzaY7-sRoPzseaT7um838cAGiRPKfq2FxZcHXC-K6BaGwkjOPeXZ3eyrOnlbR6VR8MvmxwW_iHQzya_jZWWLPazeiAkDXRLOI59JXW5sspdAKban-HW7SR3XLwFCHv-E0yJbn8VWhHV3ha000YiE_cS8_70_o40DBSfee9ba1XmPRyHGAq4IormR4bZCh-RewHEHOg37i-6Fu5LlUGSYUrH3DhYDjdKrcHWb7eFf2S1Lf8g4QWQ_K7-eyWtJscgJ-RXuLTr25oo8c8d5tx44Z5dhecHT2ki22WtG-fDpvOQ";
export const mockAccessTokenHeader: TokenHeader = {
  kid: "j3LqjGP+MGBEFFq/oVthk8Di/WWTFwxVS+mVunBNwMI=",
  alg: "RS256",
};
export const mockAccessTokenPayload: AccessTokenPayload = {
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

export const mockIdToken =
  "eyJraWQiOiJQQStWelNOT2p0OXhxR21vRXM5RXZ1U2kwQ0NzbUxlMDVpbmZXU2w5VGo4PSIsImFsZyI6IlJTMjU2In0" +
  ".eyJhdF9oYXNoIjoiMkxRQW0wbnl2ZlhRUnRrLXhuS2ZZZyIsInN1YiI6InVzZXJuYW1lIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xXzlWVWtpY1JLaSIsImNvZ25pdG86dXNlcm5hbWUiOiJ1c2VybmFtZSIsIm5vbmNlIjoiVzBTcEFSQzBHNjdqRFpWcVZKSDZTQTlMaEp3NmF5ZVNBTzdwNXNpRDdqa2o3aFJINU1TTDZoOG9mRTBoSkxoUiIsIm9yaWdpbl9qdGkiOiIzMzI5NDM4ZS0zMjBjLTRkODgtOThhZS0zYzhlMzEyZjhjMTYiLCJhdWQiOiI3bXF2aG5ybWM4a2tnNGhhNTcyc3RndjE0ayIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxMDAwMDAwMDAwLCJleHAiOjEwMDAwMDAwMDAsImlhdCI6MTAwMDAwMDAwMCwianRpIjoiOWY1NTY5NjgtZTMxOC00YmI2LTliM2MtODJlNDg1YjhhYmRlIiwiZW1haWwiOiJ1c2VyQG1haWwuY29tIn0" +
  ".vaHTLt0yqxb9YrZGQOGoquVkLQ3_Z3FD6Hg9Nx3qMFnyr4xL7V5Ea5Ure4I3sB2DOnV76IiZbzop3Q1ToMlTK6oYVlW1oEktPjf_MISAzWv7wxsSTG11koX3WLI8PiIqKfZXHyB6qdrI4j7LuGKtTK0lOVc8690Bc0Gq_qVVRW2TSabtHf3NrAANpAShMZGkPaDXkWFVHKoDobdNf-yph3Queclc2I2Eem0o--vO1K054XrM2379woJJySWm4b7fUjZulinfRpIggQaMg-jRYZa3PZKbscjfuPebgmo_FX7C4zZMoVe6p-H6NZRkeJs1suFCgnzv-hCmQCLCoY5j-w";
export const mockIdTokenHeader: TokenHeader = {
  kid: "PA+VzSNOjt9xqGmoEs9EvuSi0CCsmLe05infWSl9Tj8=",
  alg: "RS256",
};
export const mockIdTokenPayload: IdTokenPayload = {
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
