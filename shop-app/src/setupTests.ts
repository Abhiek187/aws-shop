// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
// extends Vitest's expect method with methods from react-testing-library
import "@testing-library/jest-dom/vitest";
import nodeFetch, { Request, Response } from "node-fetch";

import { server } from "./mocks/server.js";

Object.assign(global, { fetch: nodeFetch, Request, Response });

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Clean up after the tests are finished
afterAll(() => server.close());

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  // Reset any request handlers that may be added during the tests, so they don't affect other tests
  server.resetHandlers();
});
