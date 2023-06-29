import { useEffect } from "react";
import { loadAllServices } from "../../actions/service";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { CircularProgress, Grid } from "@mui/material";
import ServiceCard from "./ServiceCard";

const Store = () => {
  const { error, loading, services } = useAppSelector((state) => state.service);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Don't make an API call if the state is already cached
    if (services.length === 0) {
      dispatch(loadAllServices());
    }
  }, [dispatch, services.length]);

  if (loading) {
    return <CircularProgress />;
  } else if (error !== undefined) {
    return <p className="text-red-500">{error}</p>;
  } else {
    return (
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        columns={{ xs: 4, sm: 8, md: 12 }}
      >
        {services.map((service) => (
          <Grid item xs={4} key={service.Id}>
            <ServiceCard service={service} />
          </Grid>
        ))}
      </Grid>
    );
  }
};

export default Store;
