import { AppDispatch } from "../store";
import { Constants } from "../utils/constants";
import { GET_ALL_SERVICES, SERVICE_ERROR } from "./types";

export const loadAllServices = () => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${Constants.BASE_URL}/`);
    const json = await res.json();

    dispatch({
      type: GET_ALL_SERVICES,
      payload: json,
    });
  } catch (err) {
    dispatch({
      type: SERVICE_ERROR,
      payload: err,
    });
  }
};
