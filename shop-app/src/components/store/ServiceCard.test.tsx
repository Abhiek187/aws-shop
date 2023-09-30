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
    const servicePrice = screen.getByText(RegExp(`${service.Price}`, "i"));
    const serviceUnit = screen.getByText(service.Unit);
    const serviceCategory = screen.getByText(
      RegExp(`Category: ${service.Category}`, "i")
    );
    const serviceFreeTier = screen.queryByText(
      RegExp(`${service.FreeTier}`, "i")
    );

    expect(serviceName).toBeInTheDocument();
    expect(serviceDescription).toBeInTheDocument();
    expect(servicePrice).toBeInTheDocument();
    expect(serviceUnit).toBeInTheDocument();
    expect(serviceCategory).toBeInTheDocument();

    if (service.FreeTier !== null) {
      expect(serviceFreeTier).toBeInTheDocument();
    } else {
      expect(serviceFreeTier).not.toBeInTheDocument();
    }
  });
});
