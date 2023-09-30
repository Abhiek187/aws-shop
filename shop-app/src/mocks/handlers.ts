import { rest } from "msw";

import { Constants } from "../utils/constants";
import RawAWSService from "../types/RawAWSService";

export const handlers = [
  // Mock the AWS store microservice for tests
  rest.get(`${Constants.BASE_URL}/`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<RawAWSService[]>([
        {
          Id: {
            S: "0",
          },
          Name: {
            S: "Lambda",
          },
          Description: {
            S: "Run code in under 15 minutes",
          },
          Price: {
            N: "2e-7",
          },
          Unit: {
            S: "invocation",
          },
          Category: {
            S: "free",
          },
          FreeTier: {
            N: "1e6",
          },
        },
        {
          Id: {
            S: "1",
          },
          Name: {
            S: "Auto Scaling",
          },
          Description: {
            S: "Automatically scale the number of EC2 instances with demand",
          },
          Price: {
            N: "0",
          },
          Unit: {
            S: "group",
          },
          Category: {
            S: "free",
          },
          FreeTier: {
            NULL: true,
          },
        },
        {
          Id: {
            S: "2",
          },
          Name: {
            S: "EC2",
          },
          Description: {
            S: "Servers in the cloud",
          },
          Price: {
            N: "7.2",
          },
          Unit: {
            S: "instance",
          },
          Category: {
            S: "trial",
          },
        },
        {
          Id: {
            S: "3",
          },
          Name: {
            S: "Config",
          },
          Description: {
            S: "Audit the configuration of AWS resources",
          },
          Price: {
            N: "0.003",
          },
          Unit: {
            S: "configuration item",
          },
          Category: {
            S: "paid",
          },
        },
      ])
    );
  }),
];
