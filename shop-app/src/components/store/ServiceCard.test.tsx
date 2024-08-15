import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import ServiceCard from "./ServiceCard";
import AWSService from "../../types/AWSService";
import { createStore } from "../../store";
import * as analytics from "../../utils/analytics";

const storeEventSpy = vi.spyOn(analytics, "storeEvent");

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
    render(
      <Provider store={createStore()}>
        <ServiceCard service={service} />
      </Provider>
    );

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

    const buyButton = screen.getByRole("button");
    expect(buyButton).toBeInTheDocument();
    fireEvent.click(buyButton);
    expect(storeEventSpy).toHaveBeenCalledWith({
      serviceName: service.Name,
    });
  });
});
