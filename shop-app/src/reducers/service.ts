import { PayloadAction } from "@reduxjs/toolkit";
import { GET_ALL_SERVICES, SERVICE_ERROR } from "../actions/types";

export type ServiceState = {
  error: any;
  loading: boolean;
  services: any[];
};

const initialState: ServiceState = {
  error: {},
  loading: true,
  services: [],
};

export default function (
  state = initialState,
  action: PayloadAction<any>
): ServiceState {
  const { type, payload } = action;

  switch (type) {
    case GET_ALL_SERVICES:
      return {
        ...state,
        loading: false,
        services: payload,
      };
    case SERVICE_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
}
