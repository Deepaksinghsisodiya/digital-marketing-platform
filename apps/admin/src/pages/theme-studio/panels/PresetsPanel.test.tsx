import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SYSTEM_THEME_PRESETS } from "@nexora/design-tokens";
import { PresetsPanel } from "./PresetsPanel";
import type { ThemeSummaryDto } from "../../../types";

const themes: ThemeSummaryDto[] = SYSTEM_THEME_PRESETS.map((preset, index) => ({
  id: `theme-${index}`,
  name: preset.name,
  slug: preset.slug,
  description: "",
  isSystem: true,
  isDefault: preset.slug === "cyber-emerald",
  isDeleted: false,
  hasDraft: false,
  currentVersion: 1,
  createdAtUtc: new Date().toISOString(),
  updatedAtUtc: null,
}));

describe("PresetsPanel", () => {
  it("previews a system preset without saving", () => {
    const onPreviewPreset = vi.fn();
    render(
      <PresetsPanel
        themes={themes}
        onPreviewPreset={onPreviewPreset}
        onOpenTheme={vi.fn()}
        onDuplicateTheme={vi.fn()}
      />,
    );

    const preset = SYSTEM_THEME_PRESETS[0]!;
    const card = screen.getByText(preset.name).closest("article")!;
    fireEvent.click(within(card).getByText("Preview"));

    expect(onPreviewPreset).toHaveBeenCalledWith(
      expect.objectContaining({ slug: preset.slug }),
    );
  });

  it("opens the managed theme record", () => {
    const onOpenTheme = vi.fn();
    render(
      <PresetsPanel
        themes={themes}
        onPreviewPreset={vi.fn()}
        onOpenTheme={onOpenTheme}
        onDuplicateTheme={vi.fn()}
      />,
    );

    const preset = SYSTEM_THEME_PRESETS[1]!;
    const card = screen.getByText(preset.name).closest("article")!;
    fireEvent.click(within(card).getByText("Open"));

    expect(onOpenTheme).toHaveBeenCalledWith("theme-1");
  });

  it("duplicates a preset into an editable theme", () => {
    const onDuplicateTheme = vi.fn();
    render(
      <PresetsPanel
        themes={themes}
        onPreviewPreset={vi.fn()}
        onOpenTheme={vi.fn()}
        onDuplicateTheme={onDuplicateTheme}
      />,
    );

    const preset = SYSTEM_THEME_PRESETS[2]!;
    const card = screen.getByText(preset.name).closest("article")!;
    fireEvent.click(within(card).getByText("Duplicate"));

    expect(onDuplicateTheme).toHaveBeenCalledWith("theme-2");
  });
});
