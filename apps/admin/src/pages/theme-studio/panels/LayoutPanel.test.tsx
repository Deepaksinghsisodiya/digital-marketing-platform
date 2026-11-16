import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { LayoutPanel } from "./LayoutPanel";
import type { ConfigMutator } from "../themeStudioUtils";

describe("LayoutPanel", () => {
  it("modifies container width and navbar height", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<LayoutPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    const containerWidthInput = screen.getByLabelText("Container Width");
    fireEvent.change(containerWidthInput, { target: { value: "1440px" } });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.layout.containerWidth).toBe("1440px");
  });
});
