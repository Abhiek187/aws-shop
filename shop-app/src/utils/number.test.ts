import { describe, expect, it } from "vitest";
import { commaFormat, dollarFormat } from "./number";

describe("dollarFormat", () => {
  it("should omit any decimals with whole numbers", () => {
    expect(dollarFormat(0)).toBe("$0");
    expect(dollarFormat(5)).toBe("$5");
    expect(dollarFormat(325)).toBe("$325");
  });

  it("should add commas for large numbers", () => {
    expect(dollarFormat(1000)).toBe("$1,000");
    expect(dollarFormat(1e5)).toBe("$100,000");
    expect(dollarFormat(2e6)).toBe("$2,000,000");
  });

  it("should show 2 decimal places if there's one decimal place", () => {
    expect(dollarFormat(0.1)).toBe("$0.10");
    expect(dollarFormat(0.3)).toBe("$0.30");
  });

  it("should show all decimal places for small numbers", () => {
    expect(dollarFormat(3.14)).toBe("$3.14");
    expect(dollarFormat(1e-5)).toBe("$0.00001");
    expect(dollarFormat(8.6e-7)).toBe("$0.00000086");
    expect(dollarFormat(123.456)).toBe("$123.456");
    expect(dollarFormat(23e-4)).toBe("$0.0023");
    expect(dollarFormat(23e-8)).toBe("$0.00000023");
  });
});

describe("commaFormat", () => {
  it("shouldn't add commas for small numbers", () => {
    expect(commaFormat(0)).toBe("0");
    expect(commaFormat(23)).toBe("23");
    expect(commaFormat(0.667)).toBe("0.667");
    expect(commaFormat(987.65)).toBe("987.65");
  });

  it("should add commas for large numbers", () => {
    expect(commaFormat(1000)).toBe("1,000");
    expect(commaFormat(1e5)).toBe("100,000");
    expect(commaFormat(2e6)).toBe("2,000,000");
  });
});
