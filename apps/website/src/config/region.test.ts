import { describe, it, expect } from "vitest";
import { resolveRegion, REGION_CONFIG } from "./region";

describe("Region Resolution Foundation", () => {
  it("should resolve India as default when no region code is provided", () => {
    const region = resolveRegion();
    expect(region.code).toBe("IN");
    expect(region.defaultLocale).toBe("en-IN");
    expect(region.currency).toBe("INR");
  });

  it("should resolve United States when US is provided", () => {
    const region = resolveRegion("US");
    expect(region.code).toBe("US");
    expect(region.defaultLocale).toBe("en-US");
    expect(region.currency).toBe("USD");
  });

  it("should fallback to default region for unsupported codes", () => {
    const region = resolveRegion("UNKNOWN_CODE");
    expect(region.code).toBe(REGION_CONFIG.defaultRegion);
  });
});
