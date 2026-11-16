import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { AdvancedPanel } from "./AdvancedPanel";

describe("AdvancedPanel", () => {
  it("displays raw JSON configuration and version information", () => {
    render(
      <AdvancedPanel
        config={CYBER_EMERALD_PRESET}
        onApplyJson={vi.fn()}
        versionToken="ABCD1234"
        publishedVersion={2}
      />,
    );

    expect(screen.getByText("v2")).toBeDefined();
    expect(screen.getByText("ABCD1234")).toBeDefined();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toContain(CYBER_EMERALD_PRESET.name);
  });

  it("applies valid JSON and handles validation error return", () => {
    const onApplyJson = vi.fn().mockReturnValue("Primary color is invalid");
    render(
      <AdvancedPanel
        config={CYBER_EMERALD_PRESET}
        onApplyJson={onApplyJson}
        versionToken="ABCD1234"
        publishedVersion={2}
      />,
    );

    const applyBtn = screen.getByRole("button", { name: "Validate & Apply" });
    fireEvent.click(applyBtn);

    expect(onApplyJson).toHaveBeenCalled();
    expect(screen.getByText("Primary color is invalid")).toBeDefined();
  });

  it("resets editor to original JSON on Reset click", () => {
    render(
      <AdvancedPanel
        config={CYBER_EMERALD_PRESET}
        onApplyJson={vi.fn()}
        versionToken="ABCD1234"
        publishedVersion={2}
      />,
    );

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"modified":true}' } });
    expect(textarea.value).toBe('{"modified":true}');

    const resetBtn = screen.getByRole("button", { name: "Reset Editor" });
    fireEvent.click(resetBtn);

    expect(textarea.value).toContain(CYBER_EMERALD_PRESET.name);
  });
});
