import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CYBER_EMERALD_PRESET } from "@nexora/design-tokens";
import { EffectsPanel } from "./EffectsPanel";
import type { ConfigMutator } from "../themeStudioUtils";

describe("EffectsPanel", () => {
  it("modifies shadow and glow values", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<EffectsPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    const glowInput = screen.getByLabelText("Glow");
    fireEvent.change(glowInput, {
      target: { value: "0 0 30px rgba(16, 185, 129, 0.45)" },
    });

    expect(mutate).toHaveBeenCalledTimes(1);
    const mutator = mutate.mock.calls[0]![0];
    const next = mutator(CYBER_EMERALD_PRESET);
    expect(next.shadows.glow).toBe("0 0 30px rgba(16, 185, 129, 0.45)");
  });

  it("toggles motion enabled and selects motion speed", () => {
    const mutate = vi.fn<(mutator: ConfigMutator) => void>();
    render(<EffectsPanel config={CYBER_EMERALD_PRESET} mutate={mutate} />);

    const motionToggle = screen.getByRole("switch", { name: "Enable motion" });
    fireEvent.click(motionToggle);

    expect(mutate).toHaveBeenCalledTimes(1);
    let mutator = mutate.mock.calls[0]![0];
    let next = mutator(CYBER_EMERALD_PRESET);
    expect(next.motion.enabled).toBe(false);

    const speedSelect = screen.getByLabelText("Motion speed");
    fireEvent.change(speedSelect, { target: { value: "fast" } });

    mutator = mutate.mock.calls[1]![0];
    next = mutator(CYBER_EMERALD_PRESET);
    expect(next.motion.speed).toBe("fast");
  });
});
