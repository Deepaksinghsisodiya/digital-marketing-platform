import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistoryPanel } from "./HistoryPanel";
import type { ThemeVersionDto } from "../../../types";

const mockVersions: ThemeVersionDto[] = [
  {
    id: "ver-2",
    versionNumber: 2,
    changeDescription: "Refined dark mode contrast",
    configJson: '{"id":"theme-1","version":2}',
    changedBy: "admin@nexora.local",
    changedAtUtc: new Date().toISOString(),
  },
  {
    id: "ver-1",
    versionNumber: 1,
    changeDescription: "Initial publish",
    configJson: '{"id":"theme-1","version":1}',
    changedBy: "admin@nexora.local",
    changedAtUtc: new Date(Date.now() - 86400000).toISOString(),
  },
];

describe("HistoryPanel", () => {
  it("renders immutable version list with current badge", () => {
    render(
      <HistoryPanel
        versions={mockVersions}
        loading={false}
        onRollback={vi.fn()}
      />,
    );

    expect(screen.getByText("v2")).toBeDefined();
    expect(screen.getByText("CURRENT")).toBeDefined();
    expect(screen.getByText("v1")).toBeDefined();
    expect(screen.getByText(/Refined dark mode contrast/i)).toBeDefined();
  });

  it("expands JSON view on View click and collapses on Hide", () => {
    render(
      <HistoryPanel
        versions={mockVersions}
        loading={false}
        onRollback={vi.fn()}
      />,
    );

    const viewButtons = screen.getAllByRole("button", { name: "View" });
    fireEvent.click(viewButtons[0]!);

    expect(screen.getByText('{"id":"theme-1","version":2}')).toBeDefined();

    const hideButton = screen.getByRole("button", { name: "Hide" });
    fireEvent.click(hideButton);

    expect(screen.queryByText('{"id":"theme-1","version":2}')).toBeNull();
  });

  it("allows restoring older version while disabling restore on current version", () => {
    const onRollback = vi.fn();
    render(
      <HistoryPanel
        versions={mockVersions}
        loading={false}
        onRollback={onRollback}
      />,
    );

    const restoreButtons = screen.getAllByRole("button", { name: "Restore" });
    // First button (current version v2) should be disabled
    expect((restoreButtons[0] as HTMLButtonElement).disabled).toBe(true);

    // Second button (older version v1) should be active
    expect((restoreButtons[1] as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(restoreButtons[1]!);
    expect(onRollback).toHaveBeenCalledWith(1);
  });
});
