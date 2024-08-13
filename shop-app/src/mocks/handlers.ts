import { http, HttpResponse } from "msw";

import { Constants } from "../utils/constants";
import RawAWSService from "../types/RawAWSService";
import JWK from "../types/JWK";

export const mockStoreResponse: RawAWSService[] = [
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
];

const mockJWKResponse: JWK = {
  keys: [
    {
      alg: "RS256",
      e: "AQAB",
      kid: "PA+VzSNOjt9xqGmoEs9EvuSi0CCsmLe05infWSl9Tj8=",
      kty: "RSA",
      n: "vnN3ZiOOjHg-oyTXya2KmMYEtqpT9DGYPLXQLzjJG7uz0VOaYVKvgE8skoocPKsCdpCcvgCkgY1XGEvjf5GI6lfjh7p15AM82Hibq_Ek8NCbJ5AOfA4X5Ti8xGoqrPEhYAsd31aSNi92M6Kib-cPJDXaFo-hMsOBZ7v2_70joOW-w0hZnc68ADv_bF0ia9ccIUaO4wZKuAOdcdnz9pRX3_sL8CvAj05uuQQASUZRKzFiYuy5ZcMxygEeRQbd5Ylv-w03KpLLqc7AW5vJnscPzWzt9dyoH3mo-D457lq1W0BHaXiRIqMqF6ODDI6FrjSFAtAWQkTqqY3m6EByK7L1Ww",
      use: "sig",
    },
    {
      alg: "RS256",
      e: "AQAB",
      kid: "j3LqjGP+MGBEFFq/oVthk8Di/WWTFwxVS+mVunBNwMI=",
      kty: "RSA",
      n: "rmVj_mPGRss90ugMCRdoyCVPqjkyph0EekE4sBerFJe0P16B2pbI3Y5SCbHSkA7HdhhvA7W_g2TVVdG0J_6NNQ6n700QXhJhPetoiBGxfIFji77hHff3NBtj8TLi2tPoOrUFQWsep5fiMjs3-Tz41twYylQZKmjwXOStwTJjp-0LzhngOIP6epY3dQDVAH3KcrUz-KfHqaHzunYUv9POtHgHe12BG1RMX1Xp5lPnYGp3uvO_o9fkEwNUrJO66a1bIJUTwc1ZFHDJ7Ocs88gBysxm50IkmuS4DShWtqrQ9pHJOdApocfrGnOcoh4G5s4ZBlanKP_hTwbtmBz5y_Nxhw",
      use: "sig",
    },
  ],
};

export const handlers = [
  // Mock the AWS store microservice for tests
  http.get(`${Constants.BASE_URL}/`, () => {
    return HttpResponse.json(mockStoreResponse, { status: 200 });
  }),
  http.post(`${Constants.BASE_URL}/event`, () => {
    return HttpResponse.json("Accepted", { status: 202 });
  }),
  http.get(`${Constants.Cognito.IDP_BASE_URL}/.well-known/jwks.json`, () => {
    return HttpResponse.json(mockJWKResponse, { status: 200 });
  }),
];

export const errorHandlers = [
  // Create mocked error responses for each API
  http.get(`${Constants.BASE_URL}/`, () => {
    return HttpResponse.json("Unsupported route: GET /", { status: 400 });
  }),
];
