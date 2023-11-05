import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Constants } from "../utils/constants";
import TokenResponse from "../types/TokenResponse";

const queryParams = new URLSearchParams(window.location.search);

const createBody = (codeVerifier?: string) => ({
  grant_type: "authorization_code",
  client_id: Constants.Cognito.CLIENT_ID,
  code: queryParams.get("code"),
  redirect_uri: window.location.origin,
  code_verifier: codeVerifier ?? "", // can't reference state directly (circular dependency)
});

const refreshBody = {
  grant_type: "refresh_token",
  client_id: Constants.Cognito.CLIENT_ID,
  refresh_token: localStorage.getItem(Constants.LocalStorage.REFRESH_TOKEN),
};

const revokeBody = {
  client_id: Constants.Cognito.CLIENT_ID,
  token: localStorage.getItem(Constants.LocalStorage.REFRESH_TOKEN),
};

export const authApi = createApi({
  reducerPath: "loginApi",
  baseQuery: fetchBaseQuery({ baseUrl: Constants.Cognito.BASE_URL }),
  endpoints: (builder) => ({
    getToken: builder.mutation<
      TokenResponse,
      { refresh: boolean; codeVerifier?: string }
    >({
      query: ({ refresh, codeVerifier }) => ({
        url: "/oauth2/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: Object.entries(refresh ? refreshBody : createBody(codeVerifier))
          .map(
            ([key, value]) =>
              encodeURIComponent(key) +
              "=" +
              encodeURIComponent(value ?? "null")
          )
          .join("&"),
      }),
    }),
    // Empty response body on success
    revokeToken: builder.mutation<void, void>({
      query: () => ({
        url: "/oauth2/revoke",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: Object.entries(revokeBody)
          .map(
            ([key, value]) =>
              encodeURIComponent(key) +
              "=" +
              encodeURIComponent(value ?? "null")
          )
          .join("&"),
      }),
    }),
  }),
});

export const { useGetTokenMutation, useRevokeTokenMutation } = authApi;
