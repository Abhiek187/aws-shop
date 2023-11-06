import {
  Alert,
  CircularProgress,
  Grow,
  Snackbar,
  Unstable_Grid2,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect, useState } from "react";
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
  const { oauth } = useSelector(selectApp);
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

  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleCloseLoginAlert = () => {
    setShowLoginAlert(false);
  };

  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent<AuthorizeResponse>) => {
      if (
        event.origin === window.location.origin &&
        typeof event.data === "object" &&
        Object.hasOwn(event.data, "code") &&
        Object.hasOwn(event.data, "state") &&
        event.data.state === oauth.state
      ) {
        // Exchange the authorization code for JWTs
        // Don't call this more than once since the code will get invalidated
        void getToken({
          refresh: false,
          code: event.data.code,
          codeVerifier: oauth.codeVerifier,
        });
      }
    };

    window.addEventListener("message", handleMessageEvent);
    return () => window.removeEventListener("message", handleMessageEvent);
  }, [getToken, loginResult, oauth.codeVerifier, oauth.state]);

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
  }, [getToken, isRedirect, oauth.codeVerifier, oauth.state, searchParams]);

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
          autoHideDuration={3000}
          onClose={handleCloseLoginAlert}
        >
          <Alert
            onClose={handleCloseLoginAlert}
            severity="success"
            variant="filled"
          >
            Logged in successfully!
          </Alert>
        </Snackbar>
      </>
    );
  }
};

export default Store;
