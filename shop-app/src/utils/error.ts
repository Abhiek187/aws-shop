import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// FetchBaseQueryError = something went wrong with the request
// SerializedError = something went wrong while parsing the response
const isFetchError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === "object" && error !== null && Object.hasOwn(error, "status");

/**
 * Create a descriptive error message from an error object
 */
export const createErrorString = (
  error: FetchBaseQueryError | SerializedError
): string => {
  console.error(error);

  return isFetchError(error)
    ? `${error.status} ${JSON.stringify(
        (error as { error: string }).error ?? error.data
      )}`
    : `${error.name}: ${error.message}`;
};
