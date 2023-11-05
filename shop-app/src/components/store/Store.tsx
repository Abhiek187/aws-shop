import { CircularProgress, Grow, Unstable_Grid2 } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { Fragment, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TransitionGroup } from "react-transition-group";
import { useDebounce } from "use-debounce";

import ServiceCard from "./ServiceCard";
import { useGetAWSServicesQuery } from "../../services/store";
import { createErrorString } from "../../utils/error";
import { useGetTokenMutation } from "../../services/auth";
import { Constants } from "../../utils/constants";

const Store = () => {
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
  console.log("loginResult", loginResult);

  useEffect(() => {
    if (
      isRedirect &&
      searchParams.get("state") ===
        sessionStorage.getItem(Constants.SessionStorage.STATE)
    ) {
      void getToken({ refresh: false });
    }
  }, [getToken, isRedirect, searchParams]);

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
