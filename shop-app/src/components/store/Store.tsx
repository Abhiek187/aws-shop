import { CircularProgress, Grid } from "@mui/material";
import { useSearchParams } from "react-router-dom";
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
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {services?.map((service) => (
          <Grid item xs={4} key={service.Id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default Store;
