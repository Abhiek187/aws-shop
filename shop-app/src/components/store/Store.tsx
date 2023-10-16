import { CircularProgress, Grid } from "@mui/material";
import ServiceCard from "./ServiceCard";
import { useGetAWSServicesQuery } from "../../services/store";
import { createErrorString } from "../../utils/error";

const Store = () => {
  const { data: services, error, isLoading } = useGetAWSServicesQuery();

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
