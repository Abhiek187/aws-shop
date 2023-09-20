import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import { AppDispatch } from "../store";
import AWSService from "../types/AWSService";
import { Constants } from "../utils/constants";
import { GET_ALL_SERVICES, SERVICE_ERROR } from "./types";
import RawAWSService from "../types/RawAWSService";

export const loadAllServices = () => async (dispatch: AppDispatch) => {
  try {
    const res = await fetch(`${Constants.BASE_URL}/`);
    const json = (await res.json()) as RawAWSService[];
    // Remove the type strings from the resulting scan
    const awsServices = json.map(
      // Unmarshall only works on individual items, not an array of items
      (service) =>
        unmarshall(
          service as Record<string, NativeAttributeValue>
        ) as AWSService
    );

    dispatch({
      type: GET_ALL_SERVICES,
      payload: awsServices,
    });
  } catch (err) {
    const error = err as Error;
    console.error(error);

    dispatch({
      type: SERVICE_ERROR,
      payload: `${error.name}: ${error.message}`,
    });
  }
};
