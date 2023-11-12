import {
  Alert,
  CircularProgress,
  Grow,
  Snackbar,
  Unstable_Grid2,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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

const Store = () => {
  const { isLoggedIn, oauth } = useSelector(selectApp);
  const dispatch = useDispatch();

  const [searchParams] = useSearchParams();
  // Throttle API calls for efficiency every time the input changes
  const [debouncedSearchParams] = useDebounce(searchParams, 500);

  // Convert URLSearchParams to a serializable object
  const searchParamsObject = Object.fromEntries(
    debouncedSearchParams.entries()
  );
  const isRedirect = searchParams.has("code") || searchParams.has("state");

  const getServicesResult = useGetAWSServicesQuery(
    isRedirect ? skipToken : searchParamsObject
  );
  const [getToken, loginResult] = useGetTokenMutation();
  // Prevent the token API from being called twice in strict mode
  const tokenApiCalled = useRef(false);

  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleCloseLoginAlert = () => {
    setShowLoginAlert(false);
  };

  useEffect(() => {
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

      if (event.data.state === oauth.state && !tokenApiCalled.current) {
        // Exchange the authorization code for JWTs
        // Don't call this more than once since the code will get invalidated
        void getToken({
          refresh: false,
          code: event.data.code,
          codeVerifier: oauth.codeVerifier,
        });
        tokenApiCalled.current = true;
      } else if (event.data.state !== oauth.state) {
        // This can also happen if the user refreshes the page before they finish entering their credentials
        // (The Redux store is cleared and the client forgets what it generated.)
        console.error(
          "The authorization server didn't return the correct state. We just saved you from a CSRF attack! 😊"
        );
        setShowLoginAlert(true);
      }
    };

    window.addEventListener("message", handleMessageEvent);
    return () => window.removeEventListener("message", handleMessageEvent);
  }, [getToken, oauth.codeVerifier, oauth.state]);

  useEffect(() => {
    // Close the current tab and alert the parent tab after getting redirected from the hosted UI
    if (isRedirect) {
      // window.opener === parent tab
      // Enforce same-origin targets
      (window.opener as Window | null)?.postMessage({
        code: searchParams.get("code"),
        state: searchParams.get("state"),
      });
      window.close();
    }
  }, [isRedirect, searchParams]);

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
        <Unstable_Grid2
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
                <Unstable_Grid2 xs={4}>
                  <ServiceCard service={service} />
                </Unstable_Grid2>
              </Grow>
            ))}
          </TransitionGroup>
        </Unstable_Grid2>
        <Snackbar
          open={showLoginAlert}
          autoHideDuration={5000}
          onClose={handleCloseLoginAlert}
        >
          <Alert
            onClose={handleCloseLoginAlert}
            severity={isLoggedIn ? "success" : "error"}
            variant="filled"
          >
            {isLoggedIn
              ? "Logged in successfully!"
              : "Failed to log in, please try again later."}
          </Alert>
        </Snackbar>
      </>
    );
  }
};

export default Store;
