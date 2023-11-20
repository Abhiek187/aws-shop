// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
// extends Vitest's expect method with methods from react-testing-library
import "@testing-library/jest-dom/vitest";
import nodeFetch, { Request, Response } from "node-fetch";

import { server } from "./mocks/server";

// Fixes https://github.com/reduxjs/redux-toolkit/issues/3254#issuecomment-1587624955
Object.assign(global, { fetch: nodeFetch, Request, Response });

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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
