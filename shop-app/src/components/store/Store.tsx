import { CircularProgress, Grow, Unstable_Grid2 } from "@mui/material";
import { Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { TransitionGroup } from "react-transition-group";
import { useDebounce } from "use-debounce";

import ServiceCard from "./ServiceCard";
import { useGetAWSServicesQuery } from "../../services/store";
import { createErrorString } from "../../utils/error";

const Store = () => {
  const [searchParams] = useSearchParams();
  // Throttle API calls for efficiency every time the input changes
  const [debouncedSearchParams] = useDebounce(searchParams, 500);
  const {
    data: services,
    error,
    isLoading,
  } = useGetAWSServicesQuery(
    // Convert URLSearchParams to a serializable object
    Object.fromEntries(debouncedSearchParams.entries())
  );

  if (isLoading) {
    return <CircularProgress />;
  } else if (error !== undefined) {
    return <p className="text-red-500">{createErrorString(error)}</p>;
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
          {services?.map((service) => (
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
