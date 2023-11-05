import { CircularProgress, Grow, Unstable_Grid2 } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect } from "react";
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

  useEffect(() => {
    // After getting redirected from the hosted UI, exchange the authorization code for JWTs
    if (isRedirect && searchParams.get("state") === oauth.state) {
      void getToken({ refresh: false, codeVerifier: oauth.codeVerifier });
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
      // Each card takes up 4 columns
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
    );
  }
};

export default Store;
