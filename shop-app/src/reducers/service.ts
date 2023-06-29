import { PayloadAction } from "@reduxjs/toolkit";
import { GET_ALL_SERVICES, SERVICE_ERROR } from "../actions/types";
import AWSService from "../types/AWSService";

export type ServiceState = {
  error?: string;
  loading: boolean;
  services: AWSService[];
};

const initialState: ServiceState = {
  error: undefined,
  loading: true,
  services: [],
};

export default function (
  state = initialState,
  action: PayloadAction<string | AWSService[] | undefined>
): ServiceState {
  const { type, payload } = action;

  switch (type) {
    case GET_ALL_SERVICES:
      return {
        ...state,
        error: undefined,
        loading: false,
        services: payload as AWSService[],
      };
    case SERVICE_ERROR:
      return {
        ...state,
        error: payload as string | undefined,
        loading: false,
      };
    default:
      return state;
  }
}
