import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { Constants } from "../utils/constants";
import AWSService from "../types/AWSService";
import RawAWSService from "../types/RawAWSService";

/**
 * Remove attribute types from DynamoDB responses
 */
export const unmarshallAWSServices = (
  rawServices: RawAWSService[]
): AWSService[] =>
  rawServices.map(
    // Unmarshall only works on individual items, not an array of items
    (service) =>
      unmarshall(service as Record<string, NativeAttributeValue>) as AWSService
  );

export const storeApi = createApi({
  reducerPath: "storeApi",
  baseQuery: fetchBaseQuery({ baseUrl: Constants.BASE_URL }),
  endpoints: (builder) => ({
    // void = no parameters in query
    getAWSServices: builder.query<AWSService[], Record<string, string> | void>({
      // params = first argument passed to use...Query()
      // Return object based on AxiosRequestConfig: https://axios-http.com/docs/req_config
      query: (params) => ({
        url: "/",
        params: params ?? undefined,
      }),
      transformResponse: unmarshallAWSServices,
    }),
  }),
});

export const { useGetAWSServicesQuery } = storeApi;
