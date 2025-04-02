import { CircularProgress, Grid, Grow } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TransitionGroup } from "react-transition-group";
import { useDebounce } from "use-debounce";

import ServiceCard from "./ServiceCard";
import { useGetAWSServicesQuery } from "../../services/store";
import { createErrorString } from "../../utils/error";
import { useGetTokenMutation } from "../../services/auth";
import { Constants } from "../../utils/constants";
import { appActions, selectApp } from "../../store/appSlice";
import AuthorizeResponse from "../../types/AuthorizeResponse";
import AccountSnackbar from "../app-bar/AccountSnackbar";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const Store = () => {
  const { isLoggedIn, oauth } = useAppSelector(selectApp);
  const dispatch = useAppDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  // Throttle API calls for efficiency every time the input changes
  const [debouncedSearchParams] = useDebounce(searchParams, 500);

  // Convert URLSearchParams to a serializable object
  const searchParamsObject = Object.fromEntries(
    [...debouncedSearchParams.entries()].filter(([key]) => key !== "result")
  );
  const isAuthRedirect = searchParams.has("code") || searchParams.has("state");
  const isPasskeyRedirect = searchParams.has("result");
  const passkeySuccess = searchParams.get("result") === "success";

  const getServicesResult = useGetAWSServicesQuery(
    isAuthRedirect ? skipToken : searchParamsObject
  );
  const [getToken, loginResult] = useGetTokenMutation();
  // Prevent the token API from being called twice in strict mode
  const tokenApiCalled = useRef(false);

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showPasskeyAlert, setShowPasskeyAlert] = useState(false);

  const handleCloseLoginAlert = () => {
    setShowLoginAlert(false);
  };

  const handleClosePasskeyAlert = () => {
    setShowPasskeyAlert(false);
    // Delete the result query param so it doesn't interfere with other API requests
    searchParams.delete("result");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const finishLogin = ({ code, state }: AuthorizeResponse) => {
      if (state === oauth.state && !tokenApiCalled.current) {
        // Exchange the authorization code for JWTs
        // Don't call this more than once since the code will get invalidated
        void getToken({
          refresh: false,
          code,
          codeVerifier: oauth.codeVerifier,
        });
        tokenApiCalled.current = true;
      } else if (state !== oauth.state) {
        // This can also happen if the user refreshes the page before they finish entering their credentials
        // (The Redux store is cleared and the client forgets what it generated.)
        console.error(
          "The authorization server didn't return the correct state. We just saved you from a CSRF attack! 😊"
        );
        setShowLoginAlert(true);
      }
    };

    const handleMessageEvent = (event: MessageEvent<AuthorizeResponse>) => {
      // Discard messages that don't come from OAuth
      if (
        !(
          event.origin === window.location.origin &&
          typeof event.data === "object" &&
          Object.hasOwn(event.data, "code") &&
          Object.hasOwn(event.data, "state")
        )
      )
        return;

      finishLogin(event.data);
    };

    const handleStorageEvent = (event: StorageEvent) => {
      // Ignore changes that don't involve setting the code & state
      if (
        !(
          event.key === Constants.LocalStorage.OAUTH &&
          event.oldValue === null &&
          event.newValue !== null
        )
      )
        return;

      try {
        const authorizeResponse = JSON.parse(
          event.newValue
        ) as AuthorizeResponse;

        if (
          Object.hasOwn(authorizeResponse, "code") &&
          Object.hasOwn(authorizeResponse, "state")
        ) {
          finishLogin(authorizeResponse);
        }
      } catch (error) {
        console.error("Failed to parse OAuth data:", error);
      } finally {
        // Clear storage for security purposes
        localStorage.removeItem(Constants.LocalStorage.OAUTH);
      }
    };

    window.addEventListener("message", handleMessageEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener("message", handleMessageEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, [getToken, oauth.codeVerifier, oauth.state]);

  useEffect(() => {
    // Close the current tab and alert the parent tab after getting redirected from the hosted UI
    if (isAuthRedirect) {
      // window.opener === parent tab
      const opener = window.opener as Window | null;
      const authorizeResponse = {
        code: searchParams.get("code"),
        state: searchParams.get("state"),
      };

      if (opener !== null) {
        // Enforce same-origin targets
        opener.postMessage(authorizeResponse);
      } else {
        // Fallback to localStorage if communication is blocked due to same-origin policy
        localStorage.setItem(
          Constants.LocalStorage.OAUTH,
          JSON.stringify(authorizeResponse)
        );
      }

      window.close();
    }
  }, [isAuthRedirect, searchParams]);

  useEffect(() => {
    if (loginResult.data !== undefined) {
      // Persist the refresh token
      localStorage.setItem(
        Constants.LocalStorage.REFRESH_TOKEN,
        loginResult.data.refresh_token
      );
      dispatch(appActions.logIn());
      // Save the access & ID tokens in memory since they can be refreshed when needed
      dispatch(
        appActions.saveTokens({
          accessToken: loginResult.data.access_token,
          idToken: loginResult.data.id_token,
        })
      );
      setShowLoginAlert(true);
      tokenApiCalled.current = false;
    } else if (loginResult.error !== undefined) {
      setShowLoginAlert(true);
      tokenApiCalled.current = false;
    }
  }, [dispatch, loginResult]);

  useEffect(() => {
    if (isPasskeyRedirect) {
      setShowPasskeyAlert(true);
    }
  }, [isPasskeyRedirect]);

  if (getServicesResult.isLoading) {
    return <CircularProgress />;
  } else if (getServicesResult.error !== undefined) {
    return (
      <p className="text-red-500">
        {createErrorString(getServicesResult.error)}
      </p>
    );
  } else {
    return (
      <>
        {/* Each card takes up 4 columns */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {/* TransitionGroup is needed to animate items disappearing */}
          {/* Don't add an extra div to the grid */}
          <TransitionGroup component={Fragment}>
            {getServicesResult.data?.map((service) => (
              // Show a smooth transition when cards appear or disappear
              <Grow key={service.Id}>
                <Grid size={{ xs: 4 }}>
                  <ServiceCard service={service} />
                </Grid>
              </Grow>
            ))}
          </TransitionGroup>
        </Grid>
        <AccountSnackbar
          open={showLoginAlert}
          isSuccess={isLoggedIn}
          successMessage="Logged in successfully!"
          errorMessage="Failed to log in, please try again later."
          onClose={handleCloseLoginAlert}
        />
        <AccountSnackbar
          open={showPasskeyAlert}
          isSuccess={passkeySuccess}
          successMessage="Successfully added a new passkey!"
          errorMessage="Failed to add a new passkey, please try again later."
          onClose={handleClosePasskeyAlert}
        />
      </>
    );
  }
};

export default Store;
