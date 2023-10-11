import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ServiceCard from "./ServiceCard";
import AWSService from "../../types/AWSService";

describe("ServiceCard", () => {
  it("should render the service card", () => {
    const service: AWSService = {
      Id: "0",
      Name: "Lambda",
      Description: "Run code in under 15 minutes",
      Price: 2e-7,
      Unit: "invocation",
      Category: "free",
      FreeTier: 1e6,
    };
    render(<ServiceCard service={service} />);

    const serviceName = screen.getByText(service.Name);
    const serviceDescription = screen.getByText(service.Description);
    const serviceCategory = screen.getByText(service.Category);
    const serviceUnit = screen.queryAllByText(RegExp(service.Unit)); // can appear multiple times
    const serviceFreeTier = screen.queryByText(/Free Tier:/);

    expect(serviceName).toBeInTheDocument();
    expect(serviceDescription).toBeInTheDocument();
    expect(serviceCategory).toBeInTheDocument();
    expect(serviceUnit.length).toBeGreaterThan(0);

    if (service.FreeTier !== null && service.FreeTier !== undefined) {
      expect(serviceFreeTier).toBeInTheDocument();
    } else {
      expect(serviceFreeTier).not.toBeInTheDocument();
    }
  });
});
