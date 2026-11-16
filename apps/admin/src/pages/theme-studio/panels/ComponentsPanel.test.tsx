import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { ComponentsPanel } from "./ComponentsPanel";
import type { ConfigMutator } from "../themeStudioUtils";

describe("ComponentsPanel", () => {
  it("changes button style, card style and table density", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<ComponentsPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    const buttonStyleSelect = screen.getByLabelText("Button style");
    fireEvent.change(buttonStyleSelect, { target: { value: "pill" } });

    expect(mutate).toHaveBeenCalledTimes(1);
    let mutator = mutate.mock.calls[0]![0];
    let next = mutator(CYBER_EMERALD_PRESET);
    expect(next.components.buttonStyle).toBe("pill");

    const cardStyleSelect = screen.getByLabelText("Card style");
    fireEvent.change(cardStyleSelect, { target: { value: "glass" } });
    mutator = mutate.mock.calls[1]![0];
    next = mutator(CYBER_EMERALD_PRESET);
    expect(next.components.cardStyle).toBe("glass");

    const tableDensitySelect = screen.getByLabelText("Table density");
    fireEvent.change(tableDensitySelect, { target: { value: "compact" } });
    mutator = mutate.mock.calls[2]![0];
    next = mutator(CYBER_EMERALD_PRESET);
    expect(next.components.tableDensity).toBe("compact");
  });

  it("updates shape radii tokens like buttonRadius and cardRadius", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<ComponentsPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    const buttonRadiusInput = screen.getByLabelText("Button Radius");
    fireEvent.change(buttonRadiusInput, { target: { value: "9999px" } });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.shape.buttonRadius).toBe("9999px");
  });
});
