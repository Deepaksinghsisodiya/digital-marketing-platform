import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { OverviewPanel } from "./OverviewPanel";
import type { ThemeSettingsDto, ThemeSummaryDto } from "../../../types";
import type { ConfigMutator } from "../themeStudioUtils";

const mockThemes: ThemeSummaryDto[] = [
  {
    id: "theme-1",
    name: "Cyber Emerald",
    slug: "cyber-emerald",
    description: "Default engineering theme",
    isSystem: true,
    isDefault: true,
    isDeleted: false,
    hasDraft: false,
    currentVersion: 1,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
  },
  {
    id: "theme-2",
    name: "Aurora Finance",
    slug: "aurora-finance",
    description: "Custom corporate palette",
    isSystem: false,
    isDefault: false,
    isDeleted: false,
    hasDraft: true,
    currentVersion: 3,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
  },
];

const mockSettings: ThemeSettingsDto = {
  globalEngineEnabled: true,
  websiteThemeEnabled: true,
  websiteThemeId: "cyber-emerald",
  adminThemeEnabled: true,
  adminThemeId: "cyber-emerald",
  fallbackThemeId: "cyber-emerald",
  versionToken: "TOKEN123",
  updatedAtUtc: null,
};

describe("OverviewPanel", () => {
  it("renders theme identity fields and mutates name on change", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    const onToggleSettings = vi.fn();
    const onAssign = vi.fn();

    render(
      <OverviewPanel
        config={CYBER_EMERALD_PRESET}
        mutate={mutate}
        settings={mockSettings}
        themes={mockThemes}
        selectedThemeId="theme-1"
        onToggleSettings={onToggleSettings}
        onAssign={onAssign}
      />,
    );

    expect(screen.getByDisplayValue(CYBER_EMERALD_PRESET.name)).toBeDefined();
    expect(screen.getByDisplayValue(CYBER_EMERALD_PRESET.tagline)).toBeDefined();

    const nameInput = screen.getByLabelText("Theme name");
    fireEvent.change(nameInput, { target: { value: "Updated Theme Name" } });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const updated = mutator(CYBER_EMERALD_PRESET);
    expect(updated.name).toBe("Updated Theme Name");
  });

  it("toggles the global theme engine switch", () => {
    const onToggleSettings = vi.fn();

    render(
      <OverviewPanel
        config={CYBER_EMERALD_PRESET}
        mutate={vi.fn()}
        settings={mockSettings}
        themes={mockThemes}
        selectedThemeId="theme-1"
        onToggleSettings={onToggleSettings}
        onAssign={vi.fn()}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Global theme engine" });
    fireEvent.click(toggle);

    expect(onToggleSettings).toHaveBeenCalledWith({ globalEngineEnabled: false });
  });

  it("handles assignment to website and admin targets", () => {
    const onAssign = vi.fn();

    render(
      <OverviewPanel
        config={CYBER_EMERALD_PRESET}
        mutate={vi.fn()}
        settings={mockSettings}
        themes={mockThemes}
        selectedThemeId="theme-2" // Aurora Finance
        onToggleSettings={vi.fn()}
        onAssign={onAssign}
      />,
    );

    const assignWebsiteBtn = screen.getByRole("button", {
      name: "Assign to Website",
    });
    fireEvent.click(assignWebsiteBtn);
    expect(onAssign).toHaveBeenCalledWith("website");

    const assignAdminBtn = screen.getByRole("button", {
      name: "Assign to Admin",
    });
    fireEvent.click(assignAdminBtn);
    expect(onAssign).toHaveBeenCalledWith("admin");

    const assignBothBtn = screen.getByRole("button", {
      name: "Assign to Both",
    });
    fireEvent.click(assignBothBtn);
    expect(onAssign).toHaveBeenCalledWith("both");
  });
});
