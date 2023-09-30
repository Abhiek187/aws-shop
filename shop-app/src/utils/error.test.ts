import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import { createErrorString } from "./error";

describe("createErrorString", () => {
  it("should return the name and message for a SerializedError", () => {
    // Given a serialized error
    const error: SerializedError = {
      name: "TypeError",
      message: "Cannot read properties of null (reading 'map')",
      stack:
        "TypeError: Cannot read properties of null (reading 'map')\n    at transformResponse...",
    };
    // When creating the error string
    const errorMessage = createErrorString(error);
    // Then it should contain the error name and message
    expect(errorMessage).toBe(`${error.name}: ${error.message}`);
  });

  it("should return the error property if it exists", () => {
    // Given a fetch query error with an error key
    const error: FetchBaseQueryError = {
      status: "FETCH_ERROR",
      error: "TypeError: Failed to fetch",
    };
    // When creating the error string
    const errorMessage = createErrorString(error);
    // Then it should contain the error status and error message
    expect(errorMessage).toBe(`${error.status} ${JSON.stringify(error.error)}`);
  });

  it("should return the raw data if there's no error property", () => {
    // Given a fetch query error without an error key
    const error: FetchBaseQueryError = {
      status: 404,
      data: {
        message: "Not Found",
      },
    };
    // When creating the error string
    const errorMessage = createErrorString(error);
    // Then it should contain the error status and error message
    expect(errorMessage).toBe(`${error.status} ${JSON.stringify(error.data)}`);
  });
});
