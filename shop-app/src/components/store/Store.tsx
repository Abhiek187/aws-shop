import { useEffect } from "react";
import { loadAllServices } from "../../actions/service";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { CircularProgress } from "@mui/material";
import ServiceCard from "./ServiceCard";

const Store = () => {
  const { error, loading, services } = useAppSelector((state) => state.service);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAllServices());
  }, [dispatch]);

  return (
    <div>
      {loading ? (
        <CircularProgress />
      ) : (
        <div>
          {error ??
            services.map((service) => (
              <ServiceCard key={service.Id} service={service} />
            ))}
        </div>
      )}
    </div>
  );
};

export default Store;
