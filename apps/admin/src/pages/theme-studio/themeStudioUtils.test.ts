import { describe, expect, it } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import {
  getByPath,
  parseThemeJson,
  setByPath,
  slugify,
} from "./themeStudioUtils";

describe("themeStudioUtils", () => {
  it("sets nested values immutably", () => {
    const updated = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.primary",
      "#ef4444",
    );
    expect(updated.colors.light.primary).toBe("#ef4444");
    expect(CYBER_EMERALD_PRESET.colors.light.primary).not.toBe("#ef4444");
  });

  it("reads nested values by path", () => {
    expect(getByPath(CYBER_EMERALD_PRESET, "typography.fontHeading")).toBe(
      CYBER_EMERALD_PRESET.typography.fontHeading,
    );
    expect(getByPath(CYBER_EMERALD_PRESET, "missing.path")).toBeUndefined();
  });

  it("parses theme JSON safely", () => {
    expect(parseThemeJson('{"name":"X"}')).toEqual({ name: "X" });
    expect(parseThemeJson("not-json")).toBeNull();
    expect(parseThemeJson(null)).toBeNull();
  });

  it("slugifies theme names", () => {
    expect(slugify("Aurora Finance!!")).toBe("aurora-finance");
    expect(slugify("  Multiple   Spaces  ")).toBe("multiple-spaces");
  });
});
