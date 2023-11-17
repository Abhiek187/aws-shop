type TokenResponse = {
  access_token: string;
  id_token: string;
  refresh_token: string; // not in refresh_token grant type
  token_type: string;
  expires_in: number;
};

export default TokenResponse;
