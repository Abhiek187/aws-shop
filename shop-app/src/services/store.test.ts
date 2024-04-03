import { describe, expect, it } from "vitest";
import { unmarshallAWSServices } from "./store";
import { mockStoreResponse } from "../mocks/handlers";
import AWSService from "../types/AWSService";

describe("unmarshallAWSServices", () => {
  it("should transform all attribute types", () => {
    const unmarshalledResponse: AWSService[] = [];

    for (const service of mockStoreResponse) {
      let freeTier: AWSService["FreeTier"] = undefined;

      if (service.FreeTier?.NULL === true) {
        freeTier = null;
      } else if (service.FreeTier?.N !== undefined) {
        freeTier = Number(service.FreeTier.N);
      }

      const awsService: AWSService = {
        Id: service.Id.S,
        Name: service.Name.S,
        Description: service.Description.S,
        Price: Number(service.Price.N),
        Unit: service.Unit.S,
        Category: service.Category.S,
      };

      if (freeTier !== undefined) {
        awsService.FreeTier = freeTier;
      }

      unmarshalledResponse.push(awsService);
    }

    expect(unmarshallAWSServices(mockStoreResponse)).toMatchObject(
      unmarshalledResponse
    );
  });
});
