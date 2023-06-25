import { useEffect } from "react";
import { loadAllServices } from "../../actions/service";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Button } from "@mui/material";

const Store = () => {
  const { error, loading, services } = useAppSelector((state) => state.service);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAllServices());
  }, [dispatch]);

  return (
    <div>
      <p className="text-3xl font-bold underline">
        {loading ? "Loading..." : error ?? JSON.stringify(services)}
      </p>
      <Button variant="contained">Hello World</Button>
    </div>
  );
};

export default Store;
