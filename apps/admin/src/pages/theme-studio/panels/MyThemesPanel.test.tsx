import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MyThemesPanel } from "./MyThemesPanel";
import type { ThemeSummaryDto } from "../../../types";

const themes: ThemeSummaryDto[] = [
  {
    id: "theme-1",
    name: "Custom Aurora",
    slug: "custom-aurora",
    description: "",
    isSystem: false,
    isDefault: false,
    isDeleted: false,
    hasDraft: true,
    currentVersion: 2,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
  },
  {
    id: "theme-2",
    name: "Cyber Emerald",
    slug: "cyber-emerald",
    description: "",
    isSystem: true,
    isDefault: true,
    isDeleted: false,
    hasDraft: false,
    currentVersion: 1,
    createdAtUtc: new Date().toISOString(),
    updatedAtUtc: null,
  },
];

function setup(overrides: Partial<React.ComponentProps<typeof MyThemesPanel>> = {}) {
  const props = {
    themes,
    selectedThemeId: "theme-1",
    onSelect: vi.fn(),
    onCreate: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onImport: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  } as React.ComponentProps<typeof MyThemesPanel>;
  render(<MyThemesPanel {...props} />);
  return props;
}

describe("MyThemesPanel", () => {
  it("creates a new theme from the name field", () => {
    const props = setup();
    fireEvent.change(screen.getByLabelText("New theme name"), {
      target: { value: "Aurora Finance" },
    });
    fireEvent.click(screen.getByText("Create"));
    expect(props.onCreate).toHaveBeenCalledWith("Aurora Finance");
  });

  it("exports a theme", () => {
    const props = setup();
    const row = screen.getByTestId("theme-card-theme-1");
    fireEvent.click(withinRow(row, "Export"));
    expect(props.onExport).toHaveBeenCalledWith("theme-1");
  });

  it("blocks deleting system/default themes", () => {
    setup();
    const row = screen.getByTestId("theme-card-theme-2");
    const button = withinRow(row, "Delete") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("imports a validated theme JSON payload", () => {
    const props = setup();
    fireEvent.change(screen.getByLabelText("Theme name"), {
      target: { value: "Imported Theme" },
    });
    fireEvent.change(screen.getByLabelText("Theme JSON"), {
      target: { value: '{"name":"Imported Theme"}' },
    });
    fireEvent.click(screen.getByText("Import Theme"));
    expect(props.onImport).toHaveBeenCalledWith(
      "Imported Theme",
      '{"name":"Imported Theme"}',
    );
  });
});

function withinRow(row: HTMLElement, label: string): HTMLElement {
  const buttons = Array.from(row.querySelectorAll("button"));
  const button = buttons.find((element) => element.textContent?.trim() === label);
  if (!button) throw new Error(`Button "${label}" not found`);
  return button as HTMLElement;
}
