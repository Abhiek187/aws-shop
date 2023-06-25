import { useEffect } from "react";
import { loadAllServices } from "../../actions/service";
import { useAppDispatch, useAppSelector } from "../../store/hooks";

const Store = () => {
  const { error, loading, services } = useAppSelector((state) => state.service);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadAllServices());
  }, [dispatch]);

  return (
    <p className="text-3xl font-bold underline">
      {loading ? "Loading..." : error ?? JSON.stringify(services)}
    </p>
  );
};

export default Store;
