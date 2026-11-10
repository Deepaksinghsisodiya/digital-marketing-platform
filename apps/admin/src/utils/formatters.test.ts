import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatDate } from "./formatters";

describe("Admin Locale-aware Formatters", () => {
  it("should format INR currency properly", () => {
    const formatted = formatCurrency(50000, "INR", "en-IN");
    expect(formatted).toContain("50,000");
  });

  it("should format numbers with proper separators", () => {
    const formatted = formatNumber(1234567, "en-IN");
    expect(formatted).toContain("12,34,567");
  });

  it("should format dates to readable string", () => {
    const date = new Date("2026-11-10T12:00:00Z");
    const formatted = formatDate(date, "en-IN");
    expect(formatted).toContain("2026");
  });
});
