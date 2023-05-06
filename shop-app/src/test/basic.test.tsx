import React from "react";
import renderer from "react-test-renderer";
import { expect, test } from "vitest";

import App from "../App";

function toJson(component: renderer.ReactTestRenderer) {
  const result = component.toJSON();
  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(Array);
  return result as renderer.ReactTestRendererJSON;
}

test("Renders Vite default page", () => {
  const component = renderer.create(<App />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();

  const testInstance = component.root;
  const countButton = testInstance.findByProps({ className: "read-the-docs" });
  expect(countButton).toBeTruthy();
});
