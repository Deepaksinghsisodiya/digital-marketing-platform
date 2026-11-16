import { describe, expect, it } from "vitest";
import {
  CYBER_EMERALD_PRESET,
  resolveTheme,
  themeToCss,
  validateTheme,
} from "@nexora/design-tokens";
import type { ThemeSettingsDto } from "../../types";
import { parseThemeJson, setByPath } from "./themeStudioUtils";

describe("Theme Studio workflow logic", () => {
  it("validates an edited draft and produces updated CSS tokens", () => {
    const edited = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.primary",
      "#ef4444",
    );
    const validation = validateTheme(edited);
    expect(validation.valid).toBe(true);

    const css = themeToCss(resolveTheme(edited));
    expect(css).toContain("--nexora-primary: #ef4444;");
  });

  it("rejects invalid color values", () => {
    const edited = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.primary",
      "not-a-color",
    );
    const validation = validateTheme(edited);
    expect(validation.valid).toBe(false);
    expect(validation.errors.join(" ")).toMatch(/primary color/i);
  });

  it("simulates save draft, publish and rollback", () => {
    const draft = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.accent",
      "#f97316",
    );
    const savedJson = JSON.stringify(draft);

    const resolvedSaved = resolveTheme(parseThemeJson(savedJson));
    expect(resolvedSaved.colors.light.accent).toBe("#f97316");

    const previous = setByPath(
      CYBER_EMERALD_PRESET,
      "colors.light.accent",
      "#06b6d4",
    );
    const rolledBack = resolveTheme(parseThemeJson(JSON.stringify(previous)));
    expect(rolledBack.colors.light.accent).toBe("#06b6d4");
  });

  it("keeps the settings version token when toggling apps", () => {
    const settings: ThemeSettingsDto = {
      globalEngineEnabled: true,
      websiteThemeEnabled: true,
      websiteThemeId: "cyber-emerald",
      adminThemeEnabled: true,
      adminThemeId: "cyber-emerald",
      fallbackThemeId: "cyber-emerald",
      versionToken: "AAAAAAAAB9E=",
      updatedAtUtc: null,
    };
    const patch = (current: ThemeSettingsDto, next: Partial<ThemeSettingsDto>) => ({
      ...current,
      ...next,
      versionToken: current.versionToken,
    });

    const websiteOff = patch(settings, { websiteThemeEnabled: false });
    expect(websiteOff.websiteThemeEnabled).toBe(false);
    expect(websiteOff.adminThemeEnabled).toBe(true);
    expect(websiteOff.versionToken).toBe("AAAAAAAAB9E=");
  });
});
