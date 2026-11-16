import { describe, it, expect, beforeEach } from "vitest";
import { captureUtmParameters, getStoredUtmParameters } from "./utm";

describe("UTM Attribution Engine", () => {
  beforeEach(() => {
    // Clear storage before each test
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }
  });

  it("safely handles server-side or empty execution without errors", () => {
    const params = getStoredUtmParameters();
    expect(params).toBeDefined();
    expect(typeof params).toBe("object");
  });

  it("captures UTM parameters when present", () => {
    // Simulating browser environment
    if (typeof window !== "undefined") {
      window.history.pushState(
        {},
        "Test Page",
        "/?utm_source=google&utm_medium=cpc&utm_campaign=diwali_growth&utm_term=enterprise_seo",
      );

      const captured = captureUtmParameters();
      expect(captured?.utmSource).toBe("google");
      expect(captured?.utmMedium).toBe("cpc");
      expect(captured?.utmCampaign).toBe("diwali_growth");
      expect(captured?.utmTerm).toBe("enterprise_seo");

      const stored = getStoredUtmParameters();
      expect(stored.utmSource).toBe("google");
      expect(stored.utmMedium).toBe("cpc");
    }
  });
});
